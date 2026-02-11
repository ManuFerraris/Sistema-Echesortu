import { Persona } from "../persona.js";
import { ServiceResponse } from "../../../shared/types/serviceResponse.js";
import { PersonaRepository } from "../personaRepository.js";

export class ObtenerPersona {
    constructor(private readonly repo:PersonaRepository){};
    async ejecutar(id: number): Promise<ServiceResponse<Persona>> {
        if (!id || id <= 0) {
            return { success: false, status: 400, messages: ["ID de persona inválido"] };
        }
        const persona = await this.repo.buscarPorId(id);
        if (!persona) {
            return { success: false, status: 404, messages: ["No se encontró una persona con el ID proporcionado"] };
        };
        return { success: true, status: 200, messages: ["Persona encontrada"], data: persona };
    };
};