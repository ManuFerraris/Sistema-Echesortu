import { Cuota } from "./cuota";

export interface CuotaRepository {
    buscarCuotas(): Promise<Cuota[]>;
    buscarCuotaPorId(id: number): Promise<Cuota | null>;
}