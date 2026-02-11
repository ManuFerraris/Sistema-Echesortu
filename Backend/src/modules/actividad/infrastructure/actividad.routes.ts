import { Router } from 'express';
import {
    crearActividad,
    listarActividades,
    editarActividad } from './actividad.controller';

export const actividadRouter = Router();

actividadRouter.get('/', listarActividades);
actividadRouter.post('/', crearActividad);
actividadRouter.put('/:id', editarActividad);