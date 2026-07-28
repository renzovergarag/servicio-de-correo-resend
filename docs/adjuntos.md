# Envío de adjuntos vía HTTP

El endpoint `POST /api/email/send` acepta adjuntos en el campo `attachments`.

## Formato

Resend acepta el contenido del adjunto como **string base64**, por lo que se puede enviar
directamente dentro del JSON del request:

```json
{
    "to": "destinatario@ejemplo.com",
    "subject": "Informe mensual",
    "html": "<p>Adjuntamos el informe.</p>",
    "attachments": [
        { "filename": "informe-2026-07.pdf", "content": "<PDF en base64>" },
        { "filename": "anexo-2026-07.pdf", "content": "<PDF en base64>" }
    ]
}
```

Cada elemento del array requiere:

| Campo      | Tipo               | Descripción                                    |
| ---------- | ------------------ | ---------------------------------------------- |
| `filename` | `string`           | Nombre con el que se verá el archivo adjunto    |
| `content`  | `string \| Buffer` | Contenido del archivo, en base64 si es `string` |

## Límites de tamaño

Hay dos límites que deben considerarse:

1. **Resend**: acepta hasta ~40 MB por correo.
2. **Body parser de Express**: configurado en `src/index.ts` mediante
   `express.json({ limit: "25mb" })`.

El default de Express es **100 kb**, insuficiente para PDFs en base64. Si el request supera el
límite configurado, el servicio responde `HTTP 413 PayloadTooLargeError` y el correo no se envía.
Ajusta el valor en `src/index.ts` si necesitas más margen.

> Ten en cuenta que la codificación base64 infla el tamaño del archivo aproximadamente un 33 %.

## Ejemplo en Node.js

```javascript
import { readFile } from "node:fs/promises";

const pdf = await readFile("./informe.pdf");

await fetch("http://localhost:3000/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        to: "destinatario@ejemplo.com",
        subject: "Informe mensual",
        html: "<p>Adjuntamos el informe.</p>",
        attachments: [{ filename: "informe.pdf", content: pdf.toString("base64") }],
    }),
});
```
