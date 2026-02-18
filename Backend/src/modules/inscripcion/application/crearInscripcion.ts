import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Inscripcion, EstadoInscripcion } from "../inscripcion";
import { Socio } from "../../personas/tipoPersona/socio";
import { Actividad } from "../../actividad/actividad";
import { Cuota, EstadoCuota } from "../../coutas/cuota";
import { InscribirSocioDTO } from "../inscripcionSocioDTO";

export class InscribirSocio{
    constructor(){};

    async ejecutar(dto: InscribirSocioDTO, em: EntityManager): Promise<ServiceResponse<any>> {
        
        const socio = await em.findOne(Socio, { nro: dto.idSocio });
        const socioPorNro = await em.findOne(Socio, { nro_socio: dto.nroSocio });
        if (!socio && !socioPorNro) return {
            status: 404,
            success: false,
            messages: [`Socio con nro ${dto.idSocio} y nro_socio (interno) ${dto.nroSocio} no encontrado`]
        };

        const actividad = await em.findOne(Actividad, { numero: dto.idActividad });
        if (!actividad) return {
            status: 404,
            success: false,
            messages: ["Actividad no encontrada"]
        };

        const yaInscripto = await em.count(Inscripcion, {
            socio: socio ? socio : socioPorNro!,
            actividad,
            estado: EstadoInscripcion.ACTIVA
        });

        if (yaInscripto > 0) {
            return {
                status: 400,
                success: false,
                messages: ["El socio ya está inscripto en esta actividad."]
            };
        };

        const nuevaInscripcion = new Inscripcion();
        nuevaInscripcion.socio = socio ? socio : socioPorNro!;
        nuevaInscripcion.actividad = actividad;
        nuevaInscripcion.fechaInscripcion = dto.fechaInicio ? new Date(dto.fechaInicio) : new Date();
        nuevaInscripcion.estado = EstadoInscripcion.ACTIVA;

        // 4. GENERAR PRIMERA CUOTA AUTOMÁTICA (La del mes corriente)
        // Esto es clave para que pueda ir a pagar YA mismo.
        const hoy = new Date();
        const mesActual = hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();

        const cuotaExiste = await em.count(Cuota, {
            inscripcion: nuevaInscripcion,
            mes: mesActual,
            anio: anioActual
        });

        if (cuotaExiste === 0) {
            const primeraCuota = new Cuota();
            primeraCuota.inscripcion = nuevaInscripcion;
            primeraCuota.mes = mesActual;
            primeraCuota.anio = anioActual;
            primeraCuota.montoOriginal = actividad.precioActual;
            primeraCuota.estado = EstadoCuota.PENDIENTE;
            
            // Vencimiento: día 10 del mes actual
            primeraCuota.fechaVencimiento = new Date(anioActual, mesActual - 1, 10);
            
            em.persist(primeraCuota);
        }

        await em.persist(nuevaInscripcion).flush();

        return {
            status: 201,
            success: true,
            messages: ["Inscripción exitosa. Se generó la cuota del mes en curso."],
            data: { 
                inscripcionId: nuevaInscripcion.id, 
                actividad: actividad.nombre 
            }
        };
    };
};