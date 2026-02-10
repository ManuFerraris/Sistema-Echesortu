import { Router } from 'express';
import { crearActividad, listarActividades } from './actividad.controller';

export const actividadRouter = Router();

actividadRouter.get('/', listarActividades);
actividadRouter.post('/', crearActividad);