import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Cuota } from "../cuota";
import { EstadoInscripcion, Inscripcion } from "../../inscripcion/inscripcion";
import { GenerarCuotasDTO } from "../generarCoutasDTO";

export class GenerarCuotasMasivas {
    // No necesitamos un repositorio específico aquí porque trabajamos con
    // múltiples entidades, usaremos el EntityManager directamente.
    constructor() {}

    async ejecutar(dto: GenerarCuotasDTO, em: EntityManager): Promise<ServiceResponse<{ creadas: number; mes: number; anio: number }>> {
        
        // 1. Determinar Fechas
        const mes = dto.mes || new Date().getMonth() + 1;
        const anio = dto.anio || new Date().getFullYear();

        // Validación básica
        if (mes < 1 || mes > 12) {
            return {
                success: false,
                status: 400,
                messages: ["El mes debe ser entre 1 y 12."]
            };
        };

        // 2. Traer Inscripciones Activas
        // (Necesitamos el precio de la actividad, así que hacemos populate)
        const inscripciones = await em.find(Inscripcion, {
            estado: EstadoInscripcion.ACTIVA
        }, { populate: ['actividad'] });

        if (inscripciones.length === 0) {
            return {
                success: true,
                status: 200,
                messages: ["No hay inscripciones activas para generar cuotas."],
                data: { creadas: 0, mes, anio }
            };
        }

        // 3. Iterar y Crear (Lógica Core)
        let creadas = 0;
        
        for (const inscripcion of inscripciones) {
            // A. Idempotencia: ¿Ya existe la cuota para este socio/actividad en este mes?
            const existe = await em.count(Cuota, {
                inscripcion,
                mes,
                anio
            });

            if (existe > 0) continue; // Ya existe, saltamos al siguiente

            // B. Crear Cuota
            const nuevaCuota = new Cuota();
            nuevaCuota.inscripcion = inscripcion;
            nuevaCuota.mes = mes;
            nuevaCuota.anio = anio;
            // Congelamos el precio al momento de generar la cuota
            nuevaCuota.montoOriginal = inscripcion.actividad.precioActual; 
            
            // Vence el día 10 del mes
            // Nota: Si generas cuotas de un año futuro, esto funciona bien.
            nuevaCuota.fechaVencimiento = new Date(anio, mes - 1, 10);
            
            // Estado inicial por defecto (PENDIENTE)
            
            em.persist(nuevaCuota);
            creadas++;
        }

        // 4. Guardar todo en una sola transacción
        await em.flush();

        return {
            success: true,
            status: 201,
            messages: [`Se generaron ${creadas} cuotas nuevas para el período ${mes}/${anio}.`],
            data: { creadas, mes, anio }
        };
    }
}