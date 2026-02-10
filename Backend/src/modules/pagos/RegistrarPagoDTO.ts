import { MedioPago } from "../ticket/ticket";

export interface RegistrarPagoDTO {
    cuotaId: number;
    monto: number;
    medioPago?: MedioPago;
    observacion?: string;
};