import { Entity, PrimaryKey, Property, ManyToOne, Enum, OneToMany, Collection, OneToOne } from "@mikro-orm/core";
import { Socio } from "../personas/tipoPersona/socio";
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

    @ManyToOne(() => Socio)
    socio!: Socio;

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