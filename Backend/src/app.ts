import express from "express";
import cors from "cors";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import config from "./db/mikro-orm.config";
import { userContext } from "./utils/userContext";
import { Persona } from "./entities/persona";
import { Cuota, EstadoCuota } from "./entities/cuota";
import { Ticket, MedioPago } from "./entities/ticket";
import { Inscripcion, EstadoInscripcion } from "./entities/inscripcion";

export const app = express();

app.use(cors());

app.use(express.json());

(async () => {
    const orm = await MikroORM.init(config);
    
    // MIDDLEWARE MAGICO DE MIKRO-ORM
    // Crea un contexto único por cada petición HTTP
    app.use((req, res, next) => {
        RequestContext.create(orm.em, next);
    });

    // MIDDLEWARE DE CONTEXTO DE USUARIO (NUEVO)
    app.use((req, res, next) => {
        const usuario = req.headers["x-user"]?.toString() || "anonimo";
        
        // Aquí inicia la "burbuja" de memoria para esta petición
        userContext.run(usuario, () => {
        next(); // Todo lo que pase después de next() tendrá acceso a 'usuario'
        });
    });

    // --- RUTAS (Endpoints) ---

    // 1. GET Personas
    app.get("/personas", async (req, res) => {
        const em = orm.em.fork();
        const personas = await em.find(Persona, {});
        res.json(personas);
    });

    // 2. POST Persona (Aquí probaremos la auditoría)
    app.post("/personas", async (req, res) => {
        const em = orm.em.fork();
        const nueva = new Persona();
        Object.assign(nueva, req.body); // Copia simple (validar en prod)
        
        await em.persist(nueva).flush();
        res.json({ message: "Persona creada", id: nueva.nro });
    });

    // GET Cuotas (para probar auditoría en UPDATE luego)
    app.get("/cuotas", async (req, res) => {
        const em = orm.em.fork();
        const cuotas = await em.find(Cuota, {});
        res.json(cuotas);
    });

    // 3. POST /pagos (La joya del club)
    app.post("/pagos", async (req, res) => {
        const em = orm.em.fork();
        
        try {
            const { cuotaId, monto, medioPago, observacion } = req.body;

            // 1. Buscamos la cuota (y fallamos si no existe)
            const cuota = await em.findOneOrFail(Cuota, { numero: cuotaId });

            // 2. Creamos el Ticket
            const ticket = new Ticket();
            ticket.cuota = cuota;
            ticket.montoPagado = monto;
            ticket.medioPago = medioPago || MedioPago.EFECTIVO;
            ticket.observacion = observacion;

            // 3. Lógica de Negocio: Actualizar la Cuota
            cuota.saldoPagado = Number(cuota.saldoPagado) + Number(monto);
            const deudaRestante = cuota.montoOriginal - cuota.saldoPagado;

            // Chequeamos si saldó la deuda
            if (cuota.saldoPagado >= cuota.montoOriginal) {
                cuota.estado = EstadoCuota.PAGADA;
                cuota.fechaPagoTotal = new Date();
            } else {
                cuota.estado = EstadoCuota.PARCIAL;
            }

            // 4. Guardamos todo (El AuditSubscriber registrará AMBOS cambios: Ticket creado y Cuota actualizada)
            await em.persist([ticket, cuota]).flush();

            res.json({ 
                message: "Pago registrado exitosamente", 
                ticketId: ticket.numero,
                saldoPendiente: deudaRestante > 0 ? deudaRestante : 0,
                saldoAFavor: deudaRestante < 0 ? Math.abs(deudaRestante) : 0,
                estadoCuota: cuota.estado
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // GET Tickets (para probar auditoría en UPDATE luego)
    app.get("/tickets", async (req, res) => {
        const em = orm.em.fork();
        const tickets = await em.find(Ticket, {});
        res.json(tickets);
    });

    app.post("/cuotas/generar-masiva", async (req, res) => {
        const em = orm.em.fork();
        try{
            // 1. Validar qué mes queremos liquidar
            const mes = req.body.mes || new Date().getMonth() + 1;
            const anio = req.body.anio || new Date().getFullYear();

            // 2. Traer todas las inscripciones activas (join con Actividad para saber el precio)
            const inscripciones = await em.find(Inscripcion, { 
                estado: EstadoInscripcion.ACTIVA 
            }, { populate: ['actividad'] });

            // 3. Iterar y crear cuotas
            let creadas = 0;
            for (const inscripcion of inscripciones) {
                // A. Chequear si ya existe (Idempotencia)
                const existe = await em.count(Cuota, { 
                    inscripcion, 
                    mes, 
                    anio 
                });

                if (existe > 0) continue; // Ya tiene cuota, saltamos

                // B. Crear la nueva cuota
                const nuevaCuota = new Cuota();
                nuevaCuota.inscripcion = inscripcion;
                nuevaCuota.mes = mes;
                nuevaCuota.anio = anio;
                nuevaCuota.montoOriginal = inscripcion.actividad.precioActual; // ¡Clave!
                nuevaCuota.fechaVencimiento = new Date(anio, mes - 1, 10); // Vence el 10 del mes
                
                em.persist(nuevaCuota);
                creadas++;
            }

            // 4. Guardar todo
            await em.flush();
        }catch(error: any){
            res.status(400).json({ error: error.message });
        }
    });

    // GET /personas/:id/estado-cuenta
    app.get("/personas/:id/estado-cuenta", async (req, res) => {
        const em = orm.em.fork();
        const idPersona = Number(req.params.id);

        try {
            // 1. Buscamos la Persona
            const persona = await em.findOneOrFail(Persona, { nro: idPersona });

            // 2. Buscamos sus Inscripciones y cargamos (populate) Actividad y Cuotas
            //    Esto es clave: Traemos todo relacionado en una sola consulta eficiente.
            const inscripciones = await em.find(Inscripcion,
                { persona }, 
                { populate: ['actividad', 'cuotas'] });

            // 3. Calculamos Totales (Lógica de Presentación)
            let totalDeuda = 0;
            let totalPagadoHistorico = 0;

            // Mapeamos para darle un formato lindo al JSON
            const detalleActividades = inscripciones.map(insc => {
                // Filtramos cuotas que no estén pagadas al 100% para ver deuda rápida
                const cuotasPendientes = insc.cuotas
                    .getItems() // MikroORM devuelve una Collection, usamos getItems()
                    //.filter(c => c.estado !== EstadoCuota.PAGADA)
                    .map(c => {
                        totalDeuda += (Number(c.montoOriginal) - Number(c.saldoPagado));
                        return {
                            id: c.numero,
                            mes: c.mes,
                            anio: c.anio,
                            monto: c.montoOriginal,
                            saldoPendiente: Number(c.montoOriginal) - Number(c.saldoPagado),
                            estado: c.estado
                        };
                    });

                // Sumamos lo pagado en todas las cuotas (histórico)
                insc.cuotas.getItems().forEach(c => {
                    totalPagadoHistorico += Number(c.saldoPagado);
                });

                return {
                    actividad: insc.actividad.nombre,
                    fechaIngreso: insc.fechaInscripcion,
                    estado: insc.estado,
                    deudaEnEstaActividad: cuotasPendientes.reduce((acc, curr) => acc + curr.saldoPendiente, 0),
                    cuotasPendientes: cuotasPendientes
                };
            });

            // 4. Respuesta consolidada
            res.json({
                cliente: {
                    nombre: persona.nombre,
                    apellido: persona.apellido,
                    dni: persona.dni_cuit
                },
                resumenFinanciero: {
                    totalDeudaClub: totalDeuda,  // El número rojo grande
                    totalPagadoHistorico: totalPagadoHistorico // Dato curioso para el club
                },
                detalle: detalleActividades
            });
        } catch (error: any) {
            res.status(404).json({ error: "Persona no encontrada o error interno" });
        }
        });

    app.listen(3000, () => {
        console.log("Servidor corriendo en http://localhost:3000");
    });
})();