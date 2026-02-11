import { MedioPago } from "../ticket/ticket";

export interface DetallePagoDTO {
    monto: number;
    medioPago: MedioPago; // Enum (EFECTIVO, TRANSFERENCIA, etc)
    observacion?: string;
}

export interface RegistrarPagoDTO {
    cuotaId: number;
    pagos: DetallePagoDTO[];
};