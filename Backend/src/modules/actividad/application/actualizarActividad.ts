import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Actividad } from "../actividad";

interface EditarActividadDTO {
    nombre?: string;
    descripcion?: string;
    precioActual?: number;
}

export class EditarActividad {
    async ejecutar(id: number, dto: EditarActividadDTO, em: EntityManager): Promise<ServiceResponse<Actividad>> {
        // 1. Buscar
        const actividad = await em.findOne(Actividad, { numero: id });
        if (!actividad) {
            return { success: false, status: 404, messages: ["Actividad no encontrada"] };
        };

        // 2. Actualizar campos si vienen
        if (dto.nombre) actividad.nombre = dto.nombre;
        if (dto.descripcion) actividad.descripcion = dto.descripcion;
        
        // Validar precio positivo
        if (dto.precioActual !== undefined) {
            if (dto.precioActual < 0) return { success: false, status: 400, messages: ["El precio no puede ser negativo"] };
            actividad.precioActual = dto.precioActual;
        };

        // 3. Guardar
        await em.flush();

        return {
            success: true,
            status: 200,
            messages: ["Actividad actualizada correctamente"],
            data: actividad
        };
    }
}