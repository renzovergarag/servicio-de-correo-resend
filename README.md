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
