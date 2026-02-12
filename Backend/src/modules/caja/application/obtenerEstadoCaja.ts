import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Caja } from "../caja";
import { Usuario } from "../../usuarios/usuario";

export class ObtenerEstadoCaja {
    async ejecutar(usuarioId: number, em: EntityManager): Promise<ServiceResponse<Caja | null>> {
        const usuario = await em.findOne(Usuario, { numero: usuarioId });
        if (!usuario) {
            return {
                success: false,
                status: 404,
                messages: ["Usuario no encontrado"],
                data: null
            };
        };

        const cajaAbierta = await em.findOne(Caja, {
            usuario: usuario,
            estado: 'abierta'
        });

        return {
            success: true,
            status: 200,
            messages: cajaAbierta ? ["Caja abierta encontrada"] : ["No hay caja abierta"],
            data: cajaAbierta || null
        };
    };
};