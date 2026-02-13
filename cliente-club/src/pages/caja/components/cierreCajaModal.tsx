import { useEffect, useState } from 'react';
import { api } from '../../../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../../../api/routes';
import { X, Lock } from 'lucide-react';
import type { ResumenCaja } from '../../../types/index';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export function CierreCajaModal({ onClose, onSuccess }: Props) {
    const [resumen, setResumen] = useState<ResumenCaja | null>(null);
    const [montoFisico, setMontoFisico] = useState('');
    const [obs, setObs] = useState('');
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        api.get(API_ROUTES.caja.resumen)
            .then(res => setResumen(res.data.data))
            .catch(err => {
                const error = err as AxiosError<{ messages: string[] }>;
                alert(error.response?.data?.messages?.[0] || 'Error al cargar resumen');
            })
            .finally(() => setLoading(false));
            
    }, []);

    const handleCerrar = async () => {
        if (!montoFisico) return alert('Debés ingresar el recuento físico');
        if (!confirm('¿Seguro que querés cerrar la caja?')) return;

        setProcesando(true);
        try {
            const res = await api.post(API_ROUTES.caja.cerrar, {
                montoFisicoRecuento: Number(montoFisico),
                observaciones: obs
            });
            alert(res.data.messages[0]); // Mensaje del back (si hubo faltante/sobrante)
            onSuccess();
        } catch (error) {
            const err = error as AxiosError<{ messages: string[] }>;
            alert(err.response?.data?.messages?.[0] || 'Error al cerrar');
        } finally {
            setProcesando(false);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Cargando datos...</div>;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '95%', overflow: 'hidden' }}>
                <div style={{ padding: '20px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={20}/> Cerrar Caja</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Resumen Informativo */}
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Totales del Sistema</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                            <div>Efectivo: <strong>${resumen?.totalEfectivo}</strong></div>
                            <div>Transferencias: <strong>${resumen?.totalTransferencia}</strong></div>
                            <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #cbd5e1', paddingTop: '5px', marginTop: '5px' }}>
                                Total Teórico (con saldo inicial): <strong>${resumen?.saldoSistema}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Recuento Físico (Billetes en mano)</label>
                        <input 
                            type="number" 
                            value={montoFisico} 
                            onChange={e => setMontoFisico(e.target.value)} 
                            placeholder="¿Cuánto hay realmente?"
                            style={{ width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '6px', border: '2px solid #991b1b', boxSizing: 'border-box' }}
                        />
                        <small style={{ color: '#64748b' }}>Si el monto no coincide con el teórico, se registrará como faltante/sobrante.</small>
                    </div>

                    <input 
                        type="text" 
                        placeholder="Observaciones finales..." 
                        value={obs} 
                        onChange={e => setObs(e.target.value)} 
                        style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />

                    <button 
                        onClick={handleCerrar} 
                        disabled={procesando}
                        style={{ width: '100%', padding: '15px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {procesando ? 'Cerrando...' : 'CONFIRMAR CIERRE'}
                    </button>
                </div>
            </div>
        </div>
    );
}