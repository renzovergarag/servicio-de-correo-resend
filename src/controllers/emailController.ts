import { Request, Response } from "express";
import emailService from "../services/emailService";

export const sendEmail = async (req: Request, res: Response) => {
    try {
        const { from, to, subject, html, text, cc, bcc, replyTo } = req.body;

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
        });

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error en el controlador de envío de email:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Error desconocido",
        });
    }
};

export const sendTemplateEmail = async (req: Request, res: Response) => {
    try {
        const { to, subject, templateId, data } = req.body;

        if (!to || !subject || !templateId || !data) {
            return res.status(400).json({
                success: false,
                message: "Se requieren los campos: to, subject, templateId y data",
            });
        }

        const result = await emailService.sendTemplateEmail(to, subject, templateId, data);

        if (!result.success) {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error en el controlador de envío con plantilla:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Error desconocido",
        });
    }
};
