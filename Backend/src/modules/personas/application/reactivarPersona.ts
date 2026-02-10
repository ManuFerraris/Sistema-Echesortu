import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { PersonaRepository } from "../personaRepository";

export class ReactivarPersona {
    constructor(private readonly repo: PersonaRepository) {}

    async ejecutar(id: number): Promise<ServiceResponse<null>> {
        // 1. Buscamos
        const persona = await this.repo.buscarPorId(id);

        if (!persona) {
            return {
                status: 404,
                success: false,
                messages: ["No se encontró la persona."]
            };
        }

        if (persona.activo) {
            return {
                status: 400,
                success: false,
                messages: ["La persona ya se encuentra activa."]
            };
        }

        persona.activo = true;
        persona.fechaReincorporacion = new Date(); 

        await this.repo.guardar(persona);

        return {
            status: 200,
            success: true,
            messages: ["Persona reactivada exitosamente."]
        };
    }
}