import { Router } from "express";
import { uploadFoto } from "../../../shared/config/cloudinary";
import {
    listarSocios,
    crearSocio
} from "./socioController";

export const socioRouter = Router();

socioRouter.get('/socios', listarSocios);
socioRouter.post('/', uploadFoto.single('fotoPerfil'),crearSocio);