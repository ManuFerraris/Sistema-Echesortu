import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Persona } from "../persona";
import { PersonaDTO,validarCreacionPersona } from "../personaDTO";
import { PersonaRepository } from "../personaRepository";

export class CrearPersona {
    constructor(private readonly repo:PersonaRepository){};

    async ejecutar(dto: PersonaDTO, em: EntityManager): Promise<ServiceResponse<Persona>> {
        const errores = await validarCreacionPersona(dto, em);
        if (errores.length > 0) {
            return {
                status: 400,
                success: false,
                messages: errores
            };
        };

        const nuevaPersona = new Persona();
        nuevaPersona.nombre = dto.nombre!;
        nuevaPersona.apellido = dto.apellido!;
        nuevaPersona.dni_cuit = dto.dni_cuit!;
        nuevaPersona.email = dto.email!;
        nuevaPersona.domicilio = dto.domicilio!;
        nuevaPersona.tipo = dto.tipo!;
        
        // Manejo seguro de fechas (string o Date)
        nuevaPersona.fechaNacimiento = new Date(dto.fechaNacimiento!);
        nuevaPersona.fechaAlta = new Date(dto.fechaAlta!);
        
        nuevaPersona.telefono = dto.telefono;

        if (dto.fotoUrl) {
            nuevaPersona.fotoUrl = dto.fotoUrl;
        };

        await this.repo.crearPersona(nuevaPersona);

        return { status: 201,
            success: true,
            messages: ['Persona creada exitosamente'],
            data: nuevaPersona };
    };
};