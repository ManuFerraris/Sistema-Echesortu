import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR DE REQUEST ---
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// --- INTERCEPTOR DE RESPONSE ---
// Si el backend nos responde 401 (Token vencido o falso), nos patea al login.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Borramos el token vencido
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            // Redirigimos al login (fuerza bruta)
            // Nota: En React Router se puede hacer más elegante, pero esto funciona siempre.
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            };
        };
        return Promise.reject(error);
    }
);