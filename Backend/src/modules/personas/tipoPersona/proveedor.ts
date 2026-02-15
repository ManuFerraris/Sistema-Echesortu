import { Entity, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";
import { Persona } from "../persona";

@Entity()
export class Proveedor {
    @PrimaryKey()
    nro!: number;

    @Property()
    rubro!: string;

    @Property()
    nro_proveedor!: string;

    @Property({ nullable: true })
    cbu?: string;

    @Property({ nullable: true })
    alias?: string;

    @Property()
    condicion_iva!: string;

    @OneToOne(() => Persona, { owner: true, unique: true })
    persona!: Persona;
}