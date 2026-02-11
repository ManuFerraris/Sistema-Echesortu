import { Persona } from "../persona";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { PersonaRepository } from "../personaRepository";

export class BuscarPersona {
    constructor(private readonly repo:PersonaRepository){};
    
    async ejecutar(termino: string): Promise<ServiceResponse<Persona[]>> {
        if (!termino || termino.length < 2) {
            return { success: false, status: 400, messages: ["Ingresa al menos 2 caracteres"] };
        };
        const personas = await this.repo.buscarPorDescParcial(termino);
        return {
            success: true,
            status: 200,
            messages:[`Se encontraron ${personas.length} coincidencias`],
            data: personas
        };
    };
}