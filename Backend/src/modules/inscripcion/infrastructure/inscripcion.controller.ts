import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { InscribirSocio } from '../application/crearInscripcion';

export const incribirSocio = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const dto = req.body;

        const casoUso = new InscribirSocio();
        const resultado = await casoUso.ejecutar(dto, em);

        res.status(resultado.status).json({
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data
        });
        return;

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ success: false, messages: ["Error al inscribir socio", msg] });
        return;
    }
};