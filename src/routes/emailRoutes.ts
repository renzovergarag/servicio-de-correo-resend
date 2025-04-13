import { Router } from "express";
import * as emailController from "../controllers/emailController";

const router = Router();

// Ruta para enviar correo electrónico básico
router.post("/send", emailController.sendEmail);

// Ruta para enviar correo usando plantillas de Resend
router.post("/send-template", emailController.sendTemplateEmail);

export default router;
