import { Router } from 'express';
import { login, register } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register); // Solo para crear el primer usuario!!!