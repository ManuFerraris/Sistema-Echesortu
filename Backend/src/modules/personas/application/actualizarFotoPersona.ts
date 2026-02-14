import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Persona } from "../persona";

export class ActualizarFotoPersona {
    async ejecutar(idPersona: number, fotoUrl: string, em: EntityManager): Promise<ServiceResponse<Persona>> {

        const persona = await em.findOne(Persona, { nro: idPersona });
        if (!persona) {
            return {
                status: 404,
                success: false,
                messages: ["Persona no encontrada"]
            };
        }
        
        // Actualizamos la URL de la foto
        persona.fotoUrl = fotoUrl;
        
        await em.flush();

        return {
            status: 200,
            success: true,
            messages: ["Foto de perfil actualizada exitosamente"],
            data: persona
        };
    }
}