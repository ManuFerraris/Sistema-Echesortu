import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { API_ROUTES } from '../api/routes';
import type { DashboardStats, ApiResponse } from '../types';
import { DollarSign, Users, AlertOctagon, Trophy } from 'lucide-react';

export function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
        try {
            const res = await api.get<ApiResponse<DashboardStats>>(API_ROUTES.dashboard.stats);
            console.log("Respuesta del servidor:", res);
            if (res.data.success) {
            setStats(res.data.data);
            }
        } catch (error) {
            console.error("Error cargando dashboard", error);
        } finally {
            setLoading(false);
        }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Cargando métricas...</div>;
    if (!stats) return <div style={{ padding: '2rem' }}>No hay datos disponibles.</div>;

    const mesNombre = new Date(0, stats.mes - 1).toLocaleString('es', { month: 'long' });

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '10px', textTransform: 'capitalize' }}>📊 Tablero de Control - {mesNombre} {stats.anio}</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Resumen ejecutivo del estado del club.</p>

            {/* GRID DE TARJETAS */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px', 
                marginBottom: '40px' 
            }}>
                
                {/* TARJETA 1: RECAUDACIÓN (Verde) */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 style={cardTitleStyle}>Recaudación Mes</h3>
                            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#16a34a' }}>
                                ${stats.recaudacionTotal.toLocaleString()}
                            </span>
                        </div>
                        <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '10px' }}>
                            <DollarSign size={28} color="#16a34a" />
                        </div>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Ingresos netos por tickets</p>
                </div>

                {/* TARJETA 2: MOROSIDAD (Roja) */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 style={cardTitleStyle}>Morosidad</h3>
                            <span style={{ fontSize: '2rem', fontWeight: '800', color: stats.porcentajeMorosidad > 20 ? '#dc2626' : '#ea580c' }}>
                                {stats.porcentajeMorosidad}%
                            </span>
                        </div>
                        <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '10px' }}>
                            <AlertOctagon size={28} color="#dc2626" />
                        </div>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Cuotas vencidas impagas</p>
                </div>

                {/* TARJETA 3: ACTIVIDAD TOP (Azul) */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 style={cardTitleStyle}>Actividad Top</h3>
                            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb', display: 'block', marginTop: '5px' }}>
                                {stats.actividadMasPopular?.nombre || 'N/A'}
                            </span>
                        </div>
                        <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '10px' }}>
                            <Trophy size={28} color="#2563eb" />
                        </div>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                        {stats.actividadMasPopular?.cantidad || 0} inscripciones activas
                    </p>
                </div>

                {/* TARJETA 4: SOCIOS (Gris) */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 style={cardTitleStyle}>Total Inscripciones</h3>
                            <span style={{ fontSize: '2rem', fontWeight: '800', color: '#475569' }}>
                                {stats.totalSociosActivos}
                            </span>
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px' }}>
                            <Users size={28} color="#475569" />
                        </div>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Socios cursando actividades</p>
                </div>
            </div>
        </div>
    );
}

const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9'
};

const cardTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '0.5px'
};