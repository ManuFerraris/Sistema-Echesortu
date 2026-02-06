import { Options, MySqlDriver } from "@mikro-orm/mysql";
import { Persona } from "../entities/persona";
import { Actividad } from "../entities/actividad";
import { Inscripcion } from "../entities/inscripcion";
import { Cuota } from "../entities/cuota";

const config: Options = {
    driver: MySqlDriver,
    dbName: 'club_echesortu',
    user: 'root',
    password: 'root',
    host: 'localhost',
    port: 3306,
    entities: [Persona, Actividad, Inscripcion, Cuota],
    debug: true,
    migrations: {
        path: "./src/migrations",
        transactional: true,
    },
    // Permitir sincronización automática para desarrollo rápido
    allowGlobalContext: true,
};

export default config;