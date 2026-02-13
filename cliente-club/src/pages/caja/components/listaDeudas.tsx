import { useState } from 'react';
import type { EstadoCuenta, CuotaResumen } from '../../../types';
import { CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';

interface Props {
    datos: EstadoCuenta;
    onCobrar: (cuota: CuotaResumen) => void;
}

export function ListaDeudas({ datos, onCobrar }: Props) {
    const [soloDeudas, setSoloDeudas] = useState(false);

    return (
        <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <label style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={soloDeudas} onChange={e => setSoloDeudas(e.target.checked)} />
                    <span>Ocultar pagadas</span>
                </label>
            </div>

            {datos.detalle.map((act, i) => (
                <div key={i} style={{ marginBottom: '2rem' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '5px', borderLeft: '4px solid #3b82f6', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '1.1rem', color: '#334155' }}>{act.actividad}</strong>
                    </div>
                    
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {act.cuotasPendientes.map((c, j) => {
                            const estaSaldada = c.saldoPendiente <= 0;
                            if (soloDeudas && estaSaldada) return null;

                            return (
                                <li key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #f1f5f9', background: c.saldoPendiente < 0 ? '#f0fdf4' : 'white' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        {estaSaldada ? <CheckCircle color="#22c55e" /> : <AlertTriangle color="#ef4444" />}
                                        <div>
                                            <span style={{ display: 'block', fontWeight: 'bold' }}>Cuota {c.mes}/{c.anio}</span>
                                            <span style={{ color: '#64748b' }}>Original: ${c.monto}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <strong style={{ color: c.saldoPendiente > 0 ? '#dc2626' : '#16a34a' }}>
                                            {c.saldoPendiente > 0 ? `Debe: $${c.saldoPendiente}` : '¡Pagada!'}
                                        </strong>
                                        {!estaSaldada && (
                                            <button onClick={() => onCobrar(c)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px' }}>
                                                <CreditCard size={16} /> Cobrar
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}