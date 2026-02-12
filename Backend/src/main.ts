import "reflect-metadata";
import { app } from "./app";
import { initORM } from "./shared/db/orm";
import { iniciarCronJobs } from "./shared/services/cron.service";

async function bootstrap() {
    try {
        console.log("[STARTING] Iniciando sistema del Club...");

        // 1. Iniciar Base de Datos
        const orm = await initORM();
        console.log("[DATA BASE] Base de datos conectada!");

        // 2. Inyectar ORM en Express (Igual que en la Peluquería)
        app.locals.orm = orm;
        console.log("[DATA BASE] ORM inyectado en Express!");

        // 3. Arrancar el servidor
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`[ SISTEMA ] Servidor corriendo en http://localhost:${PORT}`);
        });

        // 4. Iniciar Cron Jobs
        iniciarCronJobs(orm);

    } catch (error) {
        console.error("[ERROR] Error fatal al iniciar:", error);
        process.exit(1);
    }
}

bootstrap();