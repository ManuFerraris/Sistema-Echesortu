import { Cuota } from "../cuota";
import { CuotaRepository } from "../cuotaRepository";
import { ServiceResponse } from "../../../shared/types/serviceResponse";

export class BuscarCuotas {
    constructor(private cuotaRepository: CuotaRepository) {};
    async ejecutar(): Promise<ServiceResponse<Cuota[]>> {
        const cuotas = await this.cuotaRepository.buscarCuotas();
        if (cuotas.length === 0) {
            return {
                status: 200,
                success: true,
                messages: ["No hay cuotas registradas en el sistema."],
                data: cuotas
            };
        };
        return {
            status: 200,
            success: true,
            messages: ["Cuotas obtenidas exitosamente"],
            data: cuotas
        };
    };
}