import * as bcrypt from "bcrypt";
import { Usuario } from "../usuario";
import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

interface UsuarioDTO{
    nombreUsuario?: string;
    password?: string;
    rol?: "ADMIN" | "SECRETARY";
};

export class ActualizarUsuario {
    constructor(){};
    async ejecutar(dto: UsuarioDTO, numero: number, em: EntityManager): Promise<ServiceResponse<Usuario>> {
        const usuario = await em.findOne(Usuario, { numero });
        if(!usuario){
            return {
                success: false,
                status: 404,
                messages: ["Usuario no encontrado"]
            };
        };

        const usuarioExistente = await em.findOne(Usuario, { nombreUsuario: dto.nombreUsuario });
        if(usuarioExistente && usuarioExistente.numero !== numero){
            return {
                success: false,
                status: 400,
                messages: ["El nombre de usuario ya está en uso por otro usuario"],
                data: usuarioExistente
            };
        };
        
        if(dto.nombreUsuario !== undefined) usuario.nombreUsuario = dto.nombreUsuario;
        if(dto.password !== undefined) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
            usuario.password = hashedPassword;
        };
        if(dto.rol !== undefined) usuario.rol = dto.rol;

        await em.persist(usuario).flush();
        return {
            success: true,
            status: 200,
            messages: ["Usuario actualizado correctamente"],
            data: usuario
        };
    }
}