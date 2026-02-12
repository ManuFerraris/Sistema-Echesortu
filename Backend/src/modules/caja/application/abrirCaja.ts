import { EntityManager } from "@mikro-orm/core";
import { ServiceResponse } from "../../../shared/types/serviceResponse";
import { Caja } from "../caja";
import { Usuario } from "../../usuarios/usuario";

interface AbrirCajaDTO {
    usuarioId: number;
    montoInicial: number;
    observaciones?: string;
}

export class AbrirCaja {
    constructor() {};
    async ejecutar(dto: AbrirCajaDTO, em: EntityManager): Promise<ServiceResponse<Caja | null>> {
        
        const usuario = await em.findOne(Usuario, { numero: dto.usuarioId });
        if (!usuario) {
            return {
                success: false,
                status: 404,
                messages: ["Usuario no encontrado"],
                data: null
            };
        };

        const cajaAbierta = await em.findOne(Caja, {
            usuario: usuario,
            estado: 'abierta'
        });

        if (cajaAbierta) {
            return { 
                success: false, 
                status: 400, 
                messages: ["Ya tenés una caja abierta. Cerrala antes de abrir otra."], 
                data: cajaAbierta 
            };
        }

        // 3. Crear la nueva Caja
        const nuevaCaja = new Caja();
        nuevaCaja.usuario = usuario;
        nuevaCaja.fechaApertura = new Date();
        nuevaCaja.saldoInicial = dto.montoInicial || 0;
        nuevaCaja.saldoFinal = 0;
        nuevaCaja.diferencia = 0;
        nuevaCaja.estado = 'abierta';
        nuevaCaja.observaciones = dto.observaciones;
        // Lo asignamos manualmente asi realizamos las pruebas sin necesidad de tener una caja 
        // previa. En producción, esto se manejará con secuencia en la base de datos.
        nuevaCaja.numero = 1; 

        await em.persist(nuevaCaja).flush();

        return {
            success: true,
            status: 201,
            messages: ["Caja abierta exitosamente"],
            data: nuevaCaja
        };
    }
}