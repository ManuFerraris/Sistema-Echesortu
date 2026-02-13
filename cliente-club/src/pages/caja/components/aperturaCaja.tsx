import { useState } from 'react';
import { api } from '../../../api/axios';
import { Unlock, DollarSign } from 'lucide-react';
import { API_ROUTES } from '../../../api/routes';
import { AxiosError } from 'axios';

interface Props {
    onCajaAbierta: () => void;
}

export function AperturaCaja({ onCajaAbierta }: Props) {
    const [monto, setMonto] = useState('');
    const [obs, setObs] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('¿Confirmás la apertura de caja?')) return;
        
        setLoading(true);
        try {
            await api.post(API_ROUTES.caja.abrir, {
                montoInicial: Number(monto),
                observaciones: obs
            });
            alert('¡Caja abierta exitosamente!');
            onCajaAbierta();
        } catch (error) {
            const err = error as AxiosError<{ messages: string[] }>;
            alert(err.response?.data?.messages?.[0] || 'Error al abrir caja');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                        <Unlock size={30} color="#166534" />
                    </div>
                    <h1 style={{ margin: 0, color: '#1e293b' }}>Apertura de Caja</h1>
                    <p style={{ color: '#64748b' }}>Ingresá el saldo inicial para comenzar a operar.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Saldo Inicial (Cambio)</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input 
                                type="number" 
                                value={monto} 
                                onChange={e => setMonto(e.target.value)} 
                                placeholder="0.00"
                                required
                                style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1.1rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>Observaciones</label>
                        <input 
                            type="text" 
                            value={obs} 
                            onChange={e => setObs(e.target.value)} 
                            placeholder="Ej: Turno mañana - Admin"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '15px', background: '#166534', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {loading ? 'Abriendo...' : 'ABRIR CAJA'}
                    </button>
                </form>
            </div>
        </div>
    );
}