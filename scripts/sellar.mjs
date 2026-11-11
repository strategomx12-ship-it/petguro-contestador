// Cifra el archivo de leads para publicarlo en la rama "datos" sin exponer datos personales.
// Uso: node scripts/sellar.mjs data.json leads.enc
// AES-256-GCM con llave aleatoria, envuelta con RSA-OAEP-256 (llave pública de este repo).
// Solo la función /api/leads (con LEADS_PRIVATE_KEY en Netlify) puede descifrarlo.
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes, createCipheriv, publicEncrypt, constants } from "node:crypto";
import { fileURLToPath } from "node:url";

const [, , entrada, salida] = process.argv;
if (!entrada || !salida) { console.error("Uso: node scripts/sellar.mjs data.json leads.enc"); process.exit(1); }
const texto = readFileSync(entrada);
JSON.parse(texto); // valida que sea JSON
const pub = readFileSync(fileURLToPath(new URL("./leads-public.pem", import.meta.url)));
const key = randomBytes(32), iv = randomBytes(12);
const c = createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([c.update(texto), c.final()]);
const ek = publicEncrypt({ key: pub, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, key);
writeFileSync(salida, JSON.stringify({ v: 1, ek: ek.toString("base64"), iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), ct: ct.toString("base64"), sellado: new Date().toISOString() }));
console.log(`Listo: ${salida} (${ct.length} bytes cifrados)`);
