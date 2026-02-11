import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Usuario } from "../../usuarios/usuario";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_fallback_insegura';

export class LoginUsuario {
    async ejecutar(dto: { usuario: string, password: string }, em: EntityManager): Promise<ServiceResponse<{ token: string, usuario: string }>> {
        
        // 1. Buscar Usuario
        const usuario = await em.findOne(Usuario, { nombreUsuario: dto.usuario });
        
        if (!usuario) {
            return { success: false, status: 401, messages: ["Credenciales inválidas"] };
        };

        // 2. Verificar Password (Hash vs Texto Plano)
        const passwordValida = await bcrypt.compare(dto.password, usuario.password);
        
        if (!passwordValida) {
            return { success: false, status: 401, messages: ["Credenciales inválidas"] };
        }

        // 3. Generar Token
        const token = jwt.sign({ 
                numero: usuario.numero,
                username: usuario.nombreUsuario,
                rol: usuario.rol }, // Payload (datos dentro del token)
            JWT_SECRET,
            { expiresIn: '8h' } // Dura 8 horas (jornada laboral)
        );

        return {
            success: true,
            status: 200,
            messages: ["Login exitoso"],
            data: { token, usuario: usuario.nombreUsuario }
        };
    }
}