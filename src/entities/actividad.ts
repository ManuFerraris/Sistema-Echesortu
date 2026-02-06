import { Entity, PrimaryKey, Property, Collection, OneToMany } from "@mikro-orm/core";
import { Inscripcion } from "./inscripcion";

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
}