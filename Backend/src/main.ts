import "reflect-metadata";
import { app } from "./app";
import { initORM } from "./shared/db/orm";

async function bootstrap() {
    try {
        console.log("Iniciando sistema del Club...");

        // 1. Iniciar Base de Datos
        const orm = await initORM();
        console.log("Base de datos conectada");

        // 2. Inyectar ORM en Express (Igual que en la Peluquería)
        app.locals.orm = orm;

        // 3. Arrancar el servidor
        const PORT = 3000;
        app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Error fatal al iniciar:", error);
        process.exit(1);
    }
}

bootstrap();