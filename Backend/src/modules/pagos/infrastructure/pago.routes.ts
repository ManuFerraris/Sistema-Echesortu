import { Router } from 'express';
import { registrarPago } from './pago.controller';

export const pagoRouter = Router();

pagoRouter.post('/', registrarPago);