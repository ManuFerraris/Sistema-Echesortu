import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/core";
import { validarCodigo } from "../../utils/validarCodigo";
import { PersonaRepositoryORM } from "./personaRepositoryORM";
import { BuscarPersonas } from "../application/buscarPersonas";
import { BuscarPersona } from "../application/buscarPersona";
import { CrearPersona } from "../application/crearPersona";
import { ActualizarPersona } from "../application/actualizarPersonas";
import { DarDeBajaPersona } from "../application/eliminarPersona";
import { ReactivarPersona } from "../application/reactivarPersona";
import { ObtenerEstadoCuenta } from "../application/obtenerEstadoCuenta";
import { ObtenerPersona } from "../application/obtenerPersona";

export const getPersonas = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const repo = new PersonaRepositoryORM(em);
        const casoUso = new BuscarPersonas(repo);
        
        const personas = await casoUso.ejecutar();
        if(personas.length === 0){
            res.status(200).json({ message: 'No se encontraron personas registradas.' });
            return;
        };

        res.status(200).json({ message: 'Personas encontradas', data:personas });
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
    }
};

export const getPersona = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();

        const termino = req.query.q as string;

        const repo = new PersonaRepositoryORM(em);
        const casoUso = new BuscarPersona(repo);

        const result = await casoUso.ejecutar(termino);

        res.status(result.status).json(result);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al buscar la persona', error.message);
            res.status(500).json({ error: "Error al buscar persona" });
            return;
        }
        console.error('Error desconocido al buscar la persona', error);
        res.status(500).json({ error: "Error desconocido al buscar persona" });
        return;
    }
};

export const obtenerPersona = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const {valor: codVal, error:codError} = validarCodigo(req.params.id, 'Nro de persona');
        if(codError || codVal === undefined){
            res.status(400).json({ error: codError });
            return;
        };
        const repo = new PersonaRepositoryORM(em);
        const casoUso = new ObtenerPersona(repo);
        const result = await casoUso.ejecutar(codVal);
        res.status(result.status).json(result);
        return;
    }catch(error:unknown){
        if (error instanceof Error) {
            console.error('Error al buscar la persona', error.message);
            res.status(500).json({ error: "Error al buscar persona" });
            return;
        }
        console.error('Error desconocido al buscar la persona', error);
        res.status(500).json({ error: "Error desconocido al buscar persona" });
        return;
    }
};

export const crearPersona = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const repo = new PersonaRepositoryORM(em);
        const casoUso = new CrearPersona(repo);

        const dto = req.body;
        const resultado = await casoUso.ejecutar(dto, em);

        res.status(resultado.status).json({ 
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data || null
        });
        return;

    }catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        
        res.status(500).json({
            success: false,
            messages: ["Error interno del servidor", errorMsg], // Array unificado
            data: null
        });
        return;
    };
};

export const actualizarPersona = async (req: Request, res: Response):Promise<void> => {
    try{
        const {valor: codVal, error:codError} = validarCodigo(req.params.nro, 'Nro de persona');
        if(codError || codVal === undefined){
            res.status(400).json({ error: codError });
            return;
        };

        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const repo = new PersonaRepositoryORM(em);
        const casoUso = new ActualizarPersona(repo);

        const dto = req.body;
        const resultado = await casoUso.ejecutar(dto, em, codVal);

        res.status(resultado.status).json({ 
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data || null
        });
        return;
    }catch(error:unknown){
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        
        res.status(500).json({
            success: false,
            messages: ["Error interno del servidor", errorMsg],
            data: null
        });
        return;
    };
};

export const darDeBajaPersona = async (req: Request, res: Response):Promise<void> => {
    try{
        const {valor: codVal, error:codError} = validarCodigo(req.params.nro, 'Nro de persona');
        if(codError || codVal === undefined){
            res.status(400).json({ error: codError });
            return;
        };

        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const repo = new PersonaRepositoryORM(em);
        const casoUso = new DarDeBajaPersona(repo);

        const resultado = await casoUso.ejecutar(codVal);

        res.status(resultado.status).json({ 
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data || null
        });
        return;
    }catch(error:unknown){
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        
        res.status(500).json({
            success: false,
            messages: ["Error interno del servidor", errorMsg],
            data: null
        });
        return;
    }
};

export const reactivarPersonaController = async (req: Request, res: Response):Promise<void> => {
    try{
        const {valor: codVal, error:codError} = validarCodigo(req.params.nro, 'Nro de persona');
        if(codError || codVal === undefined){
            res.status(400).json({ error: codError });
            return;
        };

        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const repo = new PersonaRepositoryORM(em);
        const casoUso = new ReactivarPersona(repo);

        const resultado = await casoUso.ejecutar(codVal);

        res.status(resultado.status).json({ 
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data || null
        });
        return;
    }catch(error:unknown){
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        
        res.status(500).json({
            success: false,
            messages: ["Error interno del servidor", errorMsg],
            data: null
        });
        return;
    };
};

export const getEstadoCuenta = async (req: Request, res: Response) => {
    try {
        const {valor: codVal, error:codError} = validarCodigo(req.params.nro, 'Nro de persona');
        if(codError || codVal === undefined){
            res.status(400).json({ error: codError });
            return;
        };
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        
        const repo = new PersonaRepositoryORM(em);
        const casoUso = new ObtenerEstadoCuenta(repo);

        const resultado = await casoUso.ejecutar(codVal, em);

        res.status(resultado.status).json({
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data || null
        });

    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        
        res.status(500).json({
            success: false,
            messages: ["Error interno del servidor", errorMsg],
            data: null
        });
        return;
    };
};