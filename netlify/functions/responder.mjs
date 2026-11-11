// Función de Netlify: recibe el mensaje del cliente desde la página,
// le agrega las reglas y la base de conocimiento de PetGuro y le pide la respuesta a Claude.
//
// Usa Netlify AI Gateway: Netlify inyecta ANTHROPIC_API_KEY y ANTHROPIC_BASE_URL solo,
// así que no hace falta clave propia (se cobra en créditos de Netlify).
// Variables de entorno opcionales (Netlify > Project configuration > Environment variables):
//   ACCESS_CODE   código que pide la página para usar el contestador (recomendada)
//   CLAUDE_MODEL  modelo a usar; por defecto claude-sonnet-5-5

import Anthropic from "@anthropic-ai/sdk";
import { KB, RULES, ASESOR_RULES } from "../lib/kb.mjs";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 4_500_000; // por imagen, ya en base64
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

export default async (req) => {
  const url = new URL(req.url);

  // La página muestra "Lo que sabe el asistente" con esto.
  if (req.method === "GET" && url.searchParams.has("kb")) {
    return new Response(KB, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const required = process.env.ACCESS_CODE;
  if (required && req.headers.get("x-access-code") !== required) {
    return json({ error: "Código de acceso incorrecto" }, 401);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "AI Gateway no está activo todavía: hace falta un deploy a producción" }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Solicitud inválida" }, 400);
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json({ error: "Falta el mensaje del cliente" }, 400);
  }

  // Convierte el historial a formato de la API y agrega las capturas al primer mensaje.
  const images = (Array.isArray(body.images) ? body.images : [])
    .filter((i) => i && OK_TYPES.includes(i.media_type) && typeof i.data === "string" && i.data.length < MAX_IMAGE_BYTES)
    .slice(0, MAX_IMAGES);

  const apiMessages = messages.map((m, idx) => {
    const text = String(m.content ?? "").slice(0, 20000);
    if (idx === 0 && m.role === "user" && images.length) {
      return {
        role: "user",
        content: [
          ...images.map((i) => ({ type: "image", source: { type: "base64", media_type: i.media_type, data: i.data } })),
          { type: "text", text },
        ],
      };
    }
    return { role: m.role === "assistant" ? "assistant" : "user", content: text };
  });

  try {
    const anthropic = new Anthropic();
    const data = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        { type: "text", text: body.modo === "asesor" ? ASESOR_RULES : RULES },
        { type: "text", text: KB, cache_control: { type: "ephemeral" } },
      ],
      messages: apiMessages,
    });
    var text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
  } catch (e) {
    console.error("Error al llamar a Claude", e?.status, e?.message);
    if (e?.status === 429) return json({ error: "Demasiadas solicitudes" }, 429);
    return json({ error: "No se pudo generar la respuesta" }, 502);
  }
  return json({ text });
};

export const config = { path: "/api/responder" };
