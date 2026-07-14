# Soporte de adjuntos vía HTTP (requerido por cx-trauma · informe de cobranza mensual)

**Origen:** proyecto **cx-trauma**, feature "Informe de cobranza mensual por centro".
Spec: `cx-trauma/docs/superpowers/specs/2026-07-11-informe-cobranza-mensual-centros-design.md`.

## Problema

El endpoint `POST /api/email/send` **descarta los adjuntos** que le llegan por HTTP.

- `src/services/emailService.ts` **sí** declara `attachments` en su interfaz `EmailOptions`
  y lo pasa a Resend.
- Pero `src/controllers/emailController.ts` **no extrae `attachments` del `req.body`**, así que
  nunca llega al service. Cualquier adjunto enviado en el request se pierde silenciosamente.

cx-trauma necesita adjuntar un PDF por cada centro en un único correo mensual. Sin este cambio,
el correo se envía **sin** los PDFs.

## Cambio requerido (controller)

En `src/controllers/emailController.ts`, agregar `attachments` al destructuring del `req.body`
y reenviarlo a `emailService.sendEmail(...)`:

```diff
 export const sendEmail = async (req: Request, res: Response) => {
     try {
-        const { from, to, subject, html, text, cc, bcc, replyTo } = req.body;
+        const { from, to, subject, html, text, cc, bcc, replyTo, attachments } = req.body;

         if (!to || !subject || (!html && !text)) {
             return res.status(400).json({
                 success: false,
                 message: "Se requieren al menos los campos: to, subject, y (html o text)",
             });
         }

         const result = await emailService.sendEmail({
             from,
             to,
             subject,
             html,
             text,
             cc,
             bcc,
             replyTo,
+            attachments,
         });
```

No se requieren cambios en `src/services/emailService.ts` (ya soporta `attachments`).

## Formato del adjunto por HTTP

Resend acepta `content` como **string base64**. cx-trauma enviará cada adjunto así:

```json
{
  "to": "mario@agenciamedica.cl",
  "cc": "contacto@neurox.cl",
  "subject": "Informe de cobranza mensual · Julio 2026",
  "html": "<resumen consolidado>",
  "attachments": [
    { "filename": "cobranza-centro-alpha-2026-07.pdf", "content": "<PDF en base64>" },
    { "filename": "cobranza-centro-beta-2026-07.pdf",  "content": "<PDF en base64>" }
  ]
}
```

> La interfaz `EmailOptions.attachments` tipa `content` como `Buffer`. Resend acepta tanto
> `Buffer` como string base64 en `content`, por lo que reenviar el string tal cual funciona.
> Si se prefiere tipado estricto, ampliar el tipo a `Buffer | string` en `emailService.ts`.

## Cambio requerido #2 (body parser) — BLOQUEANTE

`src/index.ts` monta el parser JSON sin límite explícito:

```ts
app.use(express.json());
```

El default de Express/body-parser es **100 kb**. El correo de cobranza envía varios PDFs en
base64 en un solo request, superando fácilmente ese límite → el microservicio responde
**HTTP 413 `PayloadTooLargeError: request entity too large`** y el correo NO se envía.

**Cambio requerido:** subir el límite del body JSON:

```diff
- app.use(express.json());
+ app.use(express.json({ limit: '25mb' }));
```

25 MB deja holgura de sobra (Resend acepta hasta ~40 MB por correo, y base64 infla el tamaño
~33 %). Recompilar/reiniciar el servicio tras el cambio (`npm run build && pm2 restart ...` o
el mecanismo que use el deploy).

## Consideraciones

- **Límite de tamaño**: Resend permite hasta ~40 MB por correo. Los PDFs de cobranza son
  livianos; sin riesgo con el volumen actual de centros, pero el body parser de Express debe
  aceptar el tamaño total (ver cambio #2).
- **Validación opcional**: se puede validar que `attachments`, si viene, sea un array de
  objetos `{ filename, content }`. No es bloqueante para cx-trauma.

## Verificación

Tras el cambio, un `POST /api/email/send` con `attachments` debe entregar el correo con los
archivos adjuntos visibles en la bandeja del destinatario.
