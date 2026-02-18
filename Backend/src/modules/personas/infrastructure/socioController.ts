import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Socio } from '../tipoPersona/socio';
import { CrearSocio } from '../application/crearSocio';

export const listarSocios = async (req: Request, res: Response): Promise<void> => {
    try {
        const em = (req.app.locals.orm as MikroORM).em.fork();
    
        const socios = await em.find(Socio, {}, { populate: ['persona'] });

        if (socios.length === 0) {
            res.status(200).json({ success: false, messages: ['No se encontraron socios.'] });
            return;
        }

        res.json({
            success: true,
            messages: ['Socios listados exitosamente.'],
            data: socios
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al listar socios' });
        return;
    };
};

export const crearSocio = async (req: Request, res: Response): Promise<void> => {
    try{
        console.log("[DEBUG] Recibido request para crear socio con body:", req.body);
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const crearSocioUseCase = new CrearSocio();

        const fotoUrl = req.file ? req.file.path : undefined;
        const dto = { ...req.body, fotoUrl };
        
        const resultado = await crearSocioUseCase.ejecutar(dto, em);
        res.status(resultado.status).json(resultado);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al crear la persona', error.message);
            res.status(500).json({ error: "Error al crear persona" });
            return;
        }
        console.error('Error desconocido al crear la persona', error);
        res.status(500).json({ error: "Error desconocido al crear persona" });
        return;
    };
}