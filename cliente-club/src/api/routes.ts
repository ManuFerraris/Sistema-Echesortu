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
        search: (term: string) => `/api/personas/buscar?q=${term}`,
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
    },
    caja: {
        abrir: '/api/caja/abrir',
        cerrar: '/api/caja/cerrar',
        estado: '/api/caja/estado',
        resumen: '/api/caja/resumen',
        reporteCierre: (id: string) => `/api/caja/${id}/reporte-cierre`,
    }
} as const;