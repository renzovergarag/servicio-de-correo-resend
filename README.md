# Microservicio de Correo con Resend

Microservicio en Node.js + TypeScript que expone una API REST simple para enviar correos
electrónicos a través de [Resend](https://resend.com).

Su utilidad principal es centralizar el envío de correo de varios servicios internos: la API Key
de Resend vive en un solo lugar, el remitente por defecto se configura una vez, y los consumidores
solo hacen una petición HTTP sin necesidad de instalar el SDK.

## Requisitos

- Node.js v18 o superior
- Una cuenta en Resend con un dominio verificado y una API Key

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:
    ```bash
    npm install
    ```
3. Crear el archivo `.env` a partir del ejemplo:
    ```bash
    cp .env.example .env
    ```

### Variables de entorno

| Variable           | Requerida | Descripción                                                              |
| ------------------ | --------- | ------------------------------------------------------------------------ |
| `RESEND_API_KEY`   | Sí        | API Key de Resend                                                        |
| `PORT`             | No        | Puerto del servicio (por defecto `3000`)                                 |
| `DEFAULT_FROM`     | Sí        | Remitente usado cuando la petición no incluye `from`                     |
| `DEFAULT_REPLY_TO` | No        | Dirección de respuesta por defecto, si la petición no incluye `replyTo`  |

> **Importante:** el dominio de `DEFAULT_FROM` (y de cualquier `from` que se envíe por petición)
> **debe estar verificado en tu cuenta de Resend**. Resend rechaza los envíos desde dominios no
> verificados. `DEFAULT_REPLY_TO`, en cambio, puede ser cualquier dirección — es útil para que un
> remitente `no-reply` reciba las respuestas en un buzón real.

El servicio no arranca si falta `RESEND_API_KEY` o `DEFAULT_FROM`.

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

## API

### `GET /`

Healthcheck. Responde `200` con el estado del servicio.

### `POST /api/email/send`

#### Cuerpo de la solicitud (JSON)

| Campo         | Tipo                | Requerido | Descripción                                          |
| ------------- | ------------------- | --------- | ---------------------------------------------------- |
| `from`        | `string`            | No        | Remitente. Si se omite, se usa `DEFAULT_FROM`        |
| `to`          | `string \| string[]`| Sí        | Destinatario(s)                                      |
| `subject`     | `string`            | Sí        | Asunto del correo                                    |
| `html`        | `string`            | Sí\*      | Contenido HTML                                       |
| `text`        | `string`            | Sí\*      | Contenido en texto plano                             |
| `cc`          | `string \| string[]`| No        | Copia                                                |
| `bcc`         | `string \| string[]`| No        | Copia oculta                                         |
| `replyTo`     | `string`            | No        | Dirección de respuesta. Si se omite, `DEFAULT_REPLY_TO` |
| `attachments` | `array`             | No        | Archivos adjuntos — ver [docs/adjuntos.md](docs/adjuntos.md) |

\*Se requiere al menos uno de `html` o `text`.

#### Ejemplo

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "destinatario@ejemplo.com",
    "subject": "Asunto de prueba",
    "html": "<p>Hola, este es un correo de prueba</p>"
  }'
```

#### Respuestas

| Código | Significado                                                        |
| ------ | ------------------------------------------------------------------ |
| `200`  | Correo enviado y aceptado por Resend                               |
| `400`  | Faltan campos requeridos o el formato es inválido                  |
| `404`  | Ruta no encontrada                                                 |
| `413`  | El cuerpo excede el límite configurado (adjuntos muy grandes)      |
| `500`  | Resend rechazó el envío, o error interno                           |

**Éxito (200):**

```json
{
    "success": true,
    "data": {
        /* información devuelta por Resend */
    }
}
```

**Error (400 / 500):**

```json
{
    "success": false,
    "error": "Mensaje de error detallado"
}
```

> El SDK de Resend no lanza excepciones ante errores de la API: devuelve `{ data, error }`. El
> servicio inspecciona ese campo, de modo que un dominio no verificado o un destinatario inválido
> se reportan como `500` con `success: false`, y no como un envío exitoso.

## Consumo desde otro servicio

```javascript
const enviarCorreo = async (datos) => {
    const respuesta = await fetch("http://localhost:3000/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    return await respuesta.json();
};

await enviarCorreo({
    to: "destinatario@ejemplo.com",
    subject: "Prueba",
    html: "<b>Hola!</b>",
});
```

## Despliegue

El repositorio incluye dos workflows de GitHub Actions:

- **`.github/workflows/ci.yml`** — se ejecuta en cada Pull Request sobre un runner de GitHub
  (`ubuntu-latest`). Solo instala dependencias y compila; no tiene acceso a secrets ni a
  infraestructura.
- **`.github/workflows/deploy.yml`** — se ejecuta solo en `push` a `main`, sobre un runner
  self-hosted. Compila, genera el `.env` desde el secret `ENV_PROD` y recarga el proceso en pm2.

Para desplegar en tu propio servidor necesitas:

1. Un [runner self-hosted](https://docs.github.com/actions/hosting-your-own-runners) registrado con
   la etiqueta que uses en `deploy.yml`.
2. El secret `ENV_PROD` con el contenido completo del `.env` de producción.
3. Un proceso pm2 con el nombre indicado en el workflow.

> **Seguridad:** no uses runners self-hosted en repositorios públicos con workflows disparados por
> `pull_request`. Cualquiera podría ejecutar código arbitrario en tu servidor mediante un PR. Por
> eso el CI de PRs corre en `ubuntu-latest` y solo el push a `main` toca el runner propio.

## Estructura del proyecto

```
/
├── .github/workflows/
│   ├── ci.yml                 # Validación de Pull Requests
│   └── deploy.yml             # Despliegue a producción
├── docs/
│   └── adjuntos.md            # Guía de envío de adjuntos
├── src/
│   ├── config/env.ts          # Configuración y validación de variables de entorno
│   ├── controllers/           # Controladores de las peticiones
│   ├── routes/                # Definición de rutas
│   ├── services/              # Integración con Resend
│   └── index.ts               # Punto de entrada
└── .env.example               # Plantilla de variables de entorno
```

## Consideraciones

- **El servicio no incluye autenticación.** Si lo expones públicamente, cualquiera podría enviar
  correos usando tu dominio verificado. Ubícalo en una red privada, o protégelo con un API token
  propio y una política de CORS restringida antes de publicarlo.
- No compartas tu API Key de Resend en clientes públicos.
- Considera usar una API Key de Resend con permisos restringidos a solo envío.

## Licencia

ISC
