import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { RegistrarUsuario } from '../application/registrarUsuario';
import { LoginUsuario } from '../application/login';

export const register = async (req: Request, res: Response): Promise<void> => {
    try{
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const useCase = new RegistrarUsuario();
        const result = await useCase.ejecutar(req.body, em);
        res.status(result.status).json(result);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al registrarse', error.message);
            res.status(500).json({ error: "Error al registrarse" });
            return;
        }
        console.error('Error desconocido al registrarse', error);
        res.status(500).json({ error: "Error desconocido al registrarse" });
        return;
    };
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try{
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const useCase = new LoginUsuario();
        const result = await useCase.ejecutar(req.body, em);
        res.status(result.status).json(result);
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al iniciar sesión', error.message);
            res.status(500).json({ error: "Error al iniciar sesión" });
            return;
        }''
        console.error('Error desconocido al iniciar sesión', error);
        res.status(500).json({ error: "Error desconocido al iniciar sesión" });
        return;
    };
};