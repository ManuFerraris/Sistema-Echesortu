import { useEffect, useState } from 'react';
import { api } from '../../../api/axios';
import { API_ROUTES } from '../../../api/routes';
import type { ResumenCaja } from '../../../types';
import { RefreshCw, TrendingUp, Wallet, CreditCard } from 'lucide-react';

interface Props {
    triggerUpdate?: number; 
};

export function ResumenSesion({ triggerUpdate }: Props) {
    const [resumen, setResumen] = useState<ResumenCaja | null>(null);
    const [loading, setLoading] = useState(false);

    const cargarResumen = async () => {
        setLoading(true);
        try {
            const res = await api.get(API_ROUTES.caja.resumen);
            setResumen(res.data.data);
        } catch (error) {
            console.error("Error cargando resumen rápido", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarResumen();
    }, [triggerUpdate]);

    if (!resumen) return null;

    return (
        <div style={{ 
            background: 'linear-gradient(to right, #1e293b, #334155)', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '30px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                    <TrendingUp size={20} color="#38bdf8" /> 
                    Estado de la Sesión
                </h3>
                <button 
                    onClick={cargarResumen} 
                    disabled={loading}
                    style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        border: 'none', 
                        color: 'white', 
                        padding: '8px', 
                        borderRadius: '50%', 
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Actualizar montos"
                >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                
                {/* CAJA EFECTIVO */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', marginBottom: '5px', fontSize: '0.9rem' }}>
                        <Wallet size={16} /> En Caja (Efectivo)
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ${(resumen.saldoInicial + resumen.totalEfectivo).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Inicial: ${resumen.saldoInicial} + Cobrado: ${resumen.totalEfectivo}
                    </div>
                </div>

                {/* DIGITAL / BANCOS */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', marginBottom: '5px', fontSize: '0.9rem' }}>
                        <CreditCard size={16} /> Digital / Bancos
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        ${resumen.totalTransferencia.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Transf + MP + Tarjetas
                    </div>
                </div>

                {/* TOTAL GENERAL */}
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ color: '#cbd5e1', marginBottom: '5px', fontSize: '0.9rem' }}>
                        Recaudación Total
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>
                        ${(resumen.totalEfectivo + resumen.totalTransferencia).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {resumen.cantidadTickets} movimientos hoy
                    </div>
                </div>

            </div>
            
            {/* Estilo para la animación de carga */}
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}