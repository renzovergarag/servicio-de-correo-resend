# Microservicio de Correo con Resend

Este microservicio proporciona una API REST simple y ligera para enviar correos electrónicos utilizando el servicio [Resend](https://resend.com).

## Requisitos

- Node.js v16 o superior
- Una cuenta en Resend y una API Key

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:
    ```bash
    npm install
    ```
3. Configurar variables de entorno:
    - Crear un archivo `.env` en la raíz del proyecto
    - Añadir las siguientes variables:
        ```
        RESEND_API_KEY=tu_api_key_de_resend
        PORT=3000
        ```

## Ejecución

Para desarrollo:

```bash
npm run dev
```

Para producción:

```bash
npm run build
npm start
```

## API Endpoints

### Enviar correo electrónico

`POST /api/email/send`

Cuerpo de la solicitud:

```json
{
    "from": "optional@example.com",
    "to": "recipient@example.com", // También puede ser un array de destinatarios
    "subject": "Asunto del correo",
    "html": "<p>Contenido HTML</p>",
    "text": "Contenido en texto plano (opcional si se proporciona html)",
    "cc": "cc@example.com", // Opcional
    "bcc": "bcc@example.com", // Opcional
    "replyTo": "reply@example.com" // Opcional
}
```

Respuesta exitosa:

```json
{
    "success": true,
    "data": {
        // Información devuelta por Resend
    }
}
```

## Integración en otros proyectos

Este microservicio puede ser consumido desde cualquier aplicación mediante solicitudes HTTP. Ejemplo usando fetch:

```javascript
// Enviar correo básico
const sendEmail = async (emailData) => {
    const response = await fetch("http://localhost:3000/api/email/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
    });

    return await response.json();
};

// Uso
sendEmail({
    to: "destinatario@ejemplo.com",
    subject: "Prueba de correo",
    html: "<p>Este es un correo de prueba</p>",
});
```

# Guía de integración desde otros servicios o aplicaciones

Esta sección describe cómo consumir el microservicio de correo desde otros sistemas, detallando cada etapa y el significado de los códigos de respuesta.

## 1. Preparación

- Asegúrate de que el microservicio esté desplegado y accesible (por ejemplo, en `http://localhost:3000` o la URL correspondiente).
- Ten a mano la documentación del endpoint y los datos requeridos para el envío de correos.

## 2. Endpoint principal

**POST** `/api/email/send`

### Cuerpo de la solicitud (JSON)

| Campo   | Tipo              | Requerido | Descripción                                        |
| ------- | ----------------- | --------- | -------------------------------------------------- |
| from    | string            | No        | Remitente. Si no se indica, se usa uno por defecto |
| to      | string o string[] | Sí        | Destinatario(s) del correo                         |
| subject | string            | Sí        | Asunto del correo                                  |
| html    | string            | Sí\*      | Contenido HTML del correo                          |
| text    | string            | Sí\*      | Contenido en texto plano                           |
| cc      | string o string[] | No        | Copia                                              |
| bcc     | string o string[] | No        | Copia oculta                                       |
| replyTo | string            | No        | Email de respuesta                                 |

\*Se requiere al menos uno de los campos `html` o `text`.

### Ejemplo de solicitud

```json
{
    "to": "destinatario@ejemplo.com",
    "subject": "Asunto de prueba",
    "html": "<p>Hola, este es un correo de prueba</p>"
}
```

## 3. Ejemplo de consumo desde otro servicio (Node.js/fetch)

```javascript
const response = await fetch("http://localhost:3000/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        to: "destinatario@ejemplo.com",
        subject: "Prueba",
        html: "<b>Hola!</b>",
    }),
});
const data = await response.json();
console.log(data);
```

## 4. Códigos de respuesta del servidor

| Código | Significado                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| 200    | Solicitud exitosa. El correo fue enviado correctamente.                                |
| 400    | Solicitud incorrecta. Faltan campos requeridos o el formato es inválido.               |
| 404    | Ruta no encontrada. El endpoint solicitado no existe.                                  |
| 500    | Error interno del servidor. Puede ser un fallo al enviar el correo o error inesperado. |

### Ejemplos de respuesta

**Éxito (200):**

```json
{
    "success": true,
    "data": {
        /* información devuelta por Resend */
    }
}
```

**Error de validación (400):**

```json
{
    "success": false,
    "message": "Se requieren al menos los campos: to, subject, y (html o text)"
}
```

**Error interno (500):**

```json
{
    "success": false,
    "error": "Mensaje de error detallado"
}
```

**Ruta no encontrada (404):**

```json
{
    "success": false,
    "message": "Ruta no encontrada"
}
```

## 5. Recomendaciones

- Valida siempre la respuesta del servidor y maneja los posibles errores.
- No compartas tu API Key de Resend en clientes públicos.
- Puedes ampliar el microservicio para adjuntar archivos o personalizar el remitente según tus necesidades.

## Estructura del proyecto

```
/
├── src/
│   ├── config/
│   │   └── env.ts            # Configuración de variables de entorno
│   ├── controllers/
│   │   └── emailController.ts # Controladores para manejar solicitudes
│   ├── routes/
│   │   └── emailRoutes.ts    # Definición de rutas de la API
│   ├── services/
│   │   └── emailService.ts   # Lógica de servicio para envío de correos
│   └── index.ts              # Punto de entrada de la aplicación
└── .env                      # Variables de entorno (no incluido en repositorio)
```
