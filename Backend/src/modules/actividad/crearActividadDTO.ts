export interface CrearActividadDTO {
    codigo?: string; // Ej: "NAT-ADULTOS-2024", opcional para que el sistema lo genere automáticamente
    nombre: string; // Ej: "Natación para Adultos"
    descripcion: string; // Ej: "Escuela de Natación"
    precioActual: number; // Ej: 15000
    categoria?: string; // Ej: "Natación", "Gimnasia", "Yoga"
}