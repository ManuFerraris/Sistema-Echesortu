import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Persona } from "../persona";
import { PersonaDTO, validarActualizacionPersona } from "../personaDTO";
import { PersonaRepository } from "../personaRepository";

export class ActualizarPersona {
    constructor(private readonly repo:PersonaRepository){}

    async ejecutar(dto:PersonaDTO, em:EntityManager, nro:number):Promise<ServiceResponse<Persona>>{
        
        const errores = await validarActualizacionPersona(dto, em, nro);
        if(errores.length > 0){
            return {
                status: 400,
                success: false,
                messages: errores,
            };
        };

        const persona = await this.repo.buscarPorId(nro); 
        if (!persona) {
            return {
                status: 404,
                success: false,
                messages: ['Persona no encontrada.'],
            };
        };

        //(Solo actualizamos si el dato existe en el DTO)
        
        if (dto.nombre) persona.nombre = dto.nombre;
        if (dto.apellido) persona.apellido = dto.apellido;
        if (dto.dni_cuit) persona.dni_cuit = dto.dni_cuit;
        if (dto.email) persona.email = dto.email;
        if (dto.domicilio) persona.domicilio = dto.domicilio;
        if (dto.telefono) persona.telefono = dto.telefono;
        if (dto.tipo) persona.tipo = dto.tipo;
        
        // Manejo especial para booleanos (verificar undefined, no falsy)
        if (dto.activo !== undefined) persona.activo = dto.activo;

        // Manejo especial para fechas (Convertir string a Date)
        if (dto.fechaNacimiento) {
            persona.fechaNacimiento = new Date(dto.fechaNacimiento);
        }
        
        // Campos opcionales del grupo familiar
        if (dto.rol_grupo_familiar) persona.rol_grupo_familiar = dto.rol_grupo_familiar;
        
        if (dto.fecha_ingreso_grupo) {
            persona.fecha_ingreso_grupo = new Date(dto.fecha_ingreso_grupo);
        }
        // NOTA: No actualizamos 'fechaAlta' porque es un dato histórico de creación.

        await em.flush();

        return {
            status: 200,
            success: true,
            messages: ['Persona actualizada exitosamente'],
            data: persona
        };
    };
}