// Define qué forma tiene una "Cuota Resumida"
export interface CuotaResumenDTO {
    id: number;
    mes: number;
    anio: number;
    monto: number;
    saldoPendiente: number;
    estado: string;
}

// Define qué forma tiene el detalle de una actividad
export interface DetalleActividadDTO {
    actividad: string;
    fechaIngreso: Date;
    estado: string;
    deudaEnEstaActividad: number;
    cuotasPendientes: CuotaResumenDTO[];
}

// Define la respuesta FINAL completa
export interface EstadoCuentaDTO {
    cliente: {
        id: number;
        nombre: string;
        apellido: string;
        dni: string;
        fotoUrl?: string;
        estado: boolean;
    };
    resumenFinanciero: {
        totalDeudaClub: number;
        totalPagadoHistorico: number;
    };
    detalle: DetalleActividadDTO[];
}