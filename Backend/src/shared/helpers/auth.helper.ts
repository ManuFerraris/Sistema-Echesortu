import { Request } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { Usuario } from '../../modules/usuarios/usuario';

export async function getUserIdFromHeader(req: Request, em: EntityManager): Promise<number | null> {
    const username = req.headers['x-user'];
    if (!username) return null;
    
    const user = await em.findOne(Usuario, { nombreUsuario: username });
    return user ? user.numero : null; 
};