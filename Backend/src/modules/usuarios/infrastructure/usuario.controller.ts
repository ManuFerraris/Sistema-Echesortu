import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { validarCodigo } from '../../utils/validarCodigo';
import { RegistrarUsuario } from "../application/registrarUsuario";
import { ActualizarUsuario } from '../application/actualizarUsuario';
import { ListarUsuarios } from '../application/listarUsuarios';
import { BajaLogicaUsuario } from '../application/bajaLogicaUsuario';
import { AltaLogicaUsuario } from '../application/altaLogica';

export const findAll = async (req: Request, res: Response): Promise<void> => {
    try{
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const useCase = new ListarUsuarios();
        const result = await useCase.ejecutar(em);
        res.status(result.status).json(result);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al obtener usuarios', error.message);
            res.status(500).json({ error: "Error al obtener usuarios" });
            return;
        }
        console.error('Error desconocido al obtener usuarios', error);
        res.status(500).json({ error: "Error desconocido al obtener usuarios" });
        return;
    };
};

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

export const update = async (req: Request, res: Response): Promise<void> => {
    try{
        const { valor:Codval, error } = validarCodigo(req.params.numero, 'Numero de Usuario');
        if(error || Codval === undefined){
            res.status(400).json({ error });
            return;
        };

        const em = (req.app.locals.orm as MikroORM).em.fork();
        const useCase = new ActualizarUsuario();
        const dto = req.body;
        const result = await useCase.ejecutar(dto, Codval, em);
        res.status(result.status).json(result);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al actualizar usuario', error.message);
            res.status(500).json({ error: "Error al actualizar usuario" });
            return;
        }
        console.error('Error desconocido al actualizar usuario', error);
        res.status(500).json({ error: "Error desconocido al actualizar usuario" });
        return;
    };
};

export const logicalDelete = async (req: Request, res: Response): Promise<void> => {
    try{
        const { valor:Codval, error } = validarCodigo(req.params.numero, 'Numero de Usuario');
        if(error || Codval === undefined){
            res.status(400).json({ error });
            return;
        };
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const useCase = new BajaLogicaUsuario();
        const result = await useCase.ejecutar(Codval, em);
        res.status(result.status).json(result);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al eliminar usuario', error.message);
            res.status(500).json({ error: "Error al eliminar usuario" });
            return;
        };
        console.error('Error desconocido al eliminar usuario', error);
        res.status(500).json({ error: "Error desconocido al eliminar usuario" });
        return;
    };
};

export const logicalActivate = async (req: Request, res: Response): Promise<void> => {
    try{
        const { valor:Codval, error } = validarCodigo(req.params.numero, 'Numero de Usuario');
        if(error || Codval === undefined){
            res.status(400).json({ error });
            return;
        };

        const em = (req.app.locals.orm as MikroORM).em.fork();
        const useCase = new AltaLogicaUsuario();
        const result = await useCase.ejecutar(Codval, em);

        res.status(result.status).json(result);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al activar usuario', error.message);
            res.status(500).json({ error: "Error al activar usuario" });
            return;
        };
        console.error('Error desconocido al activar usuario', error);
        res.status(500).json({ error: "Error desconocido al activar usuario" });
        return;
    };
};