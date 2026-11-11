// Pestaña "Asesores": chat de dudas sobre el producto + documentos para descargar.

// Para agregar un documento: súbelo a public/docs/ y agrégalo a esta lista.
export const DOCUMENTOS = [
  { grupo: "Producto", titulo: "Condiciones generales", desc: "Coberturas, exclusiones, periodos de espera, siniestros, pagos y cancelación. 33 págs.", archivo: "/docs/condiciones-generales-gmx-mascotas.pdf" },
  { grupo: "Producto", titulo: "Presentación del producto", desc: "Requisitos, coberturas, deducible, esperas y beneficios. 10 págs.", archivo: "/docs/presentacion-producto-2025.pdf" },
  { grupo: "Producto", titulo: "Folleto GMX", desc: "Resumen de coberturas del seguro para mascotas. 3 págs.", archivo: "/docs/folleto-gmx.pdf" },
  { grupo: "Póliza de ejemplo (datos personales ocultos)", titulo: "Carátula de póliza", desc: "Cómo se ve la póliza emitida: vigencia, prima, plan. 2 págs.", archivo: "/docs/ejemplo-caratula-poliza.pdf" },
  { grupo: "Póliza de ejemplo (datos personales ocultos)", titulo: "Condiciones particulares", desc: "Especificación de coberturas, sumas y asistencias de la póliza. 12 págs.", archivo: "/docs/ejemplo-condiciones-particulares.pdf" },
  { grupo: "Póliza de ejemplo (datos personales ocultos)", titulo: "Aviso de cobro", desc: "Recibo de primas con desglose de prima, derecho e IVA. 1 pág.", archivo: "/docs/ejemplo-aviso-de-cobro.pdf" },
  { grupo: "Formatos", titulo: "Carta de reclamación", desc: "Formato para reclamar gastos médicos de un siniestro. 3 págs.", archivo: "/docs/carta-reclamacion.pdf" },
  { grupo: "Formatos", titulo: "Solicitud de reembolso de beneficios", desc: "Vacuna o desparasitación, baño, estética y hospedaje. 2 págs.", archivo: "/docs/formato-reembolso-beneficios.pdf" },
  { grupo: "Formatos", titulo: "Procedimiento de reembolso", desc: "Aviso de siniestro y documentos que pide GMX. 2 págs.", archivo: "/docs/procedimiento-reembolso-siniestros.pdf" },
  { grupo: "Formatos", titulo: "Solicitud de alta de mascota", desc: "Cuestionario de alta del propietario y la mascota. 3 págs.", archivo: "/docs/solicitud-alta-mascota.pdf" },
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
  "¿Cómo se reembolsa el baño o la vacuna?",
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
  const grupos = [...new Set(DOCUMENTOS.map((d) => d.grupo))];
  $("as-docs").innerHTML = grupos.map((g) => `<p class="label" style="margin:12px 0 6px">${esc(g)}</p>` + DOCUMENTOS.filter((d) => d.grupo === g).map((d) => `
    <div class="doc"><div class="doc-ic">PDF</div><div class="doc-tx"><b>${esc(d.titulo)}</b><span>${esc(d.desc)}</span></div>
      <div class="doc-bt"><a class="small-btn" href="${d.archivo}" target="_blank" rel="noopener">Ver</a><a class="small-btn" href="${d.archivo}" download>Descargar</a></div></div>`).join("")).join("");
  $("as-datos").innerHTML = DATOS.map(([k, v]) => `<div class="dato"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
  $("as-sug").innerHTML = SUGERENCIAS.map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join("");
  $("as-sug").addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) enviar(c.textContent); });
  $("as-send").addEventListener("click", () => enviar());
  $("as-in").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } });
  $("as-new").addEventListener("click", () => { historial = []; pintar(); $("as-in").focus(); });
  pintar();
}
