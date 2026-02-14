import { EntityManager } from "@mikro-orm/core";
import { PersonaRepository } from "../personaRepository";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Inscripcion } from "../../inscripcion/inscripcion";
import { EstadoCuentaDTO, CuotaResumenDTO } from "../dtos/estadoCuentaDTO";

export class ObtenerEstadoCuenta {
    constructor(private readonly repo: PersonaRepository) {}

    async ejecutar(id: number, em: EntityManager): Promise<ServiceResponse<EstadoCuentaDTO>> {
        
        // 1. Buscamos la Persona
        const persona = await this.repo.buscarPorId(id);

        if (!persona) {
            return {
                status: 404,
                success: false,
                messages: ["No se encontró la persona con el ID proporcionado."],
            };
        }

        // 2. Buscamos Inscripciones (Usando el EM que recibimos para hacer populate)
        const inscripciones = await em.find(Inscripcion,
            { persona }, 
            { populate: ['actividad', 'cuotas'] }
        );

        // 3. Calculamos Totales
        let totalDeuda = 0;
        let totalPagadoHistorico = 0;

        // 4. Mapeamos la data compleja a nuestro DTO limpio
        const detalleActividades = inscripciones.map(insc => {

            let nombreMostrar = insc.actividad.nombre;
            if (insc.actividad.descripcion) {
                nombreMostrar += ` (${insc.actividad.descripcion})`;
            };
            
            // Procesamos las cuotas de esta inscripción
            const cuotasMapeadas: CuotaResumenDTO[] = insc.cuotas
                .getItems()
                .map(c => {
                    const saldoPendiente = Number(c.montoOriginal) - Number(c.saldoPagado);
                    
                    // Sumamos a los acumuladores globales (Efecto secundario controlado)
                    totalDeuda += saldoPendiente;
                    totalPagadoHistorico += Number(c.saldoPagado);

                    return {
                        id: c.numero,
                        mes: c.mes,
                        anio: c.anio,
                        monto: Number(c.montoOriginal),
                        saldoPendiente: saldoPendiente,
                        estado: c.estado
                    };
                });

            // Calculamos la deuda específica de ESTA actividad
            const deudaActividad = cuotasMapeadas.reduce((acc, curr) => acc + curr.saldoPendiente, 0);

            return {
                actividad: nombreMostrar,
                fechaIngreso: insc.fechaInscripcion,
                estado: insc.estado,
                deudaEnEstaActividad: deudaActividad,
                cuotasPendientes: cuotasMapeadas
            };
        });

        // 5. Construimos el objeto final
        const respuesta: EstadoCuentaDTO = {
            cliente: {
                id: persona.nro,
                nombre: persona.nombre,
                apellido: persona.apellido,
                dni: persona.dni_cuit,
                fotoUrl: persona.fotoUrl || undefined,
                estado: persona.activo
            },
            resumenFinanciero: {
                totalDeudaClub: totalDeuda,
                totalPagadoHistorico: totalPagadoHistorico
            },
            detalle: detalleActividades
        };

        return {
            status: 200,
            success: true,
            messages: ["Estado de cuenta generado exitosamente"],
            data: respuesta
        };
    }
};