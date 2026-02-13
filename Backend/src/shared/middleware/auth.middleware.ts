import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_fallback_insegura';

// Extendemos la interfaz de Request para que acepte 'user'
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Obtener el header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            messages: ["Acceso denegado. Falta el token de autenticación."] 
        });
    }
    const token = authHeader.split(' ')[1]; // Sacamos la palabra "Bearer"

    if (!token) {
        return res.status(401).json({
            success: false, 
            messages: ["Formato de token inválido. Debe ser 'Bearer <token>'"] 
        });
    };

    try {
        // Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        // Inyectar el usuario en la request para que los controladores lo usen
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            messages: ["Token inválido o expirado."] 
        });
    }
};