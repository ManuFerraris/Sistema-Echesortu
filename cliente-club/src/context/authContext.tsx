import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/axios';
import { API_ROUTES } from '../api/routes';
import type { ApiResponse } from '../types';

interface User {
    username: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (usuario: string, password: string) => Promise<void>;
    logout: () => void;
    // Eliminamos 'loading' porque con la carga perezosa es instantáneo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');
        
        if (token && usuario) {
            return { token, username: usuario };
        }
        return null;
    });

    const login = async (usuario: string, password: string) => {
        const rutaLogin = API_ROUTES.auth?.login || '/auth/login'; 

        const res = await api.post<ApiResponse<{ token: string, usuario: string }>>(rutaLogin, { 
            usuario, 
            password 
        });

        if (res.data.success) {
            const { token, usuario: username } = res.data.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', username);
            setUser({ token, username });
        } else {
            throw new Error(res.data.messages[0]);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Le decimos al linter que ignore esta regla aquí
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return context;
};