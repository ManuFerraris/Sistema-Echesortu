import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Cuota, EstadoCuota } from "../../coutas/cuota";
import { Ticket } from "../../ticket/ticket";
import { RegistrarPagoDTO } from "../RegistrarPagoDTO";
import { ReceiptData } from "../../interfaces/receipt.interface";

export class RegistrarPago {
    constructor() {}

    // Cambiamos el tipo de retorno a ReceiptData para que el controller sepa qué esperar
    async ejecutar(dto: RegistrarPagoDTO, em: EntityManager): Promise<ServiceResponse<ReceiptData | null>> {
        
        // 1. Validar totales
        const montoTotalAPagar = dto.pagos.reduce((acc, p) => acc + Number(p.monto), 0);

        if (montoTotalAPagar <= 0) {
            return { status: 400, success: false, messages: ["El monto total debe ser mayor a 0."], data: null };
        }

        // 2. Buscar Cuota y RELACIONES (Necesitamos al Socio para el PDF)
        const cuota = await em.findOne(Cuota, { numero: dto.cuotaId },
            { populate: ['inscripcion', 'inscripcion.persona', 'inscripcion.actividad'] });

        if (!cuota) {
            return { status: 404, success: false, messages: ["No se encontró la cuota."], data: null };
        }

        // 3. Procesar los Tickets (Uno por cada forma de pago)
        const ticketsGenerados: Ticket[] = [];

        for (const pago of dto.pagos) {
            const ticket = new Ticket();
            ticket.cuota = cuota;
            ticket.montoPagado = pago.monto;
            ticket.medioPago = pago.medioPago;
            ticket.observacion = pago.observacion || "";
            ticket.fechaPago = new Date();
            
            ticketsGenerados.push(ticket);
            em.persist(ticket); // Preparamos para guardar
        }

        // 4. Actualizar estado de la Cuota
        cuota.saldoPagado = Number(cuota.saldoPagado) + montoTotalAPagar;
        
        if (cuota.saldoPagado >= cuota.montoOriginal) {
            cuota.estado = EstadoCuota.PAGADA;
            if (!cuota.fechaPagoTotal) cuota.fechaPagoTotal = new Date();
        } else {
            cuota.estado = EstadoCuota.PARCIAL;
        }
        await em.persist(cuota).flush();

        // CHEQUEO DE SEGURIDAD
        const nombreSocio = cuota.inscripcion?.persona?.nombre 
            ? `${cuota.inscripcion.persona.nombre} ${cuota.inscripcion.persona.apellido}`
            : "Socio Desconocido";
        console.log(`Pago registrado para ${nombreSocio} - Cuota ${cuota.mes}/${cuota.anio} - Monto: ${montoTotalAPagar}`);

        const actividadNombre = cuota.inscripcion?.actividad?.nombre || "Actividad";
        console.log(`Actividad: ${actividadNombre}`);

        // Preparar Datos para el PDF (Mapeamos lo que pasó a la estructura del recibo)
        // Generamos un Nro de Comprobante ficticio basado en el primer ticket o timestamp
        const nroComprobante = `REC-${ticketsGenerados[0].numero}-${Date.now().toString().slice(-4)}`;

        const datosParaPDF: ReceiptData = {
            nroComprobante: nroComprobante,
            fecha: new Date(),
            // Asumiendo que tu entidad Socio tiene nombre y apellido
            nombreSocio: nombreSocio, 
            nroSocio: cuota.inscripcion.persona.nro,
            emailSocio: cuota.inscripcion.persona.email,
            total: montoTotalAPagar,
            items: dto.pagos.map(p => ({
                mes: `Cuota ${cuota.mes}/${cuota.anio}`,
                descripcion: `Pago ${cuota.estado === EstadoCuota.PAGADA ? 'Total' : 'Parcial'}`,
                formaPago: p.medioPago,
                importe: p.monto
            }))
        };
        console.log("Datos para PDF:", datosParaPDF);

        return {
            status: 201,
            success: true,
            messages: ["Pago registrado exitosamente"],
            data: datosParaPDF
        };
    }
}