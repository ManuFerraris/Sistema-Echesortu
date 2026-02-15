import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Cuota, EstadoCuota } from "../cuota";
import { EstadoInscripcion, Inscripcion } from "../../inscripcion/inscripcion";
import { GenerarCuotasDTO } from "../generarCoutasDTO";

export class GenerarCuotasMasivas {
    constructor() {}

    async ejecutar(dto: GenerarCuotasDTO, em: EntityManager): Promise<ServiceResponse<{ creadas: number;omitidas: number; mes: number; anio: number }>> {
        
        // 1. Determinar Fechas
        const hoy = new Date();
        const mes = dto.mes || (hoy.getMonth() + 1);
        const anio = dto.anio || hoy.getFullYear();

        console.log(`[Motor] Iniciando generación de cuotas para ${mes}/${anio}...`);
        
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
            estado: EstadoInscripcion.ACTIVA,
            persona: { activo: true }
        }, {
            populate: ['actividad', 'persona'] 
        });

        if (inscripciones.length === 0) {
            return {
                success: true,
                status: 200,
                messages: ["No hay inscripciones activas para generar cuotas."],
                data: { creadas: 0, omitidas: 0, mes, anio }
            };
        }

        let creadas = 0;
        let omitidas = 0;
        
        for (const inscripcion of inscripciones) {
            // A. Idempotencia: ¿Ya existe la cuota para este socio/actividad en este mes?
            const existe = await em.count(Cuota, {
                inscripcion,
                mes,
                anio
            });

            if (existe > 0) {
                omitidas++;
                continue;
            };

            const nuevaCuota = new Cuota();
            nuevaCuota.inscripcion = inscripcion;
            nuevaCuota.mes = mes;
            nuevaCuota.anio = anio;
            nuevaCuota.montoOriginal = inscripcion.actividad.precioActual; 
            nuevaCuota.saldoPagado = 0;
            nuevaCuota.fechaEmision = new Date();
            nuevaCuota.fechaVencimiento = new Date(anio, mes - 1, 10);
            nuevaCuota.estado = EstadoCuota.PENDIENTE;
            em.persist(nuevaCuota);
            creadas++;
        }

        await em.flush();

        console.log(`[Motor] Fin. Creadas: ${creadas}. Ya existían: ${omitidas}.`);

        return {
            success: true,
            status: 201,
            messages: [`Se generaron ${creadas} cuotas nuevas para el período ${mes}/${anio}.`],
            data: { creadas, omitidas, mes, anio }
        };
    }
}