import { htmlCotizacion, PRECIOS, PLANES, ORDEN, DISTRIBUIDORES, edadMeses, edadMostrar, edadTxt, money } from "./cotizacion.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let mascotas = [];
let uid = 0;

function nuevaMascota() {
  return { id: ++uid, nombre: "", especie: "perro", raza: "", edad: "", sexo: "", color: "", foto: null };
}

function pintarMascotas() {
  const box = $("cot-mascotas");
  box.innerHTML = mascotas.map((m, i) => `
    <div class="pet-card" data-id="${m.id}">
      <div class="pet-head"><b>Mascota ${i + 1}</b>${mascotas.length > 1 ? `<button type="button" class="x" data-del="${m.id}" title="Quitar">×</button>` : ""}</div>
      <div class="row">
        <div><p class="label">Nombre *</p><input type="text" data-f="nombre" value="${esc(m.nombre)}" placeholder="Ej. Rocco"></div>
        <div><p class="label">Especie *</p>
          <div class="seg" data-seg="especie">
            <button type="button" data-v="perro" aria-pressed="${m.especie === "perro"}">Perro</button>
            <button type="button" data-v="gato" aria-pressed="${m.especie === "gato"}">Gato</button>
          </div></div>
      </div>
      <div class="row">
        <div><p class="label">Raza</p><input type="text" data-f="raza" value="${esc(m.raza)}" placeholder="Ej. Schnauzer miniatura"></div>
        <div><p class="label">Edad *</p><input type="text" data-f="edad" value="${esc(m.edad)}" placeholder="3 años · 8 meses · 2 años 4 meses"></div>
      </div>
      <div class="row">
        <div><p class="label">Sexo</p><select data-f="sexo"><option value="">Por confirmar</option><option ${m.sexo === "Macho" ? "selected" : ""}>Macho</option><option ${m.sexo === "Hembra" ? "selected" : ""}>Hembra</option></select></div>
        <div><p class="label">Color</p><input type="text" data-f="color" value="${esc(m.color)}" placeholder="Opcional"></div>
      </div>
      <div class="foto-row">
        ${m.foto ? `<img src="${m.foto}" alt=""><button type="button" class="small-btn" data-nofoto="${m.id}">Quitar foto</button>` : `<label class="small-btn">Agregar foto de la mascota (opcional)<input type="file" accept="image/*" data-foto="${m.id}" hidden></label>`}
        <span class="hint edad-hint" data-hint="${m.id}"></span>
      </div>
    </div>`).join("");
  box.querySelectorAll(".pet-card").forEach((card) => {
    const m = mascotas.find((x) => x.id == card.dataset.id);
    card.querySelectorAll("[data-f]").forEach((inp) => {
      inp.addEventListener("input", () => { m[inp.dataset.f] = inp.value; resumen(); });
      inp.addEventListener("change", () => { m[inp.dataset.f] = inp.value; resumen(); });
    });
    card.querySelectorAll("[data-seg] button").forEach((b) => b.addEventListener("click", () => { m.especie = b.dataset.v; pintarMascotas(); resumen(); }));
  });
  box.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => { mascotas = mascotas.filter((x) => x.id != b.dataset.del); pintarMascotas(); resumen(); }));
  box.querySelectorAll("[data-nofoto]").forEach((b) => b.addEventListener("click", () => { mascotas.find((x) => x.id == b.dataset.nofoto).foto = null; pintarMascotas(); }));
  box.querySelectorAll("[data-foto]").forEach((inp) => inp.addEventListener("change", async () => {
    const f = inp.files[0]; if (!f) return;
    mascotas.find((x) => x.id == inp.dataset.foto).foto = await reducir(f);
    pintarMascotas();
  }));
  resumen();
}

function reducir(file) {
  return new Promise((ok, ko) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 900 / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      ok(cv.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = ko;
    img.src = URL.createObjectURL(file);
  });
}

const planesSel = () => ORDEN.filter((k) => $("cot-p-" + k).checked);

function validar() {
  const errores = [], avisos = [];
  if (!$("cot-cliente").value.trim()) errores.push("Falta el nombre del cliente.");
  if (!planesSel().length) errores.push("Elige al menos un plan.");
  mascotas.forEach((m, i) => {
    const n = m.nombre.trim() || `Mascota ${i + 1}`;
    if (!m.nombre.trim()) errores.push(`Falta el nombre de la mascota ${i + 1}.`);
    const meses = edadMeses(m.edad);
    if (meses === null) errores.push(`${n}: falta la edad.`);
    else if (meses < 0) errores.push(`${n}: no entiendo la edad “${m.edad}”. Escribe por ejemplo “3 años”, “8 meses” o “2 años 4 meses”.`);
    else if (meses < 2 || meses > 119) errores.push(`${n}: tiene ${edadTxt(meses) || "menos de un mes"} y solo se aseguran de 2 meses a 9 años 11 meses.`);
    else if (meses >= 108) avisos.push(`${n} está cerca del límite de edad (9 años 11 meses): conviene que contrate pronto.`);
    const falt = ["raza", "sexo", "color"].filter((c) => !String(m[c] || "").trim());
    if (falt.length && m.nombre.trim()) avisos.push(`${n}: sin ${falt.join(", ")} (sale “Por confirmar”).`);
  });
  if ($("cot-dist").value === "otro" && !/^(https?:\/\/)?(www\.)?petguro\.(com|mx)\/r\/R-[A-Z0-9]+\/?$/.test($("cot-link").value.trim()))
    errores.push("El link del distribuidor debe tener el formato petguro.com/r/R-XXX.");
  return { errores, avisos };
}

function resumen() {
  const pl = planesSel();
  const n = mascotas.length;
  const rec = $("cot-rec").value;
  $("cot-rec").querySelectorAll("option").forEach((o) => (o.disabled = !pl.includes(o.value)));
  const { errores, avisos } = validar();
  const filas = pl.map((k) => `<tr${k === rec && pl.length > 1 ? ' class="rec"' : ""}><td>${PLANES[k].nombre}${k === rec && pl.length > 1 ? ' <span class="tag">Recomendado</span>' : ""}</td><td>${money(PRECIOS[k])}</td>${n > 1 ? `<td>${money(PRECIOS[k] * n)}</td>` : ""}</tr>`).join("");
  $("cot-resumen").innerHTML = `
    <h3>Resumen</h3>
    <p class="hint">${n} mascota${n > 1 ? "s" : ""} · precios anuales con IVA${n > 1 ? " · una póliza por mascota" : ""}</p>
    <table class="tbl"><thead><tr><th>Plan</th><th>${n > 1 ? "Por mascota" : "Anual"}</th>${n > 1 ? `<th>Total ${n}</th>` : ""}</tr></thead><tbody>${filas || '<tr><td colspan="3">Elige al menos un plan</td></tr>'}</tbody></table>
    ${errores.length ? `<div class="err-box"><b>Falta corregir</b><ul>${errores.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
    ${avisos.length ? `<div class="notes"><h4>Avisos</h4><ul>${avisos.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
    <p class="hint" style="margin-top:12px">Portada: ${mascotas.every((m) => m.especie === "gato") ? "gato atigrado" : "husky en el bosque"}. Fotos de la página 3: ${mascotas.every((m) => m.especie === "gato") ? "gatos" : mascotas.every((m) => m.especie === "perro") ? "perros" : "perros y gatos"}.</p>`;
  $("cot-go").disabled = errores.length > 0;
}

function hoyLocal(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

async function generar() {
  const { errores } = validar();
  if (errores.length) return;
  const win = window.open("", "_blank");
  if (!win) { alert("Tu navegador bloqueó la ventana. Permite ventanas emergentes para este sitio."); return; }
  win.document.write('<p style="font:16px sans-serif;padding:24px">Preparando la cotización…</p>');
  const btn = $("cot-go"); btn.disabled = true; btn.textContent = "Generando…";
  try {
    const cliente = $("cot-cliente").value.trim();
    const pets = mascotas.map((m) => {
      const meses = edadMeses(m.edad);
      return { nombre: m.nombre.trim(), especie: m.especie, raza: m.raza.trim(), edadMeses: meses, edadMostrar: edadMostrar(m.edad, meses), sexo: m.sexo, color: m.color.trim(), foto: m.foto };
    });
    const f = await window.pgFetchJson("/api/folio", { nombre: cliente, mascotas: pets.map((p) => p.nombre) });
    const dv = $("cot-dist").value;
    let asesor = null;
    if (dv === "otro") asesor = { nombre: $("cot-dist-nombre").value.trim() || "Tu asesor PetGuro", contacto: "", link: $("cot-link").value.trim() };
    else if (dv) { const d = DISTRIBUIDORES[+dv]; asesor = { nombre: d.nombre, contacto: d.contacto, link: d.link }; }
    const { html, archivo } = htmlCotizacion({
      nombre: cliente, mascotas: pets, planes: planesSel(), rec: $("cot-rec").value, asesor,
      fecha: hoyLocal(f.fecha), vigencia: Math.max(1, parseInt($("cot-vig").value, 10) || 15), folio: f.folio,
    }, location.origin + "/cotizador/");
    win.document.open(); win.document.write(html); win.document.close();
    const imprimir = () => { win.focus(); win.print(); };
    win.addEventListener("load", () => (win.document.fonts ? win.document.fonts.ready.then(() => setTimeout(imprimir, 300)) : setTimeout(imprimir, 600)));
    $("cot-ultimo").innerHTML = `<div class="ok-box">Listo: <b>${esc(archivo)}.pdf</b> · folio ${esc(f.folio)}${f.nuevo ? "" : " (ya existía; se conserva su fecha)"}. Si no se abrió el diálogo, usa el botón “Guardar PDF” en la ventana nueva.</div>`;
  } catch (err) {
    win.close();
    $("cot-ultimo").innerHTML = `<div class="err">${err && err.code === "not_granted" ? "Necesitas el código de acceso." : "No se pudo generar la cotización. Intenta de nuevo."}</div>`;
  } finally {
    btn.textContent = "Generar cotización PDF"; resumen();
  }
}

export function iniciarCotizador() {
  $("cot-dist").innerHTML = '<option value="">Directo (sin distribuidor)</option>' + DISTRIBUIDORES.map((d, i) => `<option value="${i}">${esc(d.nombre)} · ${esc(d.link)}</option>`).join("") + '<option value="otro">Otro distribuidor…</option>';
  $("cot-dist").addEventListener("change", () => { $("cot-otro").hidden = $("cot-dist").value !== "otro"; resumen(); });
  ["cot-cliente", "cot-link", "cot-vig", "cot-rec", "cot-p-segura", "cot-p-super", "cot-p-premier"].forEach((id) => {
    $(id).addEventListener("input", resumen); $(id).addEventListener("change", resumen);
  });
  $("cot-add").addEventListener("click", () => { mascotas.push(nuevaMascota()); pintarMascotas(); });
  $("cot-go").addEventListener("click", generar);
  $("cot-reset").addEventListener("click", () => { $("cot-cliente").value = ""; mascotas = [nuevaMascota()]; pintarMascotas(); $("cot-ultimo").innerHTML = ""; });
  mascotas = [nuevaMascota()];
  pintarMascotas();
}
