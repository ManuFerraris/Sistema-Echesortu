import { Entity, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";
import { Persona } from "../persona";

@Entity()
export class Empleado {
    @PrimaryKey()
    nro!: number;

    @Property()
    nro_empleado!: string;

    @Property()
    cargo!: string;

    @Property({ nullable: true })
    fecha_ingreso?: Date;
    
    @OneToOne(() => Persona, { nullable: false })
    persona!: Persona;

}