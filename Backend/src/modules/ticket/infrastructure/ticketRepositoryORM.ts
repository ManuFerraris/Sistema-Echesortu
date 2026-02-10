import { Ticket } from "../ticket";
import { TicketRepository } from "../ticketRepository";
import { EntityManager } from "@mikro-orm/core";

export class TicketRepositoryORM implements TicketRepository {
    constructor(private em: EntityManager) {};

    async buscarTickets(): Promise<Ticket[]> {
        return this.em.find(Ticket, {});
    };
}