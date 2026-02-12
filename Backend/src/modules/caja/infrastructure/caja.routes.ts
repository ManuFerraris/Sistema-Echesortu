import { Router } from "express";
import { 
    abrirCaja,
    obtenerEstado,
    obtenerResumen,
    cerrarCaja
} from "./caja.controller";

export const cajaRouter = Router();

cajaRouter.post("/abrir", abrirCaja);
cajaRouter.get("/estado", obtenerEstado);
cajaRouter.get("/resumen", obtenerResumen);
cajaRouter.post("/cerrar", cerrarCaja);