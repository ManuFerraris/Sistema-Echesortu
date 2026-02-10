import { Router } from "express";
import { incribirSocio } from "./inscripcion.controller";

export const inscripcionRouter = Router();

inscripcionRouter.post("/", incribirSocio);