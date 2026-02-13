import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { validarCodigo } from '../../utils/validarCodigo';
import { AbrirCaja } from '../application/abrirCaja';
import { ObtenerEstadoCaja } from '../application/obtenerEstadoCaja';
import { getUserIdFromHeader } from '../../../shared/helpers/auth.helper';
import { ObtenerResumenCaja } from '../application/obtenerResumenCaja';
import { CerrarCaja } from '../application/cerrarCaja';
import { GenerarReporteCierre } from '../application/generarReporteCierre';

export const abrirCaja = async (req: Request, res: Response):Promise<void> => {
    try {
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const userId = await getUserIdFromHeader(req, em);
        
        if (!userId) {
            res.status(401).json({ message: "Usuario no identificado (Falta header x-user o usuario no existe)" });
            return;
        }

        const { montoInicial, observaciones } = req.body;

        const useCase = new AbrirCaja();
        const resultado = await useCase.ejecutar({ usuarioId: userId, montoInicial, observaciones }, em);

        res.status(resultado.status).json(resultado);
        return;
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al abrir caja", errorMsg],
            data: null
        });
        return;
    };
};

export const obtenerEstado = async (req: Request, res: Response):Promise<void> => {
    try {
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const userId = await getUserIdFromHeader(req, em);

        if (!userId) {
            res.status(401).json({ message: "Usuario no identificado" });
            return;
        };

        const useCase = new ObtenerEstadoCaja();
        const resultado = await useCase.ejecutar(userId, em);

        res.status(resultado.status).json(resultado);
        return;
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al obtener estado de caja", errorMsg],
            data: null
        });
        return;
    };
};

export const obtenerResumen = async (req: Request, res: Response):Promise<void> => {
    try {
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const userId = await getUserIdFromHeader(req, em);

        if (!userId) {
            res.status(401).json({ message: "Usuario no identificado" });
            return;
        }

        const useCase = new ObtenerResumenCaja();
        const resultado = await useCase.ejecutar(userId, em);

        res.status(resultado.status).json(resultado);
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al obtener resumen de caja", errorMsg],
            data: null
        });
        return;
    };
};

export const cerrarCaja = async (req: Request, res: Response): Promise<void> => {
    try {
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const userId = await getUserIdFromHeader(req, em); // Helper auth

        if (!userId) {
            res.status(401).json({ message: "Usuario no identificado" });
            return;
        };

        const { montoFisicoRecuento, observaciones } = req.body;

        if (montoFisicoRecuento === undefined || montoFisicoRecuento === null) {
            res.status(400).json({ message: "Debés enviar el montoFisicoRecuento (lo que contaste en billetes)." });
            return;
        };

        const useCase = new CerrarCaja();
        const resultado = await useCase.ejecutar(userId, { montoFisicoRecuento, observaciones }, em);

        res.status(resultado.status).json(resultado);
        return;
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al cerrar caja", errorMsg],
            data: null
        });
        return;
    };
};

export const descargarReporteCierre = async (req: Request, res: Response): Promise<void> => {
    try {
        const em = (req.app.locals.orm as MikroORM).em.fork();
        const {error, valor: cajaId} = validarCodigo(req.params.id, 'Codigo de caja');

        if (error || cajaId === undefined) {
            res.status(400).json({ message: error });
            return;
        };

        const useCase = new GenerarReporteCierre();
        const pdfBuffer = await useCase.ejecutar(cajaId, em);
        
        if (typeof pdfBuffer === 'string') {
            res.status(400).json({ message: pdfBuffer });
            return;
        };

        // Configuramos los headers para que el navegador entienda que es un PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="cierre_caja_${cajaId}.pdf"`);
        
        res.send(pdfBuffer);
        return;
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al generar reporte de cierre", errorMsg],
            data: null
        });
        return;
    }
}