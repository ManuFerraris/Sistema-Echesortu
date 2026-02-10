import { PersonaRepository } from "../personaRepository";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

export class DarDeBajaPersona {
    constructor(private readonly repo:PersonaRepository){}

    async ejecutar(id:number):Promise<ServiceResponse<null>>{
        const persona = await this.repo.buscarPorId(id);
        if(!persona){
            return {
                status: 404,
                success: false,
                messages: ["No se encontró la persona con el ID proporcionado."],
            };
        };

        if (!persona.activo) {
            return {
                status: 400,
                success: false,
                messages: ["La persona ya se encuentra dada de baja."]
            };
        };

        persona.activo = false;
        await this.repo.guardar(persona);
        return {
            status: 200,
            success: true,
            messages: ["Persona dada de baja exitosamente. El historial se mantiene."]
        };
    };
};