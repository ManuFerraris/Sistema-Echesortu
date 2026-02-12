export interface ReceiptItem {
    mes: string;          // Ej: "Febrero 2026"
    formaPago: string;    // "Efectivo", "Transferencia", "Tarjeta", etc.
    descripcion: string;  // Ej: "Cuota Social + Pileta"
    importe: number;      // El subtotal de esa línea
}

export interface ReceiptData {
    nroComprobante: string;
    emailSocio: string;
    fecha: Date;
    nombreSocio: string;
    nroSocio: number;
    restanPagar: number; // Lo que queda pendiente después de este pago
    items: ReceiptItem[]; // Array (1 o más meses)
    total: number;        // Suma total de los importes
}