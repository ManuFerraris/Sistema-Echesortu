// La respuesta estándar de la API (ServiceResponse)
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    messages: string[];
    data: T;
}

// Lo que devuelve el endpoint de Estado de Cuenta
export interface CuotaResumen {
    id: number;
    mes: number;
    anio: number;
    monto: number;
    saldoPendiente: number;
    estado: string;
}

export interface DetalleActividad {
    actividad: string;
    fechaIngreso: string;
    estado: string;
    deudaEnEstaActividad: number;
    cuotasPendientes: CuotaResumen[];
}

export interface EstadoCuenta {
    cliente: { id: number, nombre: string; apellido: string; dni: string; fotoUrl?: string };
    resumenFinanciero: { totalDeudaClub: number; totalPagadoHistorico: number };
    detalle: DetalleActividad[];
}

export interface ComprobantePago {
    ticketId: number;
    saldoPendiente: number;
    saldoAFavor: number;
    estadoCuota: string;
    fechaPago: string; // Las fechas en JSON viajan como string
}

export interface Actividad {
    numero: number;
    nombre: string;
    descripcion: string; 
    precioActual: number;
}

export interface DashboardStats {
    mes: number;
    anio: number;
    recaudacionTotal: number;
    porcentajeMorosidad: number;
    totalSociosActivos: number;
    actividadMasPopular: { nombre: string; cantidad: number } | null;
}

export interface Persona {
    nro?: number; // Lo cambiamos a number porque en backend suele ser INT
    id?: number;  // ID también suele ser número
    nombre: string;
    apellido: string;
    dni_cuit: string;
    fotoUrl?: string;
    estado: boolean;
}

export interface GetPersonas {
    nro: number;
    nombre: string;
    apellido: string;
    tipo: "fisica" | "juridica";
    dni_cuit: string;
    fechaNacimiento: Date;
    email: string;
    telefono?: string | undefined;
    domicilio: string;
    fechaAlta: Date;
    activo: boolean;
    rol_grupo_familiar?: string | undefined;
    fecha_ingreso_grupo?: Date | undefined;
    fechaReincorporacion?: Date | undefined;
    fotoUrl?: string | undefined;
}


export interface Caja {
    id: number;
    numero: number;
    saldoInicial: number;
    saldoFinal: number;
    diferencia: number;
    fechaApertura: string;
    fechaCierre?: string;
    estado: 'abierta' | 'cerrada';
    observaciones?: string;
}

export interface ResumenCaja {
    cajaId: number;
    fechaApertura: string;
    saldoInicial: number;
    totalEfectivo: number;
    totalTransferencia: number; // Incluye MP, Tarjetas, etc.
    totalOtros: number;
    cantidadTickets: number;
    saldoSistema: number; // El total teórico
}