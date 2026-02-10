import { EntityManager } from "@mikro-orm/core";
import { Cuota } from "../cuota";
import { CuotaRepository } from "../cuotaRepository";

export class CuotaRepositoryORM implements CuotaRepository {
    constructor(private em: EntityManager) {};

    async buscarCuotas(): Promise<Cuota[]> {
        return this.em.find(Cuota, {});
    };

    async buscarCuotaPorId(id: number): Promise<Cuota | null> {
        return this.em.findOne(Cuota, { numero:id });
    };
};