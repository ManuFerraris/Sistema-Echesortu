import { Ticket } from "./ticket";

export interface TicketRepository {
    buscarTickets(): Promise<Ticket[]>;
}