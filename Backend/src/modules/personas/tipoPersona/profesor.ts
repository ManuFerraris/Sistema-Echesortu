import { Entity, PrimaryKey, Property, OneToOne, Collection, ManyToMany } from "@mikro-orm/core";
import { Persona } from "../persona";
import { Actividad } from "../../actividad/actividad";

@Entity()
export class Profesor {
    @PrimaryKey()
    nro!: number;

    @Property()
    nro_profesor!: string;
    
    @OneToOne(() => Persona, { nullable: false })
    persona!: Persona;

    @ManyToMany(() => Actividad, actividad => actividad.profesores)
    actividades = new Collection<Actividad>(this);
}