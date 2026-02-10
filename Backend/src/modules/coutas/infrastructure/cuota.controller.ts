import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { CuotaRepositoryORM } from './coutaRepositoryORM';
import { GenerarCuotasMasivas } from '../application/generarCuotasMasivas';
import { BuscarCuotas } from '../application/buscarCuotas';

export const buscarCuotas = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const repo = new CuotaRepositoryORM(em);
        const casoUso = new BuscarCuotas(repo);
        const resultado = await casoUso.ejecutar();
        
        res.status(resultado.status).json({
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data
        });
        return;
    }catch(error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al cargar cuotas", errorMsg],
            data: null
        });
    }
};

export const generarCuotasMasivas = async (req: Request, res: Response) => {
    try {
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const dto = req.body;

        const casoUso = new GenerarCuotasMasivas();
        const resultado = await casoUso.ejecutar(dto, em);

        res.status(resultado.status).json({
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data
        });

    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al generar cuotas", errorMsg],
            data: null
        });
    };
};