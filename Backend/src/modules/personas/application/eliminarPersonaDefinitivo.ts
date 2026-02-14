import { PersonaRepository } from "../personaRepository.js";
import { ServiceResponse } from "../../../shared/types/serviceResponse.js";

export class EliminarPersonaDefinitivo {
    constructor(private readonly repo: PersonaRepository) {}
    async ejecutar(id: number): Promise<ServiceResponse<null>> {
        const persona = await this.repo.buscarPorId(id);
        if (!persona) {
            return {
                status: 404,
                success: false,
                messages: ["No se encontró la persona con el ID proporcionado."],
            };
        }
        await this.repo.eliminarPersona(id);
        return {
            status: 200,
            success: true,
            messages: ["Persona eliminada correctamente."],
        };
    };
};