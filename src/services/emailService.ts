import { Resend } from "resend";
import { config } from "../config/env";

interface EmailOptions {
    from?: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: {
        filename: string;
        content: Buffer;
    }[];
}

class EmailService {
    private resend: Resend;
    private defaultSender: string;

    constructor() {
        this.resend = new Resend(config.resendApiKey);
        this.defaultSender = "onboarding@resend.dev"; // Emisor por defecto de Resend o puedes cambiarlo
    }

    /**
     * Envía un correo electrónico usando Resend
     * @param options Opciones del correo electrónico
     * @returns Resultado del envío
     */
    async sendEmail(options: EmailOptions) {
        try {
            const { from = this.defaultSender, to, subject, html, text, cc, bcc, replyTo, attachments } = options;

            const result = await this.resend.emails.send({
                from,
                to,
                subject,
                html,
                text,
                cc,
                bcc,
                reply_to: replyTo,
                attachments,
            });

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("Error al enviar correo electrónico:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }

    /**
     * Envía un correo electrónico usando una plantilla
     * @param to Destinatario(s)
     * @param subject Asunto
     * @param templateId ID de la plantilla en Resend
     * @param data Datos para la plantilla
     * @returns Resultado del envío
     */
    async sendTemplateEmail(to: string | string[], subject: string, templateId: string, data: Record<string, any>) {
        try {
            const result = await this.resend.emails.send({
                from: this.defaultSender,
                to,
                subject,
                react: templateId,
                react_data: data,
            });

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error("Error al enviar correo con plantilla:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            };
        }
    }
}

export default new EmailService();
