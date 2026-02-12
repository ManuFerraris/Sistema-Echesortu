import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Caja } from "../caja";
import { Ticket } from "../../ticket/ticket";
import { Usuario } from "../../usuarios/usuario";

export interface ResumenCajaDTO {
    cajaId: number;
    fechaApertura: Date;
    saldoInicial: number;
    totalEfectivo: number;
    totalTransferencia: number;
    totalOtros: number; // MercadoPago, Debito, Credito, etc...
    cantidadTickets: number;
    saldoSistema: number; // Lo que DEBERÍA haber (Inicial + Recaudado)
}

export class ObtenerResumenCaja {
    async ejecutar(usuarioId: number, em: EntityManager): Promise<ServiceResponse<ResumenCajaDTO | null>> {
        // 1. Buscar Caja Abierta
        const usuario = await em.findOne(Usuario, { numero: usuarioId });
        if(!usuario) {
            return {
                success: false,
                status: 404,
                messages: ["Usuario no encontrado."],
                data: null
            };
        };

        const caja = await em.findOne(Caja, {
            usuario: usuario,
            estado: 'abierta'
            }, { populate: ['tickets'] }
        );

        if (!caja) {
            return {
                success: false,
                status: 404,
                messages: ["No tenés una caja abierta actualmente."],
                data: null
            };
        };

        let totalEfectivo = 0;
        let totalTransferencia = 0;
        let totalOtros = 0; // MercadoPago, Debito, Credito, etc...

        for (const t of caja.tickets) {
            // Normalizamos a mayúsculas por las dudas
            const medio = t.medioPago?.toUpperCase(); 
            
            if (medio === 'EFECTIVO') {
                totalEfectivo += Number(t.montoPagado);
            } else if (medio === 'TRANSFERENCIA' || medio === 'MERCADOPAGO'
                || medio === 'DEBITO' || medio === 'CREDITO' || medio === 'OTRO') {
                totalTransferencia += Number(t.montoPagado);
            } else {
                totalOtros += Number(t.montoPagado);
            }
        };

        const recaudadoTotal = totalEfectivo + totalTransferencia + totalOtros;
        const saldoSistema = Number(caja.saldoInicial) + recaudadoTotal;

        // 3. Devolver DTO
        const resumen: ResumenCajaDTO = {
            cajaId: caja.id,
            fechaApertura: caja.fechaApertura,
            saldoInicial: Number(caja.saldoInicial),
            totalEfectivo,
            totalTransferencia,
            totalOtros,
            cantidadTickets: caja.tickets.length,
            saldoSistema
        };

        return {
            success: true,
            status: 200,
            messages: ["Resumen calculado correctamente"],
            data: resumen
        };
    }
}