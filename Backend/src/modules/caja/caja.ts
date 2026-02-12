import { Entity, PrimaryKey, Property, OneToMany, Collection, ManyToOne } from "@mikro-orm/core";
import { Ticket } from "../ticket/ticket";
import { Usuario } from "../usuarios/usuario";

@Entity()
export class Caja {
    @PrimaryKey()
    id!: number;

    @Property()
    numero!: number;

    @Property({ length: 100, nullable: true })
    nombre?: string; // Ej: "Caja Administración Mañana"

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    saldoInicial: number = 0;

    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    saldoFinal: number = 0; // Se calcula al cerrar

    // Diferencia entre lo que dice el sistema y lo que hay en el cajón (Faltante/Sobrante)
    @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    diferencia: number = 0; 

    @Property()
    fechaApertura: Date = new Date();

    @Property({ nullable: true })
    fechaCierre?: Date;

    @Property({ default: 'abierta' })
    estado!: 'abierta' | 'cerrada';

    @Property({ nullable: true })
    observaciones?: string;
    
    // Usuario que abrió la caja (Fundamental para saber quién es responsable)
    @ManyToOne(() => Usuario)
    usuario!: Usuario;

    // Los tickets que pertenecen a ESTA sesión
    @OneToMany(() => Ticket, ticket => ticket.caja)
    tickets = new Collection<Ticket>(this);
}