import { useState } from 'react';
import { useAuth } from '../context/authContext';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, LogIn, AlertTriangle } from 'lucide-react';
import type { ApiResponse } from '../types/index.ts';
import logoClub from '../assets/logo.png';

export function LoginPage() {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(usuario, password);
            console.log("Login exitoso, redirigiendo...");
            navigate('/'); // Redirigir al Home/Caja si sale bien
        } catch (error) {
            console.error(error);
            const err = error as AxiosError<ApiResponse<null>>;
            const msg = err.response?.data?.messages?.[0] || 'Error al iniciar sesión';
            console.log("Error detallado:", err.response);
            setError(msg);
        } finally {
            setLoading(false);
        };
    };

    return (
        <div style={{ 
            height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            background: '#f1f5f9' 
        }}>
        <div style={{ 
            background: 'white', padding: '40px', borderRadius: '16px', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' 
        }}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img 
                    src={logoClub} 
                    alt="Escudo del Club" 
                    style={{ 
                        width: '120px',       // Ajusta el tamaño según tu gusto
                        height: 'auto',       // Mantiene la proporción
                        marginBottom: '15px',
                        // Opcional: Si el logo es cuadrado y quieres que sea redondo, descomenta esto:
                        // borderRadius: '50%', objectFit: 'cover', aspectRatio: '1/1'
                    }} 
                />

                <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem' }}>Acceso Socios</h1>
                <p style={{ color: '#64748b' }}>Sistema de Gestión Integral</p>
            </div>

            {error && (
                <div style={{ 
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', 
                    padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' 
                }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Usuario</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            value={usuario}
                            onChange={e => setUsuario(e.target.value)}
                            placeholder="Ej: admin"
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Contraseña</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••"
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', padding: '14px', background: '#2563eb', color: 'white', border: 'none', 
                        borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                >
                    {loading ? 'Entrando...' : <><LogIn size={20} /> Iniciar Sesión</>}
                </button>
            </form>
        </div>
        </div>
    );
}