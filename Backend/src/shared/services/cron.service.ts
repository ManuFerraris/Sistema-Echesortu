import cron from "node-cron";
import { MikroORM } from "@mikro-orm/core";
import { GenerarCuotasMasivas } from "../../modules/coutas/application/generarCuotasMasivas";

export const iniciarCronJobs = (orm: MikroORM) => {
    // Generar Cuotas el día 1 de cada mes a las 03:00 AM
    // Sintaxis Cron:  Minuto Hora DíaMes Mes DíaSemana
    cron.schedule("0 3 1 * *", async () => {
        console.log("[ CRON ] Ejecutando tarea programada: Generar Cuotas Masivas...");
        try{
            const em = orm.em.fork();
            const generador = new GenerarCuotasMasivas();
            //Por defecto generamos para el mes actual, pero podríamos extender esto para aceptar parámetros o generar para meses futuros.
            const resultado = await generador.ejecutar({}, em);
            console.log('[ CRON ] Resultado:', resultado.messages[0]);
            return;
        }catch(error){
            console.error("[ CRON ] Error al generar cuotas masivas:", error);
            return;
        }
    });
    
    console.log('[ SISTEMA ] Motor de Cron Jobs iniciado.');
}