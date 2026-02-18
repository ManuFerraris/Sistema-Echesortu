import { Entity, PrimaryKey, Property, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { Persona } from "../../personas/persona";
import { Inscripcion } from "../../inscripcion/inscripcion";

@Entity()
export class Socio {
    @PrimaryKey()
    nro!: number;

    @OneToOne(() => Persona, { owner: true, unique: true })
    persona!: Persona;

    @Property({ unique: true })
    nro_socio!: string; // Ej: "B-51396"

    @Property()
    categoria!: string; // "Cadete", "Activo", "Menor"

    @Property()
    vitalicio: boolean = false;

    @Property()
    fechaAlta: Date = new Date();

    @Property({ nullable: true })
    rol_grupo_familiar?: string;

    @Property({ nullable: true })
    fecha_ingreso_grupo?: Date;

    @Property({ nullable: true })
    fechaReincorporacion?: Date;

    @Property({ nullable: true })
    fechaBaja?: Date;

    @Property()
    activo: boolean = true; // Estado del ROL socio

    @OneToMany(() => Inscripcion, inscripcion => inscripcion.socio)
    inscripciones = new Collection<Inscripcion>(this);
}