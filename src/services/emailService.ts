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
        content: Buffer | string;
    }[];
}

class EmailService {
    private resend: Resend;
    private defaultSender: string;
    private defaultReplyTo: string;

    constructor() {
        this.resend = new Resend(config.resendApiKey);
        this.defaultSender = config.defaultFrom;
        this.defaultReplyTo = config.defaultReplyTo;
    }

    /**
     * Envía un correo electrónico usando Resend
     * @param options Opciones del correo electrónico
     * @returns Resultado del envío
     */
    async sendEmail(options: EmailOptions) {
        try {
            const {
                from = this.defaultSender,
                to,
                subject,
                html,
                text,
                cc,
                bcc,
                replyTo = this.defaultReplyTo || undefined,
                attachments,
            } = options;

            const emailOptions: any = {
                from,
                to,
                subject,
                html,
                text,
                cc,
                bcc,
                replyTo,
                attachments,
            };

            if (!html && !text) {
                throw new Error("Either 'html' or 'text' must be provided.");
            }

            const result = await this.resend.emails.send(emailOptions);

            // El SDK de Resend no lanza excepciones ante errores de la API:
            // devuelve { data, error }. Sin este chequeo, un dominio no verificado
            // o un destinatario inválido se reportarían como envío exitoso.
            if (result.error) {
                console.error("Resend rechazó el envío:", result.error);
                return {
                    success: false,
                    error: result.error.message || "Resend rechazó el envío",
                };
            }

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
}

export default new EmailService();
