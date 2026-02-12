import { Entity, PrimaryKey, Property, ManyToOne, Enum, Rel } from "@mikro-orm/core";
import { Cuota } from "../coutas/cuota";
import { Caja } from "../caja/caja";

export enum MedioPago {
    EFECTIVO = 'efectivo',
    TRANSFERENCIA = 'transferencia',
    MERCADOPAGO = 'mercadopago',
    DEBITO = 'debito',
    CREDITO = 'credito',
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

    @ManyToOne(() => Caja, { nullable: true })
    caja?: Rel<Caja>;
}