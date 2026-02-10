import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { RegistrarPago } from '../application/registrarPago';

export const registrarPago = async (req: Request, res: Response) => {
    try {
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const dto = req.body;

        const casoUso = new RegistrarPago();
        const resultado = await casoUso.ejecutar(dto, em);

        res.status(resultado.status).json({
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        console.error("Error al registrar pago:", msg);
        res.status(500).json({ 
            success: false, 
            messages: ["Error interno al procesar el pago", msg],
            data: null
        });
    };
};