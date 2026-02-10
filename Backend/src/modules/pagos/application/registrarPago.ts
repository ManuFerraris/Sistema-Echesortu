import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Cuota, EstadoCuota } from "../../coutas/cuota";
import { Ticket, MedioPago } from "../../ticket/ticket";
import { RegistrarPagoDTO } from "../RegistrarPagoDTO";

export class RegistrarPago {
    constructor() {}

    async ejecutar(dto: RegistrarPagoDTO, em: EntityManager): Promise<ServiceResponse<any>> {
        
        if (dto.monto <= 0) {
            return {
                status: 400,
                success: false,
                messages: ["El monto del pago debe ser mayor a 0."]
            };
        };

        // Usamos findOne para poder manejar el error manualmente si no existe
        const cuota = await em.findOne(Cuota, { numero: dto.cuotaId });

        if (!cuota) {
            return {
                status: 404,
                success: false,
                messages: ["No se encontró la cuota especificada."]
            };
        };

        const ticket = new Ticket();
        ticket.cuota = cuota;
        ticket.montoPagado = dto.monto;
        ticket.medioPago = dto.medioPago || MedioPago.EFECTIVO;
        ticket.observacion = dto.observacion;
        ticket.fechaPago = new Date();

        // Convertimos a Number para evitar problemas de tipos si vienen strings
        cuota.saldoPagado = Number(cuota.saldoPagado) + Number(dto.monto);
        
        // Calculamos deuda restante para devolver al frontend
        const deudaRestante = Number(cuota.montoOriginal) - cuota.saldoPagado;

        // Determinamos el nuevo estado
        if (cuota.saldoPagado >= cuota.montoOriginal) {
            cuota.estado = EstadoCuota.PAGADA;
            if (!cuota.fechaPagoTotal) {
                cuota.fechaPagoTotal = new Date();
            }
        } else {
            cuota.estado = EstadoCuota.PARCIAL;
            cuota.fechaPagoTotal = undefined;
        }

        // MikroORM guardará ambos en la misma transacción de BD.
        em.persist([ticket, cuota]);
        await em.flush();

        return {
            status: 201,
            success: true,
            messages: ["Pago registrado exitosamente"],
            data: {
                ticketId: ticket.numero,
                saldoPendiente: deudaRestante > 0 ? deudaRestante : 0,
                saldoAFavor: deudaRestante < 0 ? Math.abs(deudaRestante) : 0,
                estadoCuota: cuota.estado,
                fechaPago: ticket.fechaPago
            }
        };
    }
}