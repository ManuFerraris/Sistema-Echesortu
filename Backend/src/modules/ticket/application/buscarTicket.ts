import { Ticket } from "../ticket";
import { TicketRepository } from "../ticketRepository";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

export class BuscarTickets {
    constructor(private ticketRepo: TicketRepository) {};

    async ejecutar(): Promise<ServiceResponse<Ticket[]>> {
        const tickets = await this.ticketRepo.buscarTickets();
        if (tickets.length === 0) {
            return {
                status: 200,
                success: true,
                messages: ["No hay tickets registrados en el sistema."],
                data: tickets
            };
        };
        return {
            status: 200,
            success: true,
            messages: ["Tickets obtenidos exitosamente"],
            data: tickets
        };
    };
}