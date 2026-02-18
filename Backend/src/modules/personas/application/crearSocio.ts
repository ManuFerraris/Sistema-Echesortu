import { EntityManager } from "@mikro-orm/core";
import { Socio } from "../tipoPersona/socio";
import { Persona } from "../persona";
import { CrearSocioDTO } from "../dtos/crearSocioDTO";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

export class CrearSocio {
    constructor() {}
    async ejecutar(dto: CrearSocioDTO, em: EntityManager): Promise<ServiceResponse<Socio>> {
        
        console.log("[DEBUG] Ejecutando CrearSocio con DTO:", dto);
        let persona = await em.findOne(Persona, { dni_cuit: dto.dni_cuit });

        if (!persona) {
            persona = new Persona();
            persona.nombre = dto.nombre;
            persona.apellido = dto.apellido;
            persona.dni_cuit = dto.dni_cuit;
            persona.fechaNacimiento = new Date(dto.fechaNacimiento);
            persona.email = dto.email;
            persona.telefono = dto.telefono;
            persona.domicilio = dto.domicilio;
            if(dto.fotoUrl) persona.fotoUrl = dto.fotoUrl;
            
            em.persist(persona);
        } else {
            const yaEsSocio = await em.findOne(Socio, { persona });
            if (yaEsSocio) return {
                status: 400,
                success: false,
                messages: ["La persona ya es un socio registrado."],
                data: yaEsSocio
            };
        };

        // Creamos el ROL Socio
        const nuevoSocio = new Socio();
        nuevoSocio.persona = persona;
        nuevoSocio.activo = true;
        nuevoSocio.categoria = dto.categoria || "Activo";
        nuevoSocio.vitalicio = String(dto.vitalicio) === 'true';
        if (dto.rol_grupo_familiar) nuevoSocio.rol_grupo_familiar = dto.rol_grupo_familiar;
        if (dto.fecha_ingreso_grupo) nuevoSocio.fecha_ingreso_grupo = new Date(dto.fecha_ingreso_grupo);
        if (dto.fechaReincorporacion) nuevoSocio.fechaReincorporacion = new Date(dto.fechaReincorporacion);
        nuevoSocio.nro_socio = await this.generarProximoNumero(em);

        em.persist(nuevoSocio);

        // 4. Guardamos todo junto (Atomicidad)
        await em.flush();

        return {
            status: 201,
            success: true,
            messages: ["Socio creado exitosamente."],
            data: nuevoSocio
        };
    };

    // Método privado para generar el próximo número de socio (por ahora en desarrollo).
    private async generarProximoNumero(em: EntityManager): Promise<string> {
        // Usamos find con limit 1 en vez de findOne
        const [ultimo] = await em.find(Socio, {}, { 
            orderBy: { nro: 'DESC' }, 
            limit: 1 
        });

        // Si 'ultimo' es undefined (tabla vacía), empezamos de 0
        const idNext = (ultimo?.nro || 0) + 1;
        
        return `S-${idNext.toString().padStart(4, '0')}`;
    }
};