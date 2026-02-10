import { Entity, PrimaryKey, Property, ManyToOne, Enum, OneToMany, Collection } from "@mikro-orm/core";
import { Persona } from "../personas/persona";
import { Actividad } from "../actividad/actividad";
import { Cuota } from "../coutas/cuota";

export enum EstadoInscripcion {
    ACTIVA = 'activa',
    SUSPENDIDA = 'suspendida',
    FINALIZADA = 'finalizada'
}

@Entity()
export class Inscripcion {
    @PrimaryKey()
    id!: number;

    @ManyToOne(() => Persona)
    persona!: Persona;

    @ManyToOne(() => Actividad)
    actividad!: Actividad;

    @Property()
    fechaInscripcion: Date = new Date();

    @Enum(() => EstadoInscripcion)
    estado: EstadoInscripcion = EstadoInscripcion.ACTIVA;

    @Property({ nullable: true })
    observacion?: string;

    @OneToMany(() => Cuota, cuota => cuota.inscripcion)
    cuotas = new Collection<Cuota>(this);
}