import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { ObtenerDashboardStats } from '../application/obtenerDashboardStats';

export const getStats = async (req: Request, res: Response) => {
    try {
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork() as EntityManager;
        
        const useCase = new ObtenerDashboardStats();
        const result = await useCase.ejecutar(em);
        
        res.status(result.status).json(result);
        return;
    }  catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ success: false, messages: ["Error al obtener dashboard", msg] });
        return;
    }
};