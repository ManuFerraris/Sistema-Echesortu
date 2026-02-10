import { Persona } from "./persona";

export interface PersonaRepository {
    buscarPersonas():Promise<Persona[]>;
    buscarPorId(id:number):Promise<Persona | null>;
    crearPersona(persona:Persona):Promise<void>;
    actualizarPersona(persona:Persona):Promise<void>;
    eliminarPersona(id:number):Promise<void>;
    guardar(persona:Persona):Promise<void>;
};