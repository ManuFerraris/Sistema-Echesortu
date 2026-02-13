import { useState } from 'react';
import { api } from '../../../api/axios';
import { API_ROUTES } from '../../../api/routes';
import { X } from 'lucide-react';
import type { ApiResponse, CuotaResumen } from '../../../types/index';
import { AxiosError } from 'axios';

interface Props {
    cuota: CuotaResumen;
    onClose: () => void;
    onSuccess: () => void;
}

interface PagoParcial {
    id: string;
    monto: number;
    metodo: string;
}

export function ModalCobro({ cuota, onClose, onSuccess }: Props) {
    const [pagosList, setPagosList] = useState<PagoParcial[]>([]);
    const [montoInput, setMontoInput] = useState<string>(cuota.saldoPendiente.toString());
    const [medioInput, setMedioInput] = useState('efectivo');
    const [observacion, setObservacion] = useState('');
    const [procesando, setProcesando] = useState(false);

    const totalSumado = pagosList.reduce((acc, p) => acc + p.monto, 0);
    const saldoRestante = cuota.saldoPendiente - totalSumado;

    const agregarPago = () => {
        const valor = Number(montoInput);
        if (!valor || valor <= 0) return alert("Monto inválido");
        
        if (valor > saldoRestante && saldoRestante > 0) {
            if(!confirm(`Estás pagando $${valor} pero solo restan $${saldoRestante}. ¿Generar saldo a favor?`)) return;
        }

        setPagosList([...pagosList, { id: Date.now().toString(), monto: valor, metodo: medioInput }]);
        const nuevoRestante = saldoRestante - valor;
        setMontoInput(nuevoRestante > 0 ? nuevoRestante.toString() : '');
    };

    const confirmarPago = async () => {
        setProcesando(true);
        try {
            const payload = {
                cuotaId: cuota.id,
                pagos: pagosList.map(p => ({
                    monto: p.monto,
                    medioPago: p.metodo.toUpperCase(),
                    observacion
                }))
            };

            const res = await api.post(API_ROUTES.pagos.create, payload, {
                responseType: 'blob',
                validateStatus: (s) => s < 500
            });

            const isPdf = res.headers['content-type']?.includes('application/pdf');

            if (isPdf) {
                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                window.open(url, '_blank');
                alert('¡Pago registrado!');
                onSuccess();
            } else {
                const textData = await res.data.text();
                const errorJson = JSON.parse(textData);
                alert("Error: " + (errorJson.messages?.join(", ") || "Error desconocido"));
            }
        } catch (error) { 
            const err = error as AxiosError<ApiResponse<null>>;
            const msg = err.response?.data?.messages?.join(", ") || "Error al procesar el pago";
            alert(msg);
        } finally {
            setProcesando  (false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '95%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Cobrar Cuota {cuota.mes}/{cuota.anio}</h2>
                        <p style={{ margin: '5px 0 0', color: '#64748b' }}>Deuda Original: <strong>${cuota.saldoPendiente}</strong></p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Lista Pagos */}
                    <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px', marginBottom: '20px' }}>
                        {pagosList.length === 0 ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>Agregá un método de pago</p> : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {pagosList.map(p => (
                                    <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span><strong>${p.monto}</strong> ({p.metodo})</span>
                                        <button onClick={() => setPagosList(pagosList.filter(x => x.id !== p.id))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}><X size={16}/></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '10px', paddingTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total a Pagar:</span>
                            <strong style={{ color: saldoRestante < 0 ? 'green' : 'black' }}>${totalSumado}</strong>
                        </div>
                    </div>

                    {/* Formulario Agregar */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label>Monto</label>
                            <input type="number" value={montoInput} onChange={e => setMontoInput(e.target.value)} style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Medio</label>
                            <select value={medioInput} onChange={e => setMedioInput(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                                <option value="debito">Débito</option>
                                <option value="mercadopago">MercadoPago</option>
                            </select>
                        </div>
                        <button onClick={agregarPago} style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>+</button>
                    </div>

                    <input type="text" placeholder="Observaciones (Opcional)" value={observacion} onChange={e => setObservacion(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box' }} />

                    <button onClick={confirmarPago} disabled={procesando || pagosList.length === 0} style={{ width: '100%', padding: '15px', background: pagosList.length > 0 ? '#16a34a' : '#ccc', color: 'white', border: 'none', borderRadius: '8px', cursor: pagosList.length > 0 ? 'pointer' : 'not-allowed' }}>
                        {procesando ? 'Procesando...' : 'Confirmar e Imprimir'}
                    </button>
                </div>
            </div>
        </div>
    );
}