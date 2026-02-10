import { Router } from "express";
import {
    generarCuotasMasivas,
    buscarCuotas
} from "./cuota.controller";

export const cuotaRouter = Router();

cuotaRouter.get("/buscar", buscarCuotas);
cuotaRouter.post("/generar-masiva", generarCuotasMasivas);