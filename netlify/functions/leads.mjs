// Seguimiento de leads.
// GET  → descifra leads.enc de la rama "datos" (lo actualiza la tarea diaria que lee Outlook)
//        y le suma las marcas de "Enviado" guardadas en Netlify Blobs (compartidas entre equipos).
// POST {id, enviado} o {id, sinwa} → guarda la marca de "Enviado" o de "No tiene WhatsApp" de un lead.
// Todo requiere el código de acceso del contestador y además la contraseña de Leads (LEADS_PASSWORD).

import { getStore } from "@netlify/blobs";
import { createDecipheriv, privateDecrypt, constants } from "node:crypto";

const REPO = process.env.LEADS_REPO || "strategomx12-ship-it/petguro-contestador";
const RAMA = process.env.LEADS_BRANCH || "datos";

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

function llavePrivada() {
  const v = process.env.LEADS_PRIVATE_KEY || "";
  return v.includes("BEGIN") ? v.replace(/\\n/g, "\n") : Buffer.from(v, "base64").toString("utf8");
}

async function leerLeads() {
  // La API de contenidos de GitHub no tiene la caché de 5 min de raw.githubusercontent.com.
  let r = await fetch(`https://api.github.com/repos/${REPO}/contents/leads.enc?ref=${RAMA}`, {
    headers: { Accept: "application/vnd.github.raw", "User-Agent": "petguro-contestador" },
  });
  if (!r.ok) r = await fetch(`https://raw.githubusercontent.com/${REPO}/${RAMA}/leads.enc?t=${Date.now()}`);
  if (!r.ok) throw new Error(`No se pudo leer el archivo de leads (${r.status})`);
  const s = await r.json();
  const key = privateDecrypt({ key: llavePrivada(), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, Buffer.from(s.ek, "base64"));
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(s.iv, "base64"));
  d.setAuthTag(Buffer.from(s.tag, "base64"));
  const txt = Buffer.concat([d.update(Buffer.from(s.ct, "base64")), d.final()]).toString("utf8");
  return { data: JSON.parse(txt), sellado: s.sellado };
}

export default async (req) => {
  const required = process.env.ACCESS_CODE;
  if (required && req.headers.get("x-access-code") !== required) return json({ error: "Código de acceso incorrecto" }, 401);
  const extra = process.env.LEADS_PASSWORD;
  if (extra && req.headers.get("x-leads-pass") !== extra) return json({ error: "Contraseña de Leads incorrecta", need: "leads-pass" }, 403);
  const store = getStore({ name: "leads", consistency: "strong" });

  if (req.method === "GET") {
    try {
      const { data, sellado } = await leerLeads();
      const [enviados, sinwa] = await Promise.all([store.get("enviados", { type: "json" }), store.get("sinwa", { type: "json" })]);
      return json({ ...data, sellado, enviados: enviados || {}, sinwa: sinwa || {} });
    } catch (e) {
      return json({ error: e.message || "Error al cargar los leads" }, 500);
    }
  }

  if (req.method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Solicitud inválida" }, 400); }
    const id = String(b.id || "").slice(0, 200);
    if (!id) return json({ error: "Falta el id" }, 400);
    for (const campo of ["enviado", "sinwa"]) {
      if (!(campo in b)) continue;
      const clave = campo === "enviado" ? "enviados" : "sinwa";
      const m = (await store.get(clave, { type: "json" })) || {};
      if (b[campo]) m[id] = true; else if (campo === "enviado") m[id] = false; else delete m[id];
      await store.setJSON(clave, m);
    }
    return json({ ok: true });
  }

  return json({ error: "Método no permitido" }, 405);
};

export const config = { path: "/api/leads" };
