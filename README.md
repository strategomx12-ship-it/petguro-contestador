# Contestador de mensajes PetGuro

Página donde pegas el mensaje de un cliente (o una captura del chat) y te redacta la respuesta lista para WhatsApp, Instagram o Messenger, con las condiciones generales y las reglas de marca de PetGuro.

## Qué hay en la carpeta

```
petguro-contestador/
├── public/index.html               La página (lo que ve tu equipo)
├── netlify/functions/responder.mjs Llama a Claude con tu clave (nunca se expone en la página)
├── netlify/functions/kb.mjs        Base de conocimiento y reglas: edítalo para actualizar lo que sabe
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

Cada vez que cambies algo (por ejemplo `kb.mjs`), repite solo el último comando.

## Variables de entorno

| Variable | Para qué |
|---|---|
| `ACCESS_CODE` | Código que pide la página. Cámbialo en Netlify > Project configuration > Environment variables |
| `CLAUDE_MODEL` | Opcional. Modelo de Claude; por defecto `claude-sonnet-5-5` |

## Actualizar la base de conocimiento

Edita `netlify/functions/kb.mjs` (precios, coberturas, reglas de estilo) y vuelve a hacer deploy. La página toma los cambios en automático; el apartado "Lo que sabe el asistente" muestra la versión publicada.

## Notas

- Las capturas se mandan a Claude solo para leer la conversación; no se guardan.
- Si cambias el código de acceso, cada persona tendrá que escribir el nuevo la próxima vez.
