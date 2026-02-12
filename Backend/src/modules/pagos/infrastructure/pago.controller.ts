import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { RegistrarPago } from '../application/registrarPago';
import { generarReciboPDF } from '../../../shared/services/pdf.service';
import { enviarReciboPorEmail } from '../../../shared/services/email.service';
import { getUserIdFromHeader } from '../../../shared/helpers/auth.helper';

export const registrarPago = async (req: Request, res: Response) => {
    try {
        console.log("[INFO] Iniciando proceso de registro de pago");
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();

        const userId = await getUserIdFromHeader(req, em);
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                messages: ["Acceso denegado: Usuario no identificado (Falta header x-user)"] 
            });
        };
        console.log(`[INFO] Usuario identificado con ID: ${userId}`);

        const dto = req.body;
        const casoUso = new RegistrarPago();
        const resultado = await casoUso.ejecutar(dto,userId, em);
        console.log("[INFO] Resultado del caso de uso RegistrarPago:", resultado);

        if (!resultado.success || !resultado.data) {
            res.status(resultado.status).json({
                success: resultado.success,
                messages: resultado.messages,
                data: null
            });
            return;
        };

        // SI ES ÉXITO: Generamos y enviamos el PDF
        const pdfBuffer = await generarReciboPDF(resultado.data);

        const emailSocio = resultado.data.emailSocio;
        
        if (emailSocio) {
            enviarReciboPorEmail(
                emailSocio, 
                resultado.data.nombreSocio, 
                pdfBuffer, 
                resultado.data.nroComprobante
            ).then(() => console.log("[INFO] Email enviado en segundo plano"));
        }

        // 3. Respondemos al Frontend con el mismo buffer
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=recibo-${resultado.data.nroComprobante}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.send(pdfBuffer);
        return;

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        console.error("[ERROR] Error al registrar pago:", msg);
        res.status(500).json({ 
            success: false, 
            messages: ["Error interno al procesar el pago", msg],
            data: null
        });
        return;
    };
};