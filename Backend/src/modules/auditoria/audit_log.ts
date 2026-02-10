import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class AuditLog {
    @PrimaryKey()
    numero!: number;

    @Property()
    entityName!: string; // Ej: "Cuota", "Ticket"

    @Property()
    entityNro!: string;   // El ID del registro afectado

    @Property()
    action!: 'CREATE' | 'UPDATE' | 'DELETE';

    @Property()
    usuario!: string; // Aquí iría el ID del operario (por ahora simulado)

    @Property({ type: 'json', nullable: true })
    changes?: any; // Guardaremos qué cambió exactamente (valor viejo vs nuevo)

    @Property()
    createdAt: Date = new Date();

    constructor(entityName: string, entityNro: string, action: 'CREATE' | 'UPDATE' | 'DELETE', usuario: string, changes?: any) {
        this.entityName = entityName;
        this.entityNro = entityNro;
        this.action = action;
        this.usuario = usuario;
        this.changes = changes;
    }
}