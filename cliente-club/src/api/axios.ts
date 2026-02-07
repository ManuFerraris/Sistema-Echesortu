import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Antes de cada petición, metemos el usuario "falso"
// En el futuro, aquí iría el token JWT
api.interceptors.request.use((config) => {
    config.headers['x-user'] = 'MARTA_FRONTEND'; 
    return config;
});