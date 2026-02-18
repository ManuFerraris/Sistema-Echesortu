import { PersonaRepository } from "../personaRepository";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

// Por el momento no sirve porque ahora se da de baja el socio y no la persona,
// pero lo dejo por si en el futuro se quiere implementar una baja lógica para
// personas que no son socios o para mantener un historial de personas dadas de baja.

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

        //persona.activo = false; // Damos de baja la persona (sin eliminarla físicamente)

        await this.repo.guardar(persona);
        return {
            status: 200,
            success: true,
            messages: ["Persona dada de baja exitosamente. El historial se mantiene."]
        };
    };
};