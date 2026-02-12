import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, override: true });

const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Para evitar problemas con certificados en algunos entornos
    }
});

export const enviarReciboPorEmail = async (destinatario: string, nombreSocio: string, pdfBuffer: Buffer, nroComprobante: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"Club Deportivo" <${EMAIL_USER}>`,
            to: destinatario,
            subject: `Comprobante de Pago - ${nroComprobante}`,
            html: `
                <h3>Hola ${nombreSocio},</h3>
                <p>Te adjuntamos el comprobante de tu último pago.</p>
                <p>¡Gracias por ser parte del club!</p>
            `,
            attachments: [
                {
                    filename: `Recibo-${nroComprobante}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });
        console.log("Email enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error enviando email:", error);
        return false; 
    }
};