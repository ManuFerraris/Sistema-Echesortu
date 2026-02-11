import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { RegistrarPago } from '../application/registrarPago';
import { generarReciboPDF } from '../../../shared/services/pdf.service';

export const registrarPago = async (req: Request, res: Response) => {
    try {
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const dto = req.body;

        const casoUso = new RegistrarPago();
        const resultado = await casoUso.ejecutar(dto, em);

        if (!resultado.success || !resultado.data) {
            res.status(resultado.status).json({
                success: resultado.success,
                messages: resultado.messages,
                data: null
            });
            return;
        };

        // SI ES ÉXITO: Generamos y enviamos el PDF
        // Headers para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=recibo-${resultado.data.nroComprobante}.pdf`);
        
        // Stream directo al cliente
        generarReciboPDF(resultado.data, res);
        return;

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        console.error("Error al registrar pago:", msg);
        res.status(500).json({ 
            success: false, 
            messages: ["Error interno al procesar el pago", msg],
            data: null
        });
        return;
    };
};