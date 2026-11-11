# Contestador de mensajes PetGuro

Página donde pegas el mensaje de un cliente (o una captura del chat) y te redacta la respuesta lista para WhatsApp, Instagram o Messenger, con las condiciones generales y las reglas de marca de PetGuro.

## Qué hay en la carpeta

```
petguro-contestador/
├── public/index.html               La página (lo que ve tu equipo)
├── public/cotizador/               Cotizador PDF: plantilla, fotos, logos y motor (cotizacion.js)
├── netlify/functions/folio.mjs     Asigna folios PG-AAMMDD-NNNN (continúa desde el 0014) en Netlify Blobs
├── netlify/functions/responder.mjs Llama a Claude con tu clave (nunca se expone en la página)
├── netlify/lib/kb.mjs              Base de conocimiento y reglas: edítalo para actualizar lo que sabe
├── netlify.toml                    Configuración de Netlify
└── README.md
```

## Cómo funciona la conexión con Claude

La función usa **Netlify AI Gateway**: Netlify pone las credenciales de Claude solo y lo cobra de los créditos de tu cuenta. No necesitas clave de Anthropic. El gateway se activa después del primer deploy a producción.

## Sitio ya creado

- Proyecto: `petguro-contestador` (ID `09159db7-055e-4952-9620-ef5c20135738`)
- URL: https://petguro-contestador.netlify.app
- Variable `ACCESS_CODE` ya configurada (el código que pide la página)

## Subir o actualizar el sitio

Necesitas Node.js instalado. En la terminal:

```bash
cd petguro-contestador
npm install
npx netlify-cli login
npx netlify-cli link --id 09159db7-055e-4952-9620-ef5c20135738
npx netlify-cli deploy --prod
```

Cada vez que cambies algo (por ejemplo `netlify/lib/kb.mjs`), repite solo el último comando.

## Variables de entorno

| Variable | Para qué |
|---|---|
| `ACCESS_CODE` | Código que pide la página. Cámbialo en Netlify > Project configuration > Environment variables |
| `CLAUDE_MODEL` | Opcional. Modelo de Claude; por defecto `claude-sonnet-5-5` |

## Actualizar la base de conocimiento

Edita `netlify/lib/kb.mjs` (precios, coberturas, reglas de estilo) y vuelve a hacer deploy. La página toma los cambios en automático; el apartado "Lo que sabe el asistente" muestra la versión publicada.

## Notas

- Las capturas se mandan a Claude solo para leer la conversación; no se guardan.
- Si cambias el código de acceso, cada persona tendrá que escribir el nuevo la próxima vez.

## Cotizador PDF

Pestaña "Cotizador PDF" (o `/#cotizador`). Llenas cliente y una o varias mascotas, eliges planes, plan recomendado, vigencia y distribuidor, y se abre la cotización de 3 páginas lista para "Guardar como PDF".

- Precios fijos (anuales, IVA incluido) en `public/cotizador/cotizacion.js` → `PRECIOS`.
- Distribuidores en el mismo archivo → `DISTRIBUIDORES`.
- Solo gatos: portada y fotos de gato. Solo perros: husky y fotos de perro. Mixto: husky y 4 fotos.
- Valida edad de 2 meses a 9 años 11 meses. Si falta raza, sexo o color sale "Por confirmar".
- El folio se guarda por cliente + mascotas: si regeneras la misma cotización, conserva folio y fecha.
