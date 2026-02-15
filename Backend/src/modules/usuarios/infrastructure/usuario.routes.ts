import { Router } from "express";
import { 
    findAll,
    register,
    update,
    logicalDelete,
    logicalActivate
} from "./usuario.controller";

export const usuarioRouter = Router();

usuarioRouter.get('/listado', findAll);
usuarioRouter.post('/register', register);
usuarioRouter.put('/update/:numero', update);
usuarioRouter.delete('/delete/:numero', logicalDelete);
usuarioRouter.put('/activate/:numero', logicalActivate);