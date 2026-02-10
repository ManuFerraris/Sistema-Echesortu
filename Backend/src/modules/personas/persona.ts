import { Entity, PrimaryKey, Property, Collection, OneToMany } from "@mikro-orm/core";
import { Inscripcion } from "../inscripcion/inscripcion";

@Entity()
export class Persona {
    @PrimaryKey()
    nro!: number;

    @Property()
    nombre!: string;

    @Property()
    apellido!: string;

    @Property({ nullable: true })
    tipo: "fisica" | "juridica" = "fisica"; // Por defecto, asumimos persona física

    @Property({ unique: true })
    dni_cuit!: string;

    @Property()
    fechaNacimiento!: Date;

    @Property({ unique: true, nullable: true })
    email!: string;

    @Property({ nullable: true })
    telefono?: string;

    @Property({ nullable: false })
    domicilio!: string;

    @Property()
    fechaAlta: Date = new Date();

    @Property({ default: true })
    activo: boolean = true;

    @Property({ nullable: true })
    rol_grupo_familiar?: string;

    @Property({ nullable: true })
    fecha_ingreso_grupo?: Date;

    @Property({ nullable: true })
    fechaReincorporacion?: Date;

    @OneToMany(() => Inscripcion, inscripcion => inscripcion.persona)
    inscripciones = new Collection<Inscripcion>(this);
}