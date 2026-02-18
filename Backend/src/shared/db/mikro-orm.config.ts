import { Options, MySqlDriver } from "@mikro-orm/mysql";
import { Persona } from "../../modules/personas/persona";
import { Socio } from "../../modules/personas/tipoPersona/socio";
import { Proveedor } from "../../modules/personas/tipoPersona/proveedor";
import { Profesor } from "../../modules/personas/tipoPersona/profesor";
import { Empleado } from "../../modules/personas/tipoPersona/empleado";
import { Actividad } from "../../modules/actividad/actividad";
import { Inscripcion } from "../../modules/inscripcion/inscripcion";
import { Cuota } from "../../modules/coutas/cuota";
import { Ticket } from "../../modules/ticket/ticket";
import { Usuario } from "../../modules/usuarios/usuario";
import { AuditLog } from "../../modules/auditoria/audit_log";
import { AuditSubscriber } from "../../modules/auditoria/subscribers/auditSubscriber";

const config: Options = {
    driver: MySqlDriver,
    dbName: 'club_echesortu',
    user: 'root',
    password: 'root',
    host: 'localhost',
    port: 3306,
    entities: [
        Persona, Socio, Proveedor, Profesor, Empleado, 
        Actividad, Inscripcion, Cuota, Ticket, Usuario, AuditLog
    ],
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