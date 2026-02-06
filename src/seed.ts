import { MikroORM } from "@mikro-orm/core";
import config from "./db/mikro-orm.config";
import { Persona } from "./entities/persona";
import { Actividad } from "./entities/actividad";
import { Inscripcion } from "./entities/inscripcion";
import { Cuota, EstadoCuota } from "./entities/cuota";

async function main() {
    // 1. Conectar
    const orm = await MikroORM.init(config);
    const em = orm.em.fork(); // Entity Manager

    // 2. Crear una Actividad
    const natacion = new Actividad();
    natacion.nombre = "Natación Adultos";
    natacion.precioActual = 15000;
    
    // 3. Crear una Persona
    const socio = new Persona();
    socio.nombre = "Manuel";
    socio.apellido = "Ferraris";
    socio.dni_cuit = "12345678";
    socio.domicilio = "Calle Falsa 123";
    socio.fechaNacimiento = new Date("1995-05-20");
    socio.email = "manu@test.com";

    // 4. Inscribir (Relación)
    const inscripcion = new Inscripcion();
    inscripcion.persona = socio;
    inscripcion.actividad = natacion;
    inscripcion.observacion = "Inicia en Marzo";

    // 5. Generar una Cuota (Marzo 2026)
    const cuotaMarzo = new Cuota();
    cuotaMarzo.inscripcion = inscripcion;
    cuotaMarzo.mes = 3;
    cuotaMarzo.anio = 2026;
    cuotaMarzo.montoOriginal = 15000;
    cuotaMarzo.fechaVencimiento = new Date("2026-03-10");
    cuotaMarzo.estado = EstadoCuota.PENDIENTE;

    // Persistir todo (MikroORM resuelve el orden de inserción solo)
    await em.persistAndFlush([natacion, socio, inscripcion, cuotaMarzo]);

    console.log("¡Datos creados con éxito!");
    console.log(`Socio creado con ID (nro): ${socio.nro}`);
    console.log(`Cuota creada con ID (numero): ${cuotaMarzo.numero}`);

    await orm.close();
}

main().catch(console.error);