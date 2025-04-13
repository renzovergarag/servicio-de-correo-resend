import express from "express";
import * as emailController from "../controllers/emailController";

// Crear un router
const router = express.Router();

// Definir las rutas y encapsular los controladores
router.post("/send", async (req, res) => {
    try {
        // console.log("Ruta /send llamada con datos:", req.body);
        await emailController.sendEmail(req, res);
    } catch (error) {
        console.error("Error en ruta /send:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
});

export default router;
