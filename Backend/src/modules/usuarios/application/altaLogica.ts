import { Usuario } from "../usuario";
import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

export class AltaLogicaUsuario {
    constructor(){};
    async ejecutar(numero: number, em: EntityManager): Promise<ServiceResponse<Usuario | null>> {
        const usuario = await em.findOne(Usuario, { numero });
        if (!usuario) {
            return {
                status: 404,
                success: false,
                messages: ["Usuario no encontrado"],
                data: null
            };
        };

        if(usuario.activo){
            return {
                status: 400,
                success: false,
                messages: ["El usuario ya está activo"],
                data: usuario
            };
        };

        usuario.activo = true;
        await em.flush();

        console.log(`[DEBUG] Usuario con numero ${numero} dado de alta lógicamente`);
        return {
            status: 200,
            success: true,
            messages: ["Usuario dado de alta lógicamente"],
            data: usuario
        };
    }
}