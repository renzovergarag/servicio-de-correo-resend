import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Configuración para el servicio
export const config = {
    port: process.env.PORT || "3000",
    resendApiKey: process.env.RESEND_API_KEY || "",
    // Remitente usado cuando la petición no incluye `from`.
    // Debe pertenecer a un dominio verificado en tu cuenta de Resend.
    defaultFrom: process.env.DEFAULT_FROM || "",
    // Dirección de respuesta por defecto (opcional).
    // A diferencia de `from`, no requiere dominio verificado.
    defaultReplyTo: process.env.DEFAULT_REPLY_TO || "",
};

// Verificar que las variables de entorno requeridas estén configuradas
export const validateEnv = (): boolean => {
    if (!config.resendApiKey) {
        console.error("Error: Se requiere RESEND_API_KEY en el archivo .env");
        return false;
    }
    if (!config.defaultFrom) {
        console.error("Error: Se requiere DEFAULT_FROM en el archivo .env (ej: notificaciones@tu-dominio.com)");
        return false;
    }
    return true;
};
