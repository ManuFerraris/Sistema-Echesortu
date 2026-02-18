import express from "express";
import helmet from 'helmet';
import cors from "cors";
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import { orm } from "./shared/db/orm";
import { RequestContext } from "@mikro-orm/core";
import { authMiddleware } from "./shared/middleware/auth.middleware";
import { socioRouter } from "./modules/personas/infrastructure/socio.routes";
import { authRouter } from "./modules/auth/infrastructure/auth.routes";
import { usuarioRouter } from "./modules/usuarios/infrastructure/usuario.routes";
import { personaRouter } from "./modules/personas/infrastructure/persona.route";
import { cuotaRouter } from "./modules/coutas/infrastructure/cuota.routes";
import { pagoRouter } from "./modules/pagos/infrastructure/pago.routes";
import { ticketRouter } from "./modules/ticket/infrastructure/ticket.routes";
import { inscripcionRouter } from "./modules/inscripcion/infrastructure/inscripcion.routes";
import { actividadRouter } from "./modules/actividad/infrastructure/actividad.routes";
import { dashboardRouter } from "./modules/dashboard/infrastructure/dashboard.routes";
import { cajaRouter } from "./modules/caja/infrastructure/caja.routes";

export const app = express();

// HELMET: Protege cabeceras HTTP
app.use(helmet());

// CORS: Solo permitimos a nuestro Frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Límite de 5 peticiones por IP
    message: { 
        status: 429, 
        success: false, 
        messages: ["Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos."] 
    },
    standardHeaders: true, // Retorna info en los headers `RateLimit-*`
    legacyHeaders: false,
});

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

app.use('/api/auth/login', loginLimiter);

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
app.use("/api/dashboard", dashboardRouter);
app.use("/api/caja", cajaRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/socios", socioRouter);

app.use((_, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});