import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/core";
import { BuscarTickets } from "../application/buscarTicket";
import { TicketRepositoryORM } from "./ticketRepositoryORM";

export async function getTickets(req: Request, res: Response) {
    try{
        const orm = req.app.locals.orm as MikroORM;
        const em = orm.em.fork();
        const repo = new TicketRepositoryORM(em);
        const casoUso = new BuscarTickets(repo);
        const resultado = await casoUso.ejecutar();
        
        res.status(resultado.status).json({
            success: resultado.success,
            messages: resultado.messages,
            data: resultado.data
        });
        return;
    }catch(error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        console.error(errorMsg);
        res.status(500).json({
            success: false,
            messages: ["Error interno al cargar tickets", errorMsg],
            data: null
        });
    }
};