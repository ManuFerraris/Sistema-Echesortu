import express from "express";
import cors from "cors";
import { orm } from "./shared/db/orm";
import { RequestContext } from "@mikro-orm/core";
import { authMiddleware } from "./shared/middleware/auth.middleware";
import { authRouter } from "./modules/auth/infrastructure/auth.routes";
import { personaRouter } from "./modules/personas/infrastructure/persona.route";
import { cuotaRouter } from "./modules/coutas/infrastructure/cuota.routes";
import { pagoRouter } from "./modules/pagos/infrastructure/pago.routes";
import { ticketRouter } from "./modules/ticket/infrastructure/ticket.routes";
import { inscripcionRouter } from "./modules/inscripcion/infrastructure/inscripcion.routes";
import { actividadRouter } from "./modules/actividad/infrastructure/actividad.routes";

export const app = express();

app.locals.orm = orm;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    // Recuperamos el ORM que inyectaremos en el server.ts
    const orm = req.app.locals.orm; 
    if (orm) {
        RequestContext.create(orm.em, next);
    } else {
        next();
    }
});

// ========================
// ZONA PÚBLICA (Sin Token)
// ========================
app.use("/api/auth", authRouter);

// ==========================
// ZONA DE CONTROL (El Peaje)
// ==========================
app.use('/api', authMiddleware);

// ========================
// ZONA PRIVADA (Protegida)
// ========================
app.use("/api/personas", personaRouter);
app.use("/api/cuotas", cuotaRouter);
app.use("/api/pagos", pagoRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/inscripciones", inscripcionRouter);
app.use("/api/actividades", actividadRouter);

app.use((_, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});