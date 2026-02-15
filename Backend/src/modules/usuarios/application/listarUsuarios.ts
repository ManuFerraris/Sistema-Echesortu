import { EntityManager } from "@mikro-orm/core";
import { Usuario } from "../usuario";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

export class ListarUsuarios {
    constructor(){};
    async ejecutar(em: EntityManager): Promise<ServiceResponse<Usuario[]>> {
        const usuarios = await em.find(Usuario, {});
        return {
            success: true,
            status: 200,
            messages: ["Usuarios obtenidos correctamente"],
            data: usuarios
        };
    };
};