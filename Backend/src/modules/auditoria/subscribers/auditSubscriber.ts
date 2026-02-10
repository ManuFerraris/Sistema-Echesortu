import { EventSubscriber, EventArgs, EntityName, RequestContext } from "@mikro-orm/core";
import { userContext } from "../../utils/userContext";
import { AuditLog } from "../audit_log";
import { Cuota } from "../../coutas/cuota";
import { Ticket } from "../../ticket/ticket";
import { Persona } from "../../personas/persona";
import { Inscripcion } from "../../inscripcion/inscripcion";

// Definimos qué entidades queremos vigilar
export class AuditSubscriber implements EventSubscriber {
    
    getSubscribedEntities(): EntityName<any>[] {
        return [Cuota, Ticket, Persona, Inscripcion];
    }

    private getUser(): string {
        // Recuperamos datos guardados en el contexto de la petición actual
        // Si no hay contexto (ej: seed), usa "system"
        return userContext.getStore() || "system";
    }

    async afterCreate(args: EventArgs<any>): Promise<void> {
        const { entity, em } = args;
        const log = new AuditLog(
            entity.constructor.name,
            String(entity.numero || entity.id),
            'CREATE',
            this.getUser(),
            { nuevoValor: entity } // Guardamos lo que se creó
        );
        await em.fork().persist(log).flush(); 
    }

    async afterUpdate(args: EventArgs<any>): Promise<void> {
        const { entity, changeSet, em } = args;
        if (!changeSet) return;

        const log = new AuditLog(
            entity.constructor.name,
            String(entity.numero || entity.id),
            'UPDATE',
            this.getUser(),
            changeSet.payload // Esto contiene solo los campos que cambiaron
        );

        await em.fork().persist(log).flush();
    }
}