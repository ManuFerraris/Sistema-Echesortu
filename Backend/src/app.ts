import express from "express";
import cors from "cors";
import { orm } from "./shared/db/orm";
import { RequestContext } from "@mikro-orm/core";
import { userContext } from "./modules/utils/userContext";
import { personaRouter } from "./modules/personas/infrastructure/persona.route";
import { cuotaRouter } from "./modules/coutas/infrastructure/cuota.routes";
import { pagoRouter } from "./modules/pagos/infrastructure/pago.routes";
import { ticketRouter } from "./modules/ticket/infrastructure/ticket.routes";

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

// 2. Middleware de Usuario (AsyncLocalStorage)
app.use((req, res, next) => {
    const usuario = req.headers["x-user"]?.toString() || "anonimo";
    userContext.run(usuario, () => {
        next();
    });
});

app.use("/api/personas", personaRouter);
app.use("/api/cuotas", cuotaRouter);
app.use("/api/pagos", pagoRouter);
app.use("/api/tickets", ticketRouter);
    
app.use((_, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

