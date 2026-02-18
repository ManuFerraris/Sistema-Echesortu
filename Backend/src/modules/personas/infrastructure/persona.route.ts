import { Router } from "express";
import { getPersonas,
    getPersona,
    crearPersona,
    actualizarPersona,
    darDeBajaPersona,
    reactivarSocioController,
    getEstadoCuenta,
    obtenerPersona,
    actualizarFoto,
    eliminarPersonaPermanente
} from "./persona.controller";
import { uploadFoto } from "../../../shared/config/cloudinary";

export const personaRouter = Router();

personaRouter.post('/', uploadFoto.single('fotoPerfil'), crearPersona);

//Endpoint específico solo para actualizar la foto después:
personaRouter.put('/:id/foto', uploadFoto.single('fotoPerfil'), actualizarFoto);

personaRouter.get("/", getPersonas);
personaRouter.get('/buscar', getPersona);
personaRouter.put("/:nro", uploadFoto.single('fotoPerfil'), actualizarPersona);
personaRouter.delete("/:nro", darDeBajaPersona);
personaRouter.delete("/:nro/eliminar-definitivo", eliminarPersonaPermanente);
personaRouter.patch('/:nro/activar', reactivarSocioController);
personaRouter.get("/:nro/estado-cuenta", getEstadoCuenta);
personaRouter.get('/obtenerPersona/:id', obtenerPersona);