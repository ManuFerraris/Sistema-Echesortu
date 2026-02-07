import { Entity, PrimaryKey, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { Cuota } from "./cuota";

export enum MedioPago {
    EFECTIVO = 'efectivo',
    TRANSFERENCIA = 'transferencia',
    MERCADOPAGO = 'mercadopago',
    OTRO = 'otro'
}

@Entity()
export class Ticket {
    @PrimaryKey()
    numero!: number;

    @ManyToOne(() => Cuota)
    cuota!: Cuota;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    montoPagado!: number;

    @Property()
    fechaPago: Date = new Date();

    @Enum(() => MedioPago)
    medioPago: MedioPago = MedioPago.EFECTIVO;

    @Property({ nullable: true })
    observacion?: string; // Ej: "Trajo billetes chicos", "Pagó la abuela", etc.

    @Property({ default: false })
    anulado: boolean = false;
}