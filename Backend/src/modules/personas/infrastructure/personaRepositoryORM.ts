import { EntityManager } from "@mikro-orm/core";
import { Persona } from "../persona";
import { PersonaRepository } from "../personaRepository";

export class PersonaRepositoryORM implements PersonaRepository {
    constructor(private readonly em:EntityManager){}

    async buscarPersonas():Promise<Persona[]>{
        return await this.em.find(Persona, {});
    };

    async buscarPorId(id:number):Promise<Persona | null>{
        return await this.em.findOne(Persona, {nro:id});
    };

    async crearPersona(persona:Persona):Promise<void>{
        await this.em.persist(persona).flush();
    };

    async actualizarPersona(persona:Persona):Promise<void>{
        await this.em.persist(persona).flush();
    };

    async eliminarPersona(id:number):Promise<void>{
        const persona = await this.buscarPorId(id);
        if(persona){
            await this.em.remove(persona).flush();
        }
    };

    async guardar(persona:Persona):Promise<void>{
        await this.em.persist(persona).flush();
    };

    async buscarPorDescParcial(termino:string):Promise<Persona[]>{
        return await this.em.find(Persona, {
            $or: [
                { nombre: { $like: `%${termino}%` } },
                { apellido: { $like: `%${termino}%` } },
                { dni_cuit: { $like: `%${termino}%` } }
            ]
        }, {
            limit: 10 // Solo traemos los primeros 10 para no saturar
        });
    };
};