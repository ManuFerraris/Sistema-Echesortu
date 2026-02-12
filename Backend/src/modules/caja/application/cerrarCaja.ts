import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Caja } from "../caja";
import { Usuario } from "../../usuarios/usuario";
interface CerrarCajaDTO {
    montoFisicoRecuento: number; // La plata que el cajero contó en billetes
    observaciones?: string;
}

export class CerrarCaja {
    async ejecutar(usuarioId: number, dto: CerrarCajaDTO, em: EntityManager): Promise<ServiceResponse<Caja|null>> {

        const usuario = await em.findOne(Usuario, {numero: usuarioId});
        if(!usuario){
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
        }, {
            populate: ['tickets']
            }
        );

        if (!caja) {
            return {
                success: false,
                status: 404,
                messages: ["No tenés una caja abierta para cerrar."],
                data: null
            };
        };

        let totalEfectivoSistema = 0;
        let totalOtros = 0;

        for (const t of caja.tickets) {
            const medio = t.medioPago?.toUpperCase();
            if (medio === 'EFECTIVO') {
                totalEfectivoSistema += Number(t.montoPagado);
            } else {
                totalOtros += Number(t.montoPagado);
            };
        };

        const saldoTeoricoEfectivo = Number(caja.saldoInicial) + totalEfectivoSistema;

        const diferencia = Number(dto.montoFisicoRecuento) - saldoTeoricoEfectivo;

        caja.saldoFinal = Number(dto.montoFisicoRecuento);
        caja.diferencia = diferencia;
        caja.fechaCierre = new Date();
        caja.estado = 'cerrada';
        caja.observaciones = dto.observaciones 
            ? `${caja.observaciones || ''} | Cierre: ${dto.observaciones}` 
            : caja.observaciones;

        await em.flush();

        // 5. Armar mensaje de respuesta
        let mensaje = "Caja cerrada correctamente.";
        if (diferencia < 0) mensaje += `[ATENCIÓN] Faltante de $${Math.abs(diferencia)}`;
        if (diferencia > 0) mensaje += `[ATENCIÓN] Sobrante de $${diferencia}`;

        return {
            success: true,
            status: 200,
            messages: [mensaje],
            data: caja
        };
    };
};