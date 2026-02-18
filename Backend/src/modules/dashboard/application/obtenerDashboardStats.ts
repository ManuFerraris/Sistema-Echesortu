import { EntityManager } from "@mikro-orm/mysql";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Cuota, EstadoCuota } from "../../coutas/cuota";
import { Inscripcion, EstadoInscripcion } from "../../inscripcion/inscripcion";
import { DashboardStatsDTO } from "./dashboardStatsDTO";
import { Socio } from "../../personas/tipoPersona/socio";
//      Aclaracion, cuando diseñé este Caso de Uso no lo pense con la misma mirada arquitectonica
// y tecnica como en los demas, ya que aqui por motivos de eficiencia y simpliciddad, 
// decidi hacer operaciones y consultas directas a la base de datos usando QueryBuilder,
// en lugar de usar los repositorios y entidades como en otros casos de uso.
//      (me sirve tambien para mostrar una forma diferente de interactuar con la DB,
// mas "manual" y optimizada para reportes, patron CQRS).

export class ObtenerDashboardStats {
    
    async ejecutar(em: EntityManager): Promise<ServiceResponse<DashboardStatsDTO>> {
        const hoy = new Date();
        const mesActual = hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();

        const inicioMes = new Date(anioActual, mesActual - 1, 1);
        const finMes = new Date(anioActual, mesActual, 0, 23, 59, 59);

        // OBTENER KNEX (El constructor SQL directo)
        // Esto nos da acceso directo a la base de datos sin pasar por la capa de objetos
        const knex = em.getConnection().getKnex();

        // RECAUDACIÓN TOTAL 
        const resultadoTickets = await knex('ticket')
            .sum('monto_pagado as total')
            .where('fecha_pago', '>=', inicioMes)
            .where('fecha_pago', '<=', finMes)
            .first();

        const recaudacion = resultadoTickets && resultadoTickets.total ? Number(resultadoTickets.total) : 0;

        const totalCuotasMes = await em.count(Cuota, { mes: mesActual, anio: anioActual });
        const cuotasImpagas = await em.count(Cuota, { 
            mes: mesActual, 
            anio: anioActual, 
            estado: { $ne: EstadoCuota.PAGADA } 
        });

        let porcentajeMorosidad = 0;
        if (totalCuotasMes > 0) {
            porcentajeMorosidad = (cuotasImpagas / totalCuotasMes) * 100;
        }

        // 3. ACTIVIDAD MÁS POPULAR
        const ranking = await knex('inscripcion')
            .join('actividad', 'inscripcion.actividad_numero', '=', 'actividad.numero')
            .where('inscripcion.estado', EstadoInscripcion.ACTIVA)
            .count('inscripcion.id as total')
            .select('actividad.nombre')
            .groupBy('actividad.nombre')
            .orderBy('total', 'desc')
            .first();

        const topActividad = ranking ? { 
            nombre: ranking.nombre as string, 
            cantidad: Number(ranking.total) 
        } : null;

        const totalSocios = await em.count(Socio, { activo: true });

        return {
            success: true,
            status: 200,
            messages: ["Stats generadas"],
            data: {
                mes: mesActual,
                anio: anioActual,
                recaudacionTotal: Number(recaudacion),
                porcentajeMorosidad: Number(porcentajeMorosidad.toFixed(1)),
                totalSociosActivos: totalSocios,
                actividadMasPopular: topActividad
            }
        };
    }
}