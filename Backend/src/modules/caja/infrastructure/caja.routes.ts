import { Router } from "express";
import { 
    abrirCaja,
    obtenerEstado,
    obtenerResumen,
    cerrarCaja,
    descargarReporteCierre
} from "./caja.controller";

export const cajaRouter = Router();

cajaRouter.post("/abrir", abrirCaja);
cajaRouter.get("/estado", obtenerEstado);
cajaRouter.get("/resumen", obtenerResumen);
cajaRouter.post("/cerrar", cerrarCaja);
cajaRouter.get("/:id/reporte-cierre", descargarReporteCierre);