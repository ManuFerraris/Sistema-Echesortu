import { useState } from 'react';
import { api } from '../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../api/routes';
import { Search, UserCheck, CreditCard, X, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ApiResponse, EstadoCuenta, CuotaResumen, ComprobantePago } from '../types';
import { ModalInscripcion } from '../api/components/modalInscripcion';

function CajaPage() {
    const [idBusqueda, setIdBusqueda] = useState('');
    const [datos, setDatos] = useState<EstadoCuenta | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostrarInscripcion, setMostrarInscripcion] = useState(false);
    
    // FILTROS
    const [soloDeudas, setSoloDeudas] = useState(false);

    // ESTADOS PARA EL PAGO
    const [cuotaAPagar, setCuotaAPagar] = useState<CuotaResumen | null>(null);
    const [montoPagar, setMontoPagar] = useState<string>('');
    const [medioPago, setMedioPago] = useState('efectivo');
    const [observacion, setObservacion] = useState('');
    const [procesandoPago, setProcesandoPago] = useState(false);

    const buscarSocio = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!idBusqueda) return;

        setLoading(true);
        setError('');
        setDatos(null);

        try {
            const res = await api.get<ApiResponse<EstadoCuenta>>(API_ROUTES.personas.estadoCuenta(idBusqueda));

            if (res.data.success) {
            setDatos(res.data.data);
            } else {
            setError(res.data.messages[0] || 'Error al buscar socio');
            }

        } catch (error) {
            console.error(error);
            const err = error as AxiosError<ApiResponse<null>>;
            const msg = err.response?.data?.messages?.[0] || 'Socio no encontrado o error de conexión';
            console.log("Error detallado:", err.response);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const abrirModalPago = (cuota: CuotaResumen) => {
        setCuotaAPagar(cuota);
        setMontoPagar(cuota.saldoPendiente.toString());
        setMedioPago('efectivo');
        setObservacion('');
    };

    const confirmarPago = async () => {
        if (!cuotaAPagar) return;
        setProcesandoPago(true);
        try {
            const payload = {
                cuotaId: cuotaAPagar.id,
                monto: Number(montoPagar),
                medioPago: medioPago,
                observacion: observacion || 'Pago Web'
            };

            const res = await api.post<ApiResponse<ComprobantePago>>(API_ROUTES.pagos.create, payload);

            if (res.data.success) {
                alert(`¡Pago registrado! Ticket #${res.data.data.ticketId} 💸`); // Podemos usar los datos tipados
                setCuotaAPagar(null);
                await buscarSocio(); 
            } else {
                alert("Error: " + res.data.messages.join(", "));
            }
        } catch (error) { 
            const err = error as AxiosError<ApiResponse<null>>;
            const msg = err.response?.data?.messages?.join(", ") || "Error al procesar el pago";
            alert(msg);
        } finally {
            setProcesandoPago(false);
        }
    };

    return (
        <div style={{ 
            padding: '2rem', 
            width: '100%',
            maxWidth: '1600px',
            margin: '0 auto',
            boxSizing: 'border-box'
        }}>
        <h1>🏊‍♂️ Gestión de Caja</h1>
        
        {/* BUSCADOR */}
        <form onSubmit={buscarSocio} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            <input 
            type="number"
            placeholder="Ingrese Nro de Socio (ej: 1)" 
            value={idBusqueda}
            onChange={(e) => setIdBusqueda(e.target.value)}
            style={{ padding: '12px', flex: 1, fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
            <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '10px 25px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', background: '#0f172a', color: 'white', border: 'none', borderRadius: '5px' }}
            >
            {loading ? '...' : <><Search size={18} /> Buscar</>}
            </button>
        </form>

        {error && (
            <div style={{ padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} /> {error}
            </div>
        )}

        {/* RESULTADOS */}
        {datos && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', background: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '50%' }}>
                    <UserCheck size={40} color="#2563eb" />
                </div>
                <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{datos.cliente.nombre} {datos.cliente.apellido}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>DNI: {datos.cliente.dni}</p>
                {/* NUEVO BOTÓN */}
                <button 
                    onClick={() => setMostrarInscripcion(true)}
                    style={{ 
                        background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', 
                        padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' 
                    }}
                >
                    + Agregar Actividad
                </button>
                </div>
                {mostrarInscripcion && datos && (
                    <ModalInscripcion 
                        idPersona={Number(idBusqueda)} 
                        nombrePersona={`${datos.cliente.nombre} ${datos.cliente.apellido}`}
                        onClose={() => setMostrarInscripcion(false)}
                        onSuccess={() => buscarSocio()} // Recarga la caja para ver la nueva deuda
                    />
                )}
            </div>

            {/* TARJETAS DE SALDO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '25px' }}>
                <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '10px', color: '#991b1b', border: '1px solid #fecaca' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Deuda Total</h3>
                <p style={{ fontSize: '32px', fontWeight: '800', margin: '10px 0' }}>
                    ${datos.resumenFinanciero.totalDeudaClub}
                </p>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', color: '#166534', border: '1px solid #bbf7d0' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pagado Histórico</h3>
                <p style={{ fontSize: '32px', fontWeight: '800', margin: '10px 0' }}>
                    ${datos.resumenFinanciero.totalPagadoHistorico}
                </p>
                </div>
            </div>

            {/* FILTRO VISUAL */}
            <div style={{ marginTop: '30px', marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={soloDeudas} onChange={e => setSoloDeudas(e.target.checked)} />
                    <span style={{ fontSize: '0.9rem' }}>Ocultar cuotas saldadas</span>
                </label>
            </div>

            {/* LISTA DE ACTIVIDADES */}
            {datos.detalle.map((act, i) => (
                <div key={i} style={{ marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '5px', borderLeft: '4px solid #3b82f6', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#334155' }}>{act.actividad}</strong>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {act.cuotasPendientes.map((c, j) => {
                    const esSaldoAFavor = c.saldoPendiente < 0;
                    const estaSaldada = c.saldoPendiente <= 0;
                    
                    // APLICAR FILTRO
                    if (soloDeudas && estaSaldada) return null;

                    return (
                        <li key={j} style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '15px', borderBottom: '1px solid #f1f5f9',
                            backgroundColor: esSaldoAFavor ? '#f0fdf4' : 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {estaSaldada ? <CheckCircle size={20} color="#22c55e" /> : <AlertTriangle size={20} color="#ef4444" />}
                                <div>
                                    <span style={{ display: 'block', fontWeight: 'bold' }}>Cuota {c.mes}/{c.anio}</span>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Original: ${c.monto}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                {esSaldoAFavor ? (
                                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>A Favor: ${Math.abs(c.saldoPendiente)}</span>
                                ) : (
                                    <span style={{ color: c.saldoPendiente > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {c.saldoPendiente > 0 ? `Debe: $${c.saldoPendiente}` : '¡Pagada!'}
                                    </span>
                                )}

                                {!estaSaldada && (
                                    <button 
                                    onClick={() => abrirModalPago(c)}
                                    style={{ 
                                        background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', 
                                        borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                        fontWeight: '500', boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                                    }}
                                    >
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
        )}

        {/* --- MODAL DE PAGO --- */}
        {cuotaAPagar && (
            <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }} onClick={() => setCuotaAPagar(null)}>
                
            <div style={{ background: 'white', padding: '0', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} onClick={e => e.stopPropagation()}>
                
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Cobrar Cuota {cuotaAPagar.mes}/{cuotaAPagar.anio}</h2>
                    <button onClick={() => setCuotaAPagar(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                <div style={{ padding: '25px' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Monto a Pagar ($)</label>
                        <input 
                            type="number" 
                            value={montoPagar} 
                            onChange={e => setMontoPagar(e.target.value)}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            autoFocus
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Medio de Pago</label>
                        <select 
                            value={medioPago} 
                            onChange={e => setMedioPago(e.target.value)}
                            style={{ width: '100%', padding: '12px', fontSize: '18px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="efectivo">💵 Efectivo</option>
                            <option value="transferencia">🏦 Transferencia Bancaria</option>
                            <option value="debito">💳 Tarjeta Débito</option>
                            <option value="credito">💳 Tarjeta Crédito</option>
                            <option value="mercadopago">📲 Mercado Pago</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Observaciones (Opcional)</label>
                        <input 
                            type="text" 
                            value={observacion} 
                            onChange={e => setObservacion(e.target.value)}
                            placeholder="Ej: Pago parcial, trajo cambio..."
                            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <button 
                    onClick={confirmarPago} 
                    disabled={procesandoPago}
                    style={{ 
                        width: '100%', padding: '16px', background: '#16a34a', color: 'white', 
                        border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                        opacity: procesandoPago ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                    >
                    {procesandoPago ? 'Procesando...' : <><CheckCircle size={20} /> Confirmar Pago</>}
                    </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}

export default CajaPage;