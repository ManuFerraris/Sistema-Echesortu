import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

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

    @Property({ nullable: true })
    fotoUrl?: string;

    // GETTER VIRTUAL: Nombre completo
    @Property({ persist: false }) 
    get nombreCompleto(): string {
        return `${this.apellido}, ${this.nombre}`;
    }

}