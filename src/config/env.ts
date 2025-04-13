import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Configuración para el servicio
export const config = {
    port: process.env.PORT || "3000",
    resendApiKey: process.env.RESEND_API_KEY || "",
};

// Verificar que las variables de entorno requeridas estén configuradas
export const validateEnv = (): boolean => {
    if (!config.resendApiKey) {
        console.error("Error: Se requiere RESEND_API_KEY en el archivo .env");
        return false;
    }
    return true;
};
