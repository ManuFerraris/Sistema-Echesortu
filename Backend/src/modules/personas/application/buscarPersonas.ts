import { Persona } from "../persona";
import { PersonaRepository } from "../personaRepository";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

export class BuscarPersonas {
    constructor(private readonly repo:PersonaRepository){}

    async ejecutar():Promise<ServiceResponse<Persona[]>>{
        const personas =  await this.repo.buscarPersonas();
        return {
            success: true,
            status: 200,
            messages: [],
            data: personas
        };
    };
};