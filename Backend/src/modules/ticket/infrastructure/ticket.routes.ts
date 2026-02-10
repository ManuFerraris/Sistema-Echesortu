import { Router } from "express";
import { getTickets } from "./ticket.controller";

export const ticketRouter = Router();

ticketRouter.get("/", getTickets);