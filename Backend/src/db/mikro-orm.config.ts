import { Options, MySqlDriver } from "@mikro-orm/mysql";
import { Persona } from "../entities/persona";
import { Actividad } from "../entities/actividad";
import { Inscripcion } from "../entities/inscripcion";
import { Cuota } from "../entities/cuota";
import { Ticket } from "../entities/ticket";
import { AuditLog } from "../entities/audit_log";
import { AuditSubscriber } from "../subscribers/auditSubscriber";

const config: Options = {
    driver: MySqlDriver,
    dbName: 'club_echesortu',
    user: 'root',
    password: 'root',
    host: 'localhost',
    port: 3306,
    entities: [Persona, Actividad, Inscripcion, Cuota, Ticket, AuditLog],
    subscribers: [new AuditSubscriber()],
    debug: true,
    migrations: {
        path: "./src/migrations",
        transactional: true,
    },
    // Permitir sincronización automática para desarrollo rápido
    allowGlobalContext: true,
};

export default config;