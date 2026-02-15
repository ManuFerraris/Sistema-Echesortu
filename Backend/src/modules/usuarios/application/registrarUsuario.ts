import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Usuario } from "../usuario";
import * as bcrypt from "bcrypt";

export class RegistrarUsuario {
    async ejecutar(dto: { usuario: string, password: string, rol: "ADMIN" | "SECRETARY" }, em: EntityManager): Promise<ServiceResponse<Usuario>> {
        
        const existe = await em.count(Usuario, { nombreUsuario: dto.usuario });
        if (existe > 0) {
            return { success: false, status: 400, messages: ["El usuario ya existe"] };
        };

        if(dto.rol !== "ADMIN" && dto.rol !== "SECRETARY"){
            return {
                success: false,
                status: 400,
                messages: ["Rol inválido. Debe ser 'admin' o 'secretary'"]
            };
        };

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        const nuevo = new Usuario();
        nuevo.nombreUsuario = dto.usuario;
        nuevo.password = hashedPassword;
        nuevo.rol = dto.rol;

        await em.persist(nuevo).flush();

        return {
            success: true, 
            status: 201, 
            messages: ["Usuario creado"], 
            data: nuevo 
        };
    }
}