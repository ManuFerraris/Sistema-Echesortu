import { EntityManager } from "@mikro-orm/core";
import { Persona } from "./persona";

export interface PersonaDTO {
    nombre?: string;
    apellido?: string;
    tipo?: "fisica" | "juridica";
    dni_cuit?: string;
    fechaNacimiento?: Date | string; // Aceptamos string por si viene del JSON sin parsear
    email?: string;
    telefono?: string;
    domicilio?: string;
    fechaAlta?: Date | string;
    activo?: boolean;
    rol_grupo_familiar?: string;
    fecha_ingreso_grupo?: Date | string;
    fechaReincorporacion?: Date | string;
    fotoUrl?: string;
}

// ===========================
// 1. VALIDACIÓN PARA CREACIÓN 
// ===========================
export async function validarCreacionPersona(dto: PersonaDTO, em: EntityManager): Promise<string[]> {
    const errores: string[] = [];

    // 1. Validar Campos Obligatorios (Solo en creación)
    if (!dto.nombre) errores.push("El nombre es obligatorio.");
    if (!dto.apellido) errores.push("El apellido es obligatorio.");
    if (!dto.dni_cuit) errores.push("El DNI/CUIT es obligatorio.");
    if (!dto.email) errores.push("El email es obligatorio.");
    if (!dto.domicilio) errores.push("El domicilio es obligatorio.");
    if (!dto.fechaNacimiento) errores.push("La fecha de nacimiento es obligatoria.");

    // 2. Valores por defecto (Side effects controlados)
    if (!dto.tipo) dto.tipo = "fisica";
    if (!dto.fechaAlta) dto.fechaAlta = new Date();
    if (dto.activo === undefined) dto.activo = true;

    // 3. Validar Reglas de Formato y Lógica
    validarReglasDeNegocio(dto, errores);

    // 4. Validar Unicidad en Base de Datos (Async)
    // En creación NO pasamos ID para excluir
    await validarDuplicados(dto, em, errores);

    return errores;
}

// ================================
// 2. VALIDACIÓN PARA ACTUALIZACIÓN
// ================================
export async function validarActualizacionPersona(
    dto: PersonaDTO, 
    em: EntityManager, 
    idPersona: number // Necesario para excluirse a sí mismo
): Promise<string[]> {
    const errores: string[] = [];

    // En actualización, NO validamos obligatoriedad (pueden venir parciales).
    // Solo validamos si el campo ESTÁ PRESENTE en el DTO.

    // 1. Validar Reglas de Formato (Solo de los campos que vengan)
    validarReglasDeNegocio(dto, errores);

    // 2. Validar Unicidad (Excluyendo al propio usuario)
    await validarDuplicados(dto, em, errores, idPersona);

    return errores;
}

// ==========================================
// 3. HELPERS PRIVADOS (Lógica compartida)
// ==========================================

function validarReglasDeNegocio(dto: PersonaDTO, errores: string[]) {
    // Validar Email
    if (dto.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.email)) {
            errores.push("Formato de email inválido.");
        }
    }

    // Validar DNI
    if (dto.dni_cuit) {
        if (dto.dni_cuit.length < 7 || dto.dni_cuit.length > 11) {
            errores.push("El DNI/CUIT debe tener entre 7 y 11 caracteres (sin puntos).");
        }
    }

    if(typeof dto.activo !== 'boolean') {
        dto.activo = true;
    }

    // Validar Longitudes de Strings
    if (dto.nombre && dto.nombre.length > 50) errores.push("El nombre no puede superar los 50 caracteres.");
    if (dto.apellido && dto.apellido.length > 50) errores.push("El apellido no puede superar los 50 caracteres.");
    if (dto.domicilio && dto.domicilio.length > 80) errores.push("El domicilio no puede superar los 80 caracteres.");

    // Validar Tipo
    if (dto.tipo && dto.tipo !== "fisica" && dto.tipo !== "juridica") {
        errores.push('El tipo de persona debe ser "fisica" o "juridica".');
    }

    // Validar Fechas (Transformando a Date si es string)
    if (dto.fechaNacimiento) {
        const fechaNac = new Date(dto.fechaNacimiento);
        if (isNaN(fechaNac.getTime()) || fechaNac >= new Date()) {
            errores.push("La fecha de nacimiento debe ser válida y anterior a hoy.");
        }
    }

    if (dto.fechaAlta) {
        const fechaAlta = new Date(dto.fechaAlta);
        if (dto.fechaNacimiento) {
            const fechaNac = new Date(dto.fechaNacimiento);
            if (fechaAlta < fechaNac) {
                errores.push("La fecha de alta no puede ser anterior al nacimiento.");
            }
        }
    }
}

async function validarDuplicados(
    dto: PersonaDTO, 
    em: EntityManager, 
    errores: string[], 
    idExcluir?: number
) {
    // Verificamos DNI
    if (dto.dni_cuit) {
        const filtros: any = { dni_cuit: dto.dni_cuit };
        // Si estamos actualizando, excluimos nuestro propio ID
        if (idExcluir) {
            filtros.nro = { $ne: idExcluir }; // $ne = Not Equal
        }
        
        const existe = await em.count(Persona, filtros);
        if (existe > 0) errores.push("Ya existe una persona con ese DNI/CUIT.");
    }

    // Verificamos Email
    if (dto.email) {
        const filtros: any = { email: dto.email };
        if (idExcluir) {
            filtros.nro = { $ne: idExcluir };
        }

        const existe = await em.count(Persona, filtros);
        if (existe > 0) errores.push(`Ya existe una persona con el email: ${dto.email}.`);
    }
}