import { Entity, Unique, PrimaryKey, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { Inscripcion } from "../inscripcion/inscripcion";

export enum EstadoCuota {
    PENDIENTE = "pendiente",
    PARCIAL = "parcial",
    PAGADA = "pagada",
    VENCIDA = "vencida",
    ANULADA = "anulada"
};

@Entity()
@Unique({ properties: ['inscripcion', 'mes', 'anio'] })
export class Cuota {
    @PrimaryKey()
    numero!: number; // PK Técnica (para que Ticket la use fácil)

    @ManyToOne(() => Inscripcion)
    inscripcion!: Inscripcion; // Parte de la clave lógica

    @Property()
    mes!: number; // Parte de la clave lógica (discriminador)

    @Property()
    anio!: number; // Parte de la clave lógica

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    montoOriginal!: number;

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    saldoPagado: number = 0; // Para controlar pagos parciales

    @Property()
    fechaEmision: Date = new Date();

    @Property()
    fechaVencimiento!: Date;

    @Property({ nullable: true })
    fechaPagoTotal?: Date;

    @Enum(() => EstadoCuota)
    estado: EstadoCuota = EstadoCuota.PENDIENTE;
}