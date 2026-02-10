import { MikroORM } from "@mikro-orm/core";
import config from "./mikro-orm.config";

export let orm: MikroORM;

export async function initORM() {
    if (!orm) {
        orm = await MikroORM.init(config);
    };
    
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();

    return orm;
};