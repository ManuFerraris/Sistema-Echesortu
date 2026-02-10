import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { userContext } from '../../modules/utils/userContext';

const JWT_SECRET = 'MI_CLAVE_SUPER_SECRETA_DEL_CLUB_123';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Obtener el header "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: "No autorizado. Falta token." });
    }

    const token = authHeader.split(' ')[1]; // Sacamos la palabra "Bearer"

    if (!token) {
        return res.status(401).json({ message: "Formato de token inválido" });
    }

    // 2. Verificar Token
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { username: string, id: number };
        
        // 3. Inyectar en el Contexto (para la auditoría)
        userContext.run(decoded.username, () => {
            // Guardamos datos en req para usarlos en los controllers si hace falta
            (req as any).user = decoded; 
            next();
        });

    } catch (error) {
        return res.status(403).json({ message: "Token inválido o expirado" });
    };
};