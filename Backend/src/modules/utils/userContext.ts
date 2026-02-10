import { AsyncLocalStorage } from "node:async_hooks";

// Esto crea un almacenamiento que vive solo durante la petición HTTP
export const userContext = new AsyncLocalStorage<string>();