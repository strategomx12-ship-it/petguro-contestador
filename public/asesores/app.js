// Pestaña "Asesores": chat de dudas sobre el producto + documentos para descargar.

// Para agregar un documento: súbelo a public/docs/ y agrégalo a esta lista.
export const DOCUMENTOS = [
  { titulo: "Condiciones generales", desc: "Coberturas, exclusiones, periodos de espera, siniestros, pagos y cancelación. 33 páginas.", archivo: "/docs/condiciones-generales-gmx-mascotas.pdf", tipo: "PDF" },
  { titulo: "Procedimiento de reembolso", desc: "Aviso de siniestro y documentos que pide GMX para reembolsar. 2 páginas.", archivo: "/docs/procedimiento-reembolso-siniestros.pdf", tipo: "PDF" },
  { titulo: "Presentación del producto", desc: "Requisitos, coberturas, deducible, periodos de espera y beneficios. 10 páginas.", archivo: "/docs/presentacion-producto-2025.pdf", tipo: "PDF" },
];

const DATOS = [
  ["Planes (anual, IVA incluido)", "Segura $2,445 · Super segura $3,658 · Premier $5,348"],
  ["Meses sin intereses", "Hasta 3 MSI con Visa, MasterCard y AMEX"],
  ["Edad para contratar", "2 meses a 9 años 11 meses"],
  ["Deducible", "10% por siniestro, mínimo $500"],
  ["Espera accidentes", "7 días desde el inicio de vigencia"],
  ["Reporte de siniestros GMX", "55 4161 6998 (dentro de 24 h)"],
  ["WhatsApp PetGuro", "984 463 4976"],
  ["Cotizar en línea", "petguro.com/cotizar"],
];

const SUGERENCIAS = [
  "¿Qué documentos piden para un reembolso?",
  "¿Se cubre una enfermedad que ya tenía antes de contratar?",
  "¿Cuánto tiempo tiene GMX para pagar un reembolso?",
  "¿Cómo se cancela una póliza y se devuelve algo?",
  "¿La responsabilidad civil cubre si muerde a alguien de la familia?",
  "Mi cliente tiene 3 perros, ¿cuánto pagaría con Super segura?",
];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let historial = [];
let ocupado = false;

// Markdown mínimo: negritas, listas, saltos de línea y links.
function md(t) {
  const lines = esc(t).split("\n");
  let html = "", lista = null;
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  for (const l of lines) {
    const m = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) { if (!lista) { html += "<ul>"; lista = true; } html += `<li>${inline(m[1])}</li>`; continue; }
    if (lista) { html += "</ul>"; lista = null; }
    if (/^#{1,4}\s/.test(l)) html += `<p><b>${inline(l.replace(/^#{1,4}\s/, ""))}</b></p>`;
    else if (l.trim()) html += `<p>${inline(l)}</p>`;
  }
  if (lista) html += "</ul>";
  return html;
}

function pintar() {
  const box = $("as-chat");
  if (!historial.length) {
    box.innerHTML = `<div class="empty"><b>Pregunta lo que necesites del producto</b>Coberturas, exclusiones, reembolsos, pagos, cancelación… Contesto con las condiciones generales y te digo de qué cláusula sale.</div>`;
    return;
  }
  box.innerHTML = historial.map((m, i) => m.role === "user"
    ? `<div class="q">${esc(m.content)}</div>`
    : `<div class="a">${md(m.content)}<div class="row"><button class="small-btn" data-copy="${i}" type="button">Copiar</button></div></div>`).join("")
    + (ocupado ? `<div class="a typing"><span class="spin dark"></span>Buscando en las condiciones…</div>` : "");
  box.querySelectorAll("[data-copy]").forEach((b) => b.onclick = async () => {
    try { await navigator.clipboard.writeText(historial[+b.dataset.copy].content.replace(/\*\*/g, "")); b.textContent = "¡Copiado!"; b.classList.add("ok"); }
    catch { b.textContent = "No se pudo copiar"; }
    setTimeout(() => { b.textContent = "Copiar"; b.classList.remove("ok"); }, 1500);
  });
  box.scrollTop = box.scrollHeight;
}

async function enviar(texto) {
  texto = (texto ?? $("as-in").value).trim();
  if (!texto || ocupado) return;
  $("as-in").value = "";
  historial.push({ role: "user", content: texto });
  ocupado = true; $("as-send").disabled = true; pintar();
  try {
    const r = await window.pgFetchJson("/api/responder", { modo: "asesor", messages: historial.slice(-12) });
    historial.push({ role: "assistant", content: (r.text || "").trim() || "No obtuve respuesta, intenta de nuevo." });
  } catch (err) {
    historial.pop();
    $("as-in").value = texto;
    const msg = err && err.code === "not_granted" ? "Necesitas el código de acceso." : err && err.code === "rate_limited" ? "Demasiadas preguntas seguidas, espera un momento." : "No pude contestar. Intenta de nuevo.";
    $("as-err").textContent = msg; setTimeout(() => ($("as-err").textContent = ""), 5000);
  } finally {
    ocupado = false; $("as-send").disabled = false; pintar();
  }
}

export function iniciarAsesores() {
  $("as-docs").innerHTML = DOCUMENTOS.map((d) => `
    <div class="doc"><div class="doc-ic">${esc(d.tipo)}</div><div class="doc-tx"><b>${esc(d.titulo)}</b><span>${esc(d.desc)}</span></div>
      <div class="doc-bt"><a class="small-btn" href="${d.archivo}" target="_blank" rel="noopener">Ver</a><a class="small-btn" href="${d.archivo}" download>Descargar</a></div></div>`).join("");
  $("as-datos").innerHTML = DATOS.map(([k, v]) => `<div class="dato"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
  $("as-sug").innerHTML = SUGERENCIAS.map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join("");
  $("as-sug").addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) enviar(c.textContent); });
  $("as-send").addEventListener("click", () => enviar());
  $("as-in").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } });
  $("as-new").addEventListener("click", () => { historial = []; pintar(); $("as-in").focus(); });
  pintar();
}
