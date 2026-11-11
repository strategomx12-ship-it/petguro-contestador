// Generador de cotizaciones PetGuro (versión web del generar.py).
// Arma el HTML de 3 páginas tamaño carta con el mismo diseño; el navegador lo guarda como PDF.
// Planes y precios fijos (anuales, IVA incluido). Nunca se calculan precios distintos a estos.

export const PRECIOS = { segura: 2445, super: 3658, premier: 5348 };
export const LINK_DEFAULT = "https://petguro.com/cotizar";
export const DISTRIBUIDORES = [
  { nombre: "Ana Sanchez", contacto: "", link: "petguro.com/r/R-ASA" },
  { nombre: "Cristina Cortes", contacto: "", link: "petguro.com/r/R-CCO" },
  { nombre: "Jesus Cortes", contacto: "", link: "petguro.com/r/R-JCO" },
  { nombre: "Veterinaria Acuavet", contacto: "Jorge Lazzard", link: "petguro.com/r/R-ACV" },
];
const WA = "https://wa.me/529844634976";
const MAIL = "mailto:atencion@petguro.com";
const IG = "https://instagram.com/petguro";
const TEL_SIN = "tel:+525541616998";
const MSI = "Hasta 3 meses sin intereses con tarjetas de crédito Visa, MasterCard y AMEX";

export const PLANES = {
  segura: { nombre: "Patita segura", desc: "Plan Cuidado esencial", gm: "$10,000", rc: "$25,000", fun: null },
  super: { nombre: "Patita super segura", desc: "Plan Cuidado superior", gm: "$25,000", rc: "$50,000", fun: "$1,500" },
  premier: { nombre: "Patita premier", desc: "Plan Cuidado máximo", gm: "$25,000", rc: "$150,000", fun: "$1,500" },
};
export const ORDEN = ["segura", "super", "premier"];
const BIENESTAR = [
  ["2 videoconsultas veterinarias", "al año, desde casa."],
  ["Vacuna antirrábica o desparasitación", "un evento al año."],
  ["Baño + estética", "uno de cada uno al año."],
  ["Veterinario al teléfono", "asistencia ilimitada."],
  ["Pet Concierge ilimitado", "estéticas, pensiones y lugares pet friendly."],
  ["Hospedaje", "hasta 4 días si tú estás hospitalizado."],
  ["Asesoría legal telefónica", "ilimitada."],
  ["Red de descuentos", "en productos y servicios para mascotas."],
];
const ESPERAS = [
  ["Enfermedades parasitarias", "3 meses"],
  ["Hereditarias y congénitas de ojos o piel", "4 meses"],
  ["Defectos de la coagulación", "4 meses"],
  ["Hereditarias y congénitas del aparato genitourinario", "6 meses"],
  ["Degenerativas de columna y articulaciones", "6 meses"],
  ["Virales (moquillo, hepatitis, parvovirus, entre otras)", "6 meses"],
  ["Alergias", "6 meses"],
  ["Sida felino", "6 meses"],
  ["Hernias hereditarias y congénitas", "8 meses"],
  ["Cáncer y sus variedades", "8 meses"],
  ["Leucemia viral felina", "8 meses"],
  ["Hereditarias y congénitas de corazón y vasos sanguíneos", "9 meses"],
];
const FOTOS_P3 = ["perro-blanco-cachorro", "gato-atigrado", "gato-veterinaria", "jack-russell"];
const PORTADA_GATOS = ["p3g-gato-tabby-asomado", "0% 35%", "Gato atigrado asomándose"];
const FOTOS_P3_PERROS = [["jack-russell", "50% 58%"], ["cachorro-labrador", "50% 35%"]];
const FOTOS_P3_GATOS = [["gato-calico", "30% 45%"], ["gatito-mono", "50% 40%"]];

const SVG_ATTR = 'fill="none" stroke="#A34687" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
const FIG_PERRO = `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg"><g ${SVG_ATTR}>
<path d="M44 44 C30 36 16 44 18 62 C20 76 28 86 38 84 C42 72 42 58 44 44 Z"/>
<path d="M96 44 C110 36 124 44 122 62 C120 76 112 86 102 84 C98 72 98 58 96 44 Z"/>
<path d="M44 44 C54 34 86 34 96 44 C104 54 106 74 102 88 C98 104 86 114 70 114 C54 114 42 104 38 88 C34 74 36 54 44 44 Z"/>
<path d="M57 70 L57 72"/><path d="M83 70 L83 72"/>
<path d="M63 87 C66 84 74 84 77 87 C76 91 73 93 70 93 C67 93 64 91 63 87 Z"/>
<path d="M70 93 L70 99 M70 99 C66 103 61 103 58 100 M70 99 C74 103 79 103 82 100"/>
<path d="M66 104 C67 109 73 109 74 104"/>
</g></svg>`;
const FIG_GATO = `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg"><g ${SVG_ATTR}>
<path d="M36 58 L32 24 L60 42 C66 40 74 40 80 42 L108 24 L104 58 C112 70 112 86 104 98 C96 110 84 116 70 116 C56 116 44 110 36 98 C28 86 28 70 36 58 Z"/>
<path d="M40 36 L46 50 M100 36 L94 50"/>
<path d="M54 72 C56 68 60 68 62 72"/><path d="M78 72 C80 68 84 68 86 72"/>
<path d="M66 86 L74 86 L70 91 Z"/>
<path d="M70 91 L70 95 M70 95 C67 99 62 99 60 96 M70 95 C73 99 78 99 80 96"/>
<path d="M50 88 L28 84 M50 93 L28 96 M90 88 L112 84 M90 93 L112 96"/>
</g></svg>`;
const MESES = "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre".split(" ");

const e = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const norm = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const slug = (s) => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]+/g, "").trim().replace(/\s+/g, "-");
export const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
export const edadTxt = (m) => {
  const a = Math.floor(m / 12), r = m % 12, p = [];
  if (a) p.push(`${a} año${a > 1 ? "s" : ""}`);
  if (r) p.push(`${r} mes${r > 1 ? "es" : ""}`);
  return p.join(" y ");
};
export const fechaLarga = (d) => `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
const fechaCorta = (d) => `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
const unir = (n) => (n.length === 1 ? n[0] : n.slice(0, -1).join(", ") + " y " + n[n.length - 1]);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const P = (v) => (v ? e(v) : '<span class="pc">Por confirmar</span>');

/**
 * c = { nombre, mascotas:[{nombre, especie:'perro'|'gato', raza, edadMeses, edadMostrar, sexo, color, foto}],
 *       planes:['segura','super','premier'], rec, asesor:{nombre,contacto,link}|null, fecha:Date, vigencia:15, folio }
 */
export function htmlCotizacion(c, base) {
  const pets = c.mascotas.map((m) => ({
    ...m,
    especie: cap(m.especie),
    sexo: cap(m.sexo || ""),
    color: cap(m.color || ""),
    edad: m.edadMostrar || (m.edadMeses ? edadTxt(m.edadMeses) : ""),
  }));
  const varias = pets.length > 1;
  const esp = new Set(pets.map((p) => norm(p.especie)));
  const grupo = varias ? `${pets.length} ` + (esp.size === 1 && esp.has("gato") ? "gatitos" : esp.size === 1 && esp.has("perro") ? "perritos" : "peludos") : "";
  const unid = varias ? grupo.split(" ")[1].slice(0, -1) : "";
  const mascota = unir(pets.map((p) => p.nombre));
  const quien = varias ? grupo : mascota;
  const tus = (varias ? "tus " : "") + quien;
  const fem = !varias && norm(pets[0].sexo) === "hembra";
  const lo = fem ? "la" : "lo";
  const link = c.asesor && c.asesor.link ? (c.asesor.link.startsWith("http") ? c.asesor.link : "https://" + c.asesor.link) : LINK_DEFAULT;
  const L = e(link);
  const A = 'target="_blank" rel="noopener"';
  const planes = ORDEN.filter((k) => c.planes.includes(k));
  const multi = planes.length > 1;
  const rec = planes.includes(c.rec) ? c.rec : planes.includes("super") ? "super" : planes[planes.length - 1];
  const fecha = c.fecha;
  const vence = new Date(fecha.getTime() + c.vigencia * 86400000);
  const folio = c.folio;
  const img = (f) => `${base}assets/${f}`;
  const top = `<div class="top"><div class="brand"><img src="${img("logo-magenta.png")}" alt=""><span>PETGURO</span></div><div>Cotización · Folio ${e(folio)}</div></div>`;
  const foot = `<div class="foot"><span><b>PetGuro</b> · Respaldo GMX</span><span>Cotización para ${e(c.nombre)} · válida hasta el ${fechaLarga(vence)}</span></div>`;

  // ---------- Portada
  const precioRec = PRECIOS[rec];
  const kp = `<div class="k">${multi ? "Recomendado · " : ""}${e(PLANES[rec].nombre)}</div>`;
  let precioHtml;
  if (varias) {
    precioHtml = `${kp}<div class="big">${money(precioRec)}<small>al año por ${unid}</small></div>
      <p><b>Es una póliza por cada ${unid}.</b> Total por los ${pets.length}: <b>${money(precioRec * pets.length)}</b>. IVA incluido. ${MSI}.*</p>`;
  } else {
    precioHtml = `${kp}<div class="big">${money(precioRec)}<small>al año</small></div>
      <p><b>IVA incluido.</b> ${MSI}.*</p>`;
  }
  const soloGatos = pets.every((p) => norm(p.especie) === "gato");
  const soloPerros = pets.every((p) => norm(p.especie) === "perro");
  const portada = soloGatos
    ? `<img src="${img(PORTADA_GATOS[0] + ".jpg")}" style="object-position:${PORTADA_GATOS[1]}" alt="${PORTADA_GATOS[2]}">`
    : `<img src="${img("portada-husky.jpg")}" alt="Husky de paseo en el bosque">`;
  const p1 = `<section class="page">
  <div class="cov-left">
    <div class="brand"><img src="${img("logo-magenta.png")}" alt="PetGuro"><span>PetGuro</span></div>
    <span class="chip">Cotización personalizada</span>
    <h1 class="cov-title">Cotización para <em>${e(c.nombre)}</em></h1>
    <p class="cov-sub">Un plan pensado para cuidar a ${e(mascota)} cuando ${varias ? "lo necesiten y consentirlos" : `${lo} necesite y consentir${lo}`} todo el año.</p>
    <div class="cov-meta">
      <div><div class="k">${varias ? "Mascotas" : "Mascota"}</div><div class="v">${e(varias ? cap(grupo) : mascota)}</div></div>
      <div><div class="k">Fecha</div><div class="v">${fechaCorta(fecha)}</div></div>
      <div><div class="k">Folio</div><div class="v">${e(folio)}</div></div>
      <div><div class="k">Válida hasta</div><div class="v">${fechaCorta(vence)}</div></div>
    </div>
    <div class="cov-price">${precioHtml}</div>
    <a class="btn" href="${L}" ${A}>¡Guau! Contratar</a>
  </div>
  <div class="cov-photo">${portada}</div>
  <div class="band"><div class="chips"><span>100% digital</span><span>Sin llamadas</span><span>Sin papeleo</span><span>Tu veterinario de confianza</span></div>
    <div class="resp"><div class="k">Respaldo</div><img src="${img("gmx-blanco.png")}" alt="GMX"></div></div>
</section>`;

  // ---------- Página 2
  const fig = (p) => (p.foto ? `<img class="foto" src="${p.foto}" alt="${e(p.nombre)}">` : norm(p.especie) === "gato" ? FIG_GATO : FIG_PERRO);
  let pet;
  if (varias) {
    const mini = (p) => `<div class="mini"><div class="mh"><div class="fig">${fig(p)}</div><div><div class="name">${e(p.nombre)}</div><div class="sp">${P(p.especie)} · ${P(p.raza)}</div></div></div>
      <div class="mg"><div><span class="k">Edad</span><b>${P(p.edad)}</b></div><div><span class="k">Sexo</span><b>${P(p.sexo)}</b></div><div><span class="k">Color</span><b>${P(p.color)}</b></div></div></div>`;
    pet = `<div class="pets" style="grid-template-columns:repeat(${Math.min(pets.length, 4)},1fr)">` + pets.map(mini).join("") + "</div>";
  } else {
    const p = pets[0];
    pet = `<div class="pet"><div class="fig">${fig(p)}</div>
    <div class="grid"><div class="name">${e(p.nombre)}</div>
      <div><div class="k">Especie</div><div class="v">${P(p.especie)}</div></div>
      <div><div class="k">Raza</div><div class="v">${P(p.raza)}</div></div>
      <div><div class="k">Edad</div><div class="v">${P(p.edad)}</div></div>
      <div><div class="k">Sexo</div><div class="v">${P(p.sexo)}</div></div>
      <div><div class="k">Color</div><div class="v">${P(p.color)}</div></div>
      <div><div class="k">Contratante</div><div class="v">${e(c.nombre)}</div></div>
    </div></div>`;
  }
  const isRec = (k) => multi && k === rec;
  const head = planes.map((k) => `<th${isRec(k) ? ' class="rec"' : ""}>${isRec(k) ? "<span class=badge>RECOMENDADO</span><br>" : ""}${e(PLANES[k].nombre)}<span class="desc">${e(PLANES[k].desc)}</span></th>`).join("");
  const row = (lbl, f, extra = "") => `<tr${extra}><td>${lbl}</td>` + planes.map((k) => `<td class="val${isRec(k) ? " rec" : ""}">${f(k)}</td>`).join("") + "</tr>";
  const sec = (t) => `<tr class="sec"><td colspan="${planes.length + 1}">${t}</td></tr>`;
  const ok = '<span class="ok">✓</span>';
  let precioFilas;
  if (varias) {
    precioFilas =
      row(`Precio anual por ${unid}<br><small>IVA incluido</small>`, (k) => money(PRECIOS[k]), ' class="price"') +
      row(`Total por los ${pets.length} · anual`, (k) => money(PRECIOS[k] * pets.length), ' class="price last"');
  } else {
    precioFilas = row("Pago anual<br><small>IVA incluido</small>", (k) => money(PRECIOS[k]), ' class="price last"');
  }
  const filas =
    sec("Sumas aseguradas por vigencia anual") +
    row("Gastos médicos (accidentes y enfermedades)", (k) => PLANES[k].gm) +
    row("Responsabilidad civil", (k) => PLANES[k].rc) +
    row("Gastos funerarios", (k) => PLANES[k].fun || '<span class="no">No incluye</span>') +
    row("Eutanasia o fallecimiento asistido", () => "$800") +
    sec("Coberturas y beneficios") +
    row("Accidentes", () => ok) +
    row("Enfermedades, medicamentos y tratamiento", () => ok) +
    row("Asesoría legal", () => ok) +
    row("Beneficios de bienestar (ver página 3)", () => ok) +
    row("Deducible", () => "10%, mín. $500") +
    sec("Precio") +
    precioFilas;
  const titulo = (multi ? "Compara los planes para " : "Tu plan para ") + e(tus);
  const p2 = `<section class="page"><div class="inner">${top}
  <div class="eyebrow">${varias ? "Datos de las mascotas" : "Datos de la mascota"}</div>
  <h2>Así conocemos a ${e(tus)}</h2>
  ${pet}
  <div class="eyebrow" style="margin-top:14px">${multi ? "Planes cotizados" : "Plan cotizado"}</div>
  <h2>${titulo}</h2>
  ${varias ? `<div class="aviso-poliza"><b>Una póliza por cada ${unid}.</b> Cada uno de tus ${e(grupo)} (${e(mascota)}) tiene su propia póliza, con sus propias sumas aseguradas, deducible y beneficios. El precio de la tabla es por cada uno.</div>` : ""}
  <table class="cmp"><thead><tr><th></th>${head}</tr></thead><tbody>${filas}</tbody></table>
  <p class="note"><b>Precios con IVA incluido.</b> *${MSI}. Montos en pesos mexicanos. ${varias ? "Cada mascota lleva su propia póliza. " : "La póliza es individual: cubre solo a la mascota asegurada. "}Responsabilidad civil: daños que tu mascota cause a otras personas, a sus cosas o a otras mascotas. El deducible del 10% (mínimo $500) aplica en cada reclamación.${multi ? " Te recomendamos " + e(PLANES[rec].nombre) + " por el equilibrio entre protección y precio." : ""}</p>
</div>${foot}</section>`;

  // ---------- Página 3
  const bens = BIENESTAR.map(([t, d]) => `<div class="ben"><div class="dot">✓</div><div><b>${e(t)}</b><span>${e(d)}</span></div></div>`).join("");
  const espTbl = ESPERAS.map(([t, m]) => `<tr><td>${e(t)}</td><td>${e(m)}</td></tr>`).join("");
  let ase;
  if (c.asesor) {
    const s = c.asesor;
    ase = `<div class="asesor"><div class="k">Tu asesor PetGuro</div><div class="v">${e(s.nombre)}</div>
      ${s.contacto ? `<div class="s">${e(s.contacto)}</div>` : ""}
      <div class="k" style="margin-top:6px">Contrata con su link</div><a class="s" href="${L}" ${A}><b>${e(link.replace("https://", ""))}</b></a></div>`;
  } else {
    ase = `<div class="asesor"><div class="k">Tu asesor PetGuro</div><div class="v">Equipo PetGuro</div>
      <div class="s">¿Dudas antes de contratar? Escríbenos por WhatsApp y te ayudamos.</div>
      <a class="s" href="${WA}" ${A}><b>WhatsApp 984 463 4976</b></a></div>`;
  }
  let fotos;
  if (soloPerros) fotos = '<div class="photos v2">' + FOTOS_P3_PERROS.map(([f, pos]) => `<div><img src="${img(f + ".jpg")}" style="object-position:${pos}" alt=""></div>`).join("") + "</div>";
  else if (soloGatos) fotos = '<div class="photos v2">' + FOTOS_P3_GATOS.map(([f, pos]) => `<div><img src="${img("p3g-" + f + ".jpg")}" style="object-position:${pos}" alt=""></div>`).join("") + "</div>";
  else fotos = '<div class="photos">' + FOTOS_P3.map((f) => `<div><img src="${img("p3-" + f + ".jpg")}" alt=""></div>`).join("") + "</div>";
  const dias = Math.round((vence - fecha) / 86400000);
  const p3 = `<section class="page"><div class="inner">${top}
  <div class="eyebrow">Incluido en ${multi ? "todos los planes" : "tu plan"}${varias ? ", para cada uno" : ""}</div>
  <h2>Bienestar para ${e(tus)}, todo el año</h2>
  <div class="cols">
    <div><div class="card"><div class="bens">${bens}</div></div>
      ${fotos}</div>
    <div class="card"><h3>Deducible y periodos de espera</h3>
      <div class="ded"><div><div class="k">Deducible</div><div class="v">10%</div><div style="font-size:7.8pt">mínimo $500 por reclamación</div></div>
        <div><div class="k">Accidentes</div><div class="v">7 días</div><div style="font-size:7.8pt">desde el inicio de vigencia</div></div></div>
      <div class="k" style="margin:4px 0 3px">Enfermedades con periodo de espera</div>
      <table class="esp">${espTbl}</table></div>
  </div>
  <div class="cta"><div><div class="eyebrow">¿Listo para ${varias ? "protegerlos" : "proteger" + lo}?</div><h3>Asegura a ${e(tus)} hoy</h3>
      <p>Contratas en línea en minutos, pagas en el portal seguro de GMX y la póliza llega a tu correo.${varias ? " <b>Es una póliza por cada uno.</b>" : ""} IVA incluido y hasta 3 meses sin intereses.*</p>
      <a class="btn amarillo" href="${L}" ${A}>¡Guau! Contratar</a><a class="lnk" href="${L}" ${A}>${e(link.replace("https://", ""))}</a></div>
    ${ase}</div>
  <div class="contact">
    <div><div class="k">Correo</div><a class="v" href="${MAIL}">atencion@petguro.com</a></div>
    <div><div class="k">WhatsApp</div><a class="v" href="${WA}" ${A}>984 463 4976</a></div>
    <div><div class="k">Instagram</div><a class="v" href="${IG}" ${A}>@petguro</a></div>
    <div><div class="k">Reporte de siniestros GMX</div><a class="v" href="${TEL_SIN}">55 4161 6998</a></div>
  </div>
  <p class="legal"><b>Vigencia de la cotización:</b> del ${fechaLarga(fecha)} al ${fechaLarga(vence)} (${dias} días). Folio ${e(folio)}.
  <b>Aviso legal:</b> cotización de carácter informativo. El precio está sujeto a la emisión de la póliza por GMX Seguros (Grupo Mexicano de Seguros, S.A. de C.V.) y a las condiciones generales del producto. Coberturas, sumas aseguradas, deducibles, periodos de espera y exclusiones conforme a la póliza y sus condiciones generales. Se aseguran perros y gatos de 2 meses a 9 años 11 meses que vivan en el hogar; no se cubren padecimientos preexistentes. Montos en pesos mexicanos con IVA incluido. *${MSI}; sujeto a las condiciones del portal de pago de GMX.</p>
</div>
<div class="miniband"><div style="display:flex;align-items:center"><div class="brand"><img src="${img("logo-blanco.png")}" alt=""><span>PetGuro</span></div><span class="tag">Protegemos a quien te protege a ti</span></div>
  <div class="resp" style="display:flex;align-items:center;gap:8px"><div class="k" style="margin:0">Respaldo</div><img src="${img("gmx-blanco.png")}" alt="GMX"></div></div>
</section>`;

  const archivo = `PetGuro-Cotizacion-${slug(c.nombre)}-` + pets.map((p) => slug(p.nombre)).join("-");
  const barra = `<div class="no-print" style="position:sticky;top:0;z-index:99;background:#3a2234;color:#fff;font:600 14px Quicksand,sans-serif;padding:10px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap">
  <span>Para guardar el PDF elige <b>“Guardar como PDF”</b> como impresora, tamaño Carta y márgenes Ninguno.</span>
  <button onclick="window.print()" style="background:#F4D892;color:#84085E;border:0;border-radius:999px;padding:8px 18px;font:800 14px 'Baloo 2',sans-serif;cursor:pointer">Guardar PDF</button></div>`;
  return {
    archivo,
    html: `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(archivo)}</title>
<link rel="stylesheet" href="${base}plantilla.css">
<style>@media print{.no-print{display:none!important}} @media screen{body{background:#cfc6cb}.page{margin:16px auto;box-shadow:0 4px 18px rgba(0,0,0,.18)}}</style>
</head><body>${barra}${p1}${p2}${p3}</body></html>`,
  };
}

/** Convierte "3 años", "8 meses", "2 años 4 meses", "1 y medio", "casi 5" o "1.5" a meses. null = vacío, -1 = no entendido */
export function edadMeses(s) {
  const n = norm(s);
  if (!n) return null;
  let m;
  if ((m = n.match(/^casi (\d+)(?: anos?)?$/))) return +m[1] * 12 - 1;
  if ((m = n.match(/^(\d+)(?: anos?)? y medio$/))) return +m[1] * 12 + 6;
  const a = n.match(/(\d+(?:\.\d+)?)\s*(?:anos?|a\b)/);
  const me = n.match(/(\d+)\s*(?:mes|meses|m\b)/);
  if (a || me) return Math.round(a ? parseFloat(a[1]) * 12 : 0) + (me ? +me[1] : 0);
  if (/^\d+(?:\.\d+)?$/.test(n.replace(" ", "."))) return Math.round(parseFloat(n.replace(" ", ".")) * 12);
  return -1;
}
export function edadMostrar(original, m) {
  const n = norm(original);
  let x;
  if ((x = n.match(/^casi (\d+)(?: anos?)?$/))) return `Casi ${x[1]} años`;
  if ((x = n.match(/^(\d+)(?: anos?)? y medio$/))) return `${x[1]} año${+x[1] > 1 ? "s" : ""} y medio`;
  return edadTxt(m);
}
