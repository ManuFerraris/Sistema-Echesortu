import { Router } from "express";
import { getPersonas,
    getPersona,
    crearPersona,
    actualizarPersona,
    darDeBajaPersona,
    reactivarPersonaController,
    getEstadoCuenta,
    obtenerPersona,
    actualizarFoto,
    eliminarPersonaPermanente
} from "./persona.controller";
import { uploadFoto } from "../../../shared/config/cloudinary";

export const personaRouter = Router();

// Si querés que la foto se suba AL MISMO TIEMPO que se crea el socio:
// 'fotoPerfil' es el nombre del campo que el Frontend tiene que mandar
personaRouter.post('/', uploadFoto.single('fotoPerfil'), crearPersona);
// Opcional: Un endpoint específico solo para actualizar la foto después
personaRouter.put('/:id/foto', uploadFoto.single('fotoPerfil'), actualizarFoto);

personaRouter.get("/", getPersonas);
personaRouter.get('/buscar', getPersona);
personaRouter.put("/:nro", uploadFoto.single('fotoPerfil'), actualizarPersona);
personaRouter.delete("/:nro", darDeBajaPersona);
personaRouter.delete("/:nro/eliminar-definitivo", eliminarPersonaPermanente);
personaRouter.patch('/:nro/activar', reactivarPersonaController);
personaRouter.get("/:nro/estado-cuenta", getEstadoCuenta);
personaRouter.get('/obtenerPersona/:id', obtenerPersona);