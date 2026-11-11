// Asigna el folio de una cotización (PG-AAMMDD-NNNN), continuando la numeración del generador anterior.
// Si la misma cotización (cliente + mascotas) se vuelve a generar, devuelve el mismo folio y su fecha original.
// Cada número se "aparta" con onlyIfNew, así dos cotizaciones simultáneas nunca comparten folio.

import { getStore } from "@netlify/blobs";

const ULTIMO_ANTERIOR = 14; // último folio del generador de escritorio (PG-261110-0014)

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const norm = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function hoyMx() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const required = process.env.ACCESS_CODE;
  if (required && req.headers.get("x-access-code") !== required) return json({ error: "Código de acceso incorrecto" }, 401);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Solicitud inválida" }, 400); }
  const nombre = norm(body.nombre);
  const mascotas = (Array.isArray(body.mascotas) ? body.mascotas : []).map(norm).filter(Boolean);
  if (!nombre || !mascotas.length) return json({ error: "Falta el nombre o las mascotas" }, 400);
  const clave = `${nombre}|${mascotas.join(" y ")}`.slice(0, 500);

  const store = getStore({ name: "cotizaciones", consistency: "strong" });
  const previo = await store.get(`c/${clave}`, { type: "json" });
  if (previo) return json({ ...previo, nuevo: false });

  const fecha = hoyMx();
  const ultimo = Number(await store.get("ultimo")) || ULTIMO_ANTERIOR;
  let n = Math.max(ultimo, ULTIMO_ANTERIOR) + 1;
  for (let i = 0; i < 50; i++, n++) {
    const { modified } = await store.set(`n/${String(n).padStart(4, "0")}`, clave, { onlyIfNew: true });
    if (modified) break;
  }
  const folio = `PG-${fecha.slice(2, 4)}${fecha.slice(5, 7)}${fecha.slice(8, 10)}-${String(n).padStart(4, "0")}`;
  const reg = { folio, fecha };
  await store.setJSON(`c/${clave}`, reg);
  await store.set("ultimo", String(n));
  return json({ ...reg, nuevo: true });
};

export const config = { path: "/api/folio" };
