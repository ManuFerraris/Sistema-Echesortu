import { Persona } from "../persona";
import { PersonaRepository } from "../personaRepository";

export class BuscarPersonas {
    constructor(private readonly repo:PersonaRepository){}

    async ejecutar():Promise<Persona[]>{
        return await this.repo.buscarPersonas();
    };
};