import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Actividad } from "../actividad";
import { CrearActividadDTO } from "../crearActividadDTO";

export class CrearActividad {
    constructor() {}

    async ejecutar(dto: CrearActividadDTO, em: EntityManager): Promise<ServiceResponse<Actividad>> {
        
        if (!dto.descripcion) {
            return { status: 400, success: false, messages: ["La descripción de la actividad es obligatoria."] };
        }
        
        if (dto.precioActual < 0) {
            return { status: 400, success: false, messages: ["El precio no puede ser negativo."] };
        }

        if(!dto.nombre){
            return { status: 400, success: false, messages: ["El nombre de la actividad es obligatorio."] };
        };

        const actividad = new Actividad();
        actividad.nombre = dto.nombre;
        actividad.descripcion = dto.descripcion;
        actividad.precioActual = dto.precioActual;

        await em.persist(actividad).flush();

        return {
            status: 201,
            success: true,
            messages: ["Actividad creada exitosamente."],
            data: actividad
        };
    };
};