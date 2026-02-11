import { Router } from "express";
import { getPersonas,
    getPersona,
    crearPersona,
    actualizarPersona,
    darDeBajaPersona,
    reactivarPersonaController,
    getEstadoCuenta,
    obtenerPersona
} from "./persona.controller";

export const personaRouter = Router();

personaRouter.get("/", getPersonas);
personaRouter.get('/buscar', getPersona);
personaRouter.post("/", crearPersona);
personaRouter.put("/:nro", actualizarPersona);
personaRouter.delete("/:nro", darDeBajaPersona);
personaRouter.patch('/:nro/activar', reactivarPersonaController);
personaRouter.get("/:nro/estado-cuenta", getEstadoCuenta);
personaRouter.get('/:id', obtenerPersona);