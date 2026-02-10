import { Persona } from "../persona";
import { PersonaRepository } from "../personaRepository";

export class BuscarPersona {
    constructor(private readonly repo:PersonaRepository){};
    
    async ejecutar(id: number): Promise<Persona | null> {
        return this.repo.buscarPorId(id);
    };
}