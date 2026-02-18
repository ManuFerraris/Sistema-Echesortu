import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { EntityManager } from "@mikro-orm/core";
import { Socio } from "../tipoPersona/socio";

export class ReactivarSocio {
    constructor(private readonly em: EntityManager) {}

    async ejecutar(id: number): Promise<ServiceResponse<null>> {
        const socio = await this.em.findOne(Socio, { nro: id });

        if (!socio) {
            return {
                status: 404,
                success: false,
                messages: ["No se encontró el socio."]
            };
        }

        if (socio.activo) {
            return {
                status: 400,
                success: false,
                messages: ["El socio ya se encuentra activo."]
            };
        }

        socio.activo = true;
        socio.fechaReincorporacion = new Date(); 

        await this.em.persist(socio).flush();

        return {
            status: 200,
            success: true,
            messages: ["Socio reactivado exitosamente."]
        };
    }
}