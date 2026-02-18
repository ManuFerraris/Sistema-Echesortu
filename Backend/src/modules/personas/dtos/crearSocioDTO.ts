export interface CrearSocioDTO {
    nombre: string;
    apellido: string;
    dni_cuit: string;
    fechaNacimiento: Date | string;
    email: string;
    telefono?: string;
    domicilio: string;
    fotoUrl?: string;

    // Datos de Socio
    categoria?: string; // Opcional, se puede calcular por edad
    vitalicio?: boolean;
    nroSocio?: string; // Opcional, se puede generar automáticamente
    rol_grupo_familiar?: string;
    fecha_ingreso_grupo?: Date | string;
    fechaReincorporacion?: Date | string;
}