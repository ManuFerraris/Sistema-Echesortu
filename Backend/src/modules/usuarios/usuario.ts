import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Usuario {
    @PrimaryKey()
    numero!: number;

    @Property({ unique: true })
    nombreUsuario!: string;

    @Property()
    password!: string;

    @Property({ nullable: true })
    rol?: string;
}