import { Entity, PrimaryKey, Property, Collection, OneToMany } from "@mikro-orm/core";
import { Inscripcion } from "../inscripcion/inscripcion";

@Entity()
export class Persona {
    @PrimaryKey()
    nro!: number;

    @Property()
    nombre!: string; // O razon social

    @Property()
    apellido?: string; // Si es empresa -> apellido no es necesario

    @Property({ nullable: true })
    tipo: "fisica" | "juridica" = "fisica"; // Por defecto, asumimos persona física

    @Property({ nullable: true })
    socio?: boolean = false; // Por defecto, no es socio, es solo una persona

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

    @Property({ nullable: true })
    fotoUrl?: string;

    @OneToMany(() => Inscripcion, inscripcion => inscripcion.persona)
    inscripciones = new Collection<Inscripcion>(this);
}