import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Caja } from "../caja/caja";

@Entity()
export class Usuario {
    @PrimaryKey()
    numero!: number;

    @Property({ unique: true })
    nombreUsuario!: string;

    @Property()
    password!: string;

    @Property({ nullable: true })
    rol?: "ADMIN" | "SECRETARY";

    @Property()
    activo: boolean = true;

    @OneToMany(() => Caja, caja => caja.usuario)
    cajas = new Collection<Caja>(this);
}