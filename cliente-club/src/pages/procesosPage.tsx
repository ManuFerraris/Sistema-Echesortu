import { useState } from 'react';
import { api } from '../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../api/routes';
import { Calendar, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ApiResponse } from '../types';

export function ProcesosPage() {
    // Default: Mes siguiente al actual
    const hoy = new Date();
    const [mes, setMes] = useState(hoy.getMonth() + 1); // JS cuenta meses 0-11
    const [anio, setAnio] = useState(hoy.getFullYear());
    
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<{ creadas: number, mensaje: string } | null>(null);
    const [error, setError] = useState('');

    const handleGenerar = async () => {
        if (!confirm(`¿Estás seguro de generar las cuotas para el período ${mes}/${anio}?`)) return;

        setLoading(true);
        setError('');
        setResultado(null);

        try {
        const payload = { mes: Number(mes), anio: Number(anio) };
        
        // Llamamos al endpoint masivo que creamos en el backend
        const res = await api.post<ApiResponse<{ creadas: number, mes: number, anio: number }>>(
            API_ROUTES.cuotas.generarMasiva, 
            payload
        );

        if (res.data.success) {
            setResultado({
                creadas: res.data.data.creadas,
                mensaje: res.data.messages[0]
            });
        } else {
            setError(res.data.messages[0]);
        }

        } catch (error) {
            console.error(error);
            const err = error as AxiosError<ApiResponse<null>>;
            const msg = err.response?.data?.messages?.[0] || 'Error al generar cuotas.';
            console.log("Error detallado:", err.response);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>⚙️ Procesos Administrativos</h1>
        <p style={{ color: '#64748b' }}>Tareas de mantenimiento y cierre de mes.</p>

        <div style={{ marginTop: '2rem', display: 'grid', gap: '20px' }}>
            
            {/* TARJETA DE GENERACIÓN */}
            <div style={{ 
                background: 'white', padding: '25px', borderRadius: '12px', 
                border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}>
                        <Calendar size={28} color="#2563eb" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Generación Masiva de Cuotas</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Genera la deuda mensual para todos los socios activos según sus inscripciones.
                        </p>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mes</label>
                        <select 
                            value={mes} onChange={e => setMes(Number(e.target.value))}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '150px' }}
                        >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                <option key={m} value={m}>{m} - {new Date(0, m-1).toLocaleString('es', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Año</label>
                        <input 
                            type="number" 
                            value={anio} onChange={e => setAnio(Number(e.target.value))}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100px' }}
                        />
                    </div>

                    <button 
                        onClick={handleGenerar}
                        disabled={loading}
                        style={{ 
                            padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', 
                            borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            fontWeight: '600', height: '40px'
                        }}
                    >
                        {loading ? 'Procesando...' : <><Play size={18} /> Ejecutar Proceso</>}
                    </button>
                </div>

                {/* FEEDBACK ÉXITO */}
                {resultado && (
                    <div style={{ 
                        marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', 
                        borderRadius: '8px', color: '#166534', display: 'flex', gap: '10px', alignItems: 'center' 
                    }}>
                        <CheckCircle size={24} />
                        <div>
                            <strong>¡Proceso finalizado!</strong>
                            <p style={{ margin: 0 }}>{resultado.mensaje}</p>
                        </div>
                    </div>
                )}

                {/* FEEDBACK ERROR */}
                {error && (
                    <div style={{ 
                        marginTop: '20px', padding: '15px', background: '#fef2f2', border: '1px solid #fecaca', 
                        borderRadius: '8px', color: '#991b1b', display: 'flex', gap: '10px', alignItems: 'center' 
                    }}>
                        <AlertTriangle size={24} />
                        <div>
                            <strong>Hubo un problema</strong>
                            <p style={{ margin: 0 }}>{error}</p>
                        </div>
                    </div>
                )}
            </div>

        </div>
        </div>
    );
}