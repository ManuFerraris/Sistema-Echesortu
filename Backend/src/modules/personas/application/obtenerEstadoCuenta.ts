import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Inscripcion } from "../../inscripcion/inscripcion";
import { EstadoCuentaDTO, CuotaResumenDTO } from "../dtos/estadoCuentaDTO";
import { Socio } from "../tipoPersona/socio";

export class ObtenerEstadoCuenta {
    constructor(
        private readonly em: EntityManager
    ) {}

    async ejecutar(nroSoc: number, em: EntityManager): Promise<ServiceResponse<EstadoCuentaDTO>> {
        
        // 1. Buscamos la Persona
        const socio = await this.em.findOne(Socio,  { nro: nroSoc }, { populate: ['persona'] });

        if (!socio) {
            return {
                status: 404,
                success: false,
                messages: ["No se encontró al socio con el ID proporcionado."],
            };
        }

        // 2. Buscamos Inscripciones (Usando el EM que recibimos para hacer populate)
        const inscripciones = await em.find(Inscripcion,
            { socio }, 
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
                id: socio.nro,
                nombre: socio.persona.nombre,
                apellido: socio.persona.apellido!, // El apellido siempre viene porque la inscripcion es de una persona FISICA.
                dni: socio.persona.dni_cuit,
                fotoUrl: socio.persona.fotoUrl || undefined,
                estado: socio.activo
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