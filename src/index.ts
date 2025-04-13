import express from "express";
import cors from "cors";
import { config, validateEnv } from "./config/env";
import emailRoutes from "./routes/emailRoutes";

// Verificar que las variables de entorno están configuradas correctamente
if (!validateEnv()) {
    process.exit(1);
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/email", emailRoutes);

// Ruta básica para comprobar que el servicio está funcionando
app.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "Servicio de correo electrónico funcionando correctamente con Resend",
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
    });
});

// Iniciar el servidor
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;
