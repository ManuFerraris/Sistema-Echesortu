import { Entity, PrimaryKey, Property, Collection, OneToMany, ManyToMany } from "@mikro-orm/core";
import { Inscripcion } from "../inscripcion/inscripcion";
import { Profesor } from "../personas/tipoPersona/profesor";

@Entity()
export class Actividad {
    @PrimaryKey()
    numero!: number;

    @Property()
    nombre!: string;

    @Property({ nullable: true })
    descripcion?: string;

    // Precio base actual (opcional, ya que tienes TarifaGeneral, pero útil de referencia)
    @Property({ type: 'decimal', precision: 10, scale: 2 })
    precioActual!: number;

    @OneToMany(() => Inscripcion, inscripcion => inscripcion.actividad)
    inscripciones = new Collection<Inscripcion>(this);

    @ManyToMany(() => Profesor, profesor => profesor.actividades, { owner: true })
    profesores = new Collection<Profesor>(this);
}