export const API_ROUTES = {
    auth: {
        login: '/api/auth/login',
    },
    personas: {
        list: '/api/personas',
        create: '/api/personas',
        // Función para generar la URL dinámica
        getById: (id: number | string) => `/api/personas/${id}`,
        update: (id: number | string) => `/api/personas/${id}`,
        delete: (id: number | string) => `/api/personas/${id}`,
        // Tu ruta específica
        estadoCuenta: (id: number | string) => `/api/personas/${id}/estado-cuenta`,
        activar: (id: number | string) => `/api/personas/${id}/activar`,
    },
    pagos: {
        create: '/api/pagos',
        getTickets: '/api/tickets',
    },
    cuotas: {
        generarMasiva: '/api/cuotas/generar-masiva',
    },
    actividades: {
        list: '/api/actividades',
        update: (id: number) => `/api/actividades/${id}`
    },
    inscripciones: {
        create: '/api/inscripciones',
    },
    dashboard: {
        stats: '/api/dashboard/stats'
    }
} as const;