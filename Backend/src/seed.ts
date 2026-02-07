import { MikroORM } from "@mikro-orm/core";
import config from "./db/mikro-orm.config";
import { Persona } from "./entities/persona";
import { Actividad } from "./entities/actividad";
import { Inscripcion } from "./entities/inscripcion";
import { Cuota, EstadoCuota } from "./entities/cuota";
import { Ticket, MedioPago } from "./entities/ticket";

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

    // 4. Generar Cuota de Febrero ($20.000)
    const cuota = new Cuota();
    cuota.inscripcion = inscripcion;
    cuota.mes = 2;
    cuota.anio = 2026;
    cuota.montoOriginal = 20000;
    cuota.fechaVencimiento = new Date("2026-02-10");
    cuota.saldoPagado = 0;
    em.persist(cuota);

    await em.flush();

    console.log("--- Situación Inicial ---");
    console.log(`Socio debe: $${cuota.montoOriginal - cuota.saldoPagado}`);

    // 5. EL CLUB PERMISIVO: Paga solo $5.000 hoy
    const pago1 = new Ticket();
    pago1.cuota = cuota;
    pago1.montoPagado = 5000;
    pago1.medioPago = MedioPago.EFECTIVO;
    pago1.observacion = "Pago a cuenta, trae el resto la semana que viene";
    
    // Actualizamos el saldo de la cuota (Lógica de Negocio)
    cuota.saldoPagado += pago1.montoPagado;
    cuota.estado = EstadoCuota.PARCIAL;

    em.persist(pago1);
    await em.flush();

    console.log("--- Después del Pago Parcial ---");
    console.log(`Se generó Ticket #${pago1.numero} por $${pago1.montoPagado}`);
    console.log(`Socio debe ahora: $${cuota.montoOriginal - cuota.saldoPagado}`);
    console.log(`Estado de cuota: ${cuota.estado}`);

    await orm.close();
}

main().catch(console.error);