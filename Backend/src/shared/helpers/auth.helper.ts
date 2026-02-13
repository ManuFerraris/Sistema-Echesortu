import { Request } from 'express';
import { EntityManager } from '@mikro-orm/core';

export async function getUserIdFromHeader(req: Request, em?: EntityManager): Promise<number | null> {
    // Si el middleware hizo su trabajo, req.user ya existe
    if (req.user && req.user.numero) {
        return req.user.numero;
    }

    return null;
};