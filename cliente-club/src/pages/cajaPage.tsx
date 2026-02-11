import { useState } from 'react';
import { api } from '../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../api/routes';
import { Search, UserCheck, CreditCard, X, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ApiResponse, EstadoCuenta, CuotaResumen, Persona } from '../types';
import { ModalInscripcion } from '../api/components/modalInscripcion';
import { ModalSeleccionSocio } from '../api/components/modalSeleccionSocio';

interface PagoParcial {
    id: string;
    monto: number;
    metodo: string;
}

function CajaPage() {
    const [idBusqueda, setIdBusqueda] = useState('');
    const [datos, setDatos] = useState<EstadoCuenta | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostrarInscripcion, setMostrarInscripcion] = useState(false);
    const [resultadosBusqueda, setResultadosBusqueda] = useState<Persona[]>([]);
    const [mostrarModalSeleccion, setMostrarModalSeleccion] = useState(false);
    
    // FILTROS
    const [soloDeudas, setSoloDeudas] = useState(false);

    // ESTADOS PARA EL PAGO
    const [cuotaAPagar, setCuotaAPagar] = useState<CuotaResumen | null>(null);
    const [observacion, setObservacion] = useState('');
    const [procesandoPago, setProcesandoPago] = useState(false);

    // NUEVOS ESTADOS PARA LA LISTA
    const [pagosList, setPagosList] = useState<PagoParcial[]>([]);
    const [montoInput, setMontoInput] = useState<string>(''); // Para el input temporal
    const [medioInput, setMedioInput] = useState('efectivo'); // Para el select temporal


    const totalSumado = pagosList.reduce((acc, p) => acc + p.monto, 0);
    const saldoRestante = cuotaAPagar ? cuotaAPagar.saldoPendiente - totalSumado : 0;

    const buscarSocio = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!idBusqueda) return;

        setLoading(true);
        setError('');
        setDatos(null);
        setResultadosBusqueda([]);
        setMostrarModalSeleccion(false);

        const esNumero = !isNaN(Number(idBusqueda));

        try {
            if (esNumero) {
            // Lógica antigua: Búsqueda directa por ID para obtener Cuenta Corriente
            const res = await api.get(API_ROUTES.personas.estadoCuenta(Number(idBusqueda)));
            if (res.data.success) {
                setDatos(res.data.data);
            }
            } else {
                // Lógica nueva: Búsqueda por Texto
                const res = await api.get(API_ROUTES.personas.search(idBusqueda));
                
                if (res.data.success) {
                    const encontrados = res.data.data;

                    if (encontrados.length === 0) {
                        alert('No se encontraron socios con ese nombre.');
                    } else if (encontrados.length === 1) {
                        // Si solo hay uno, cargamos su cuenta corriente directo
                        const unico = encontrados[0];
                        // Truco UX: Actualizamos el input con el ID real
                        setIdBusqueda(unico.nro || unico.id);
                        const cuentaRes = await api.get(API_ROUTES.personas.estadoCuenta(unico.nro || unico.id));
                        setDatos(cuentaRes.data.data);
                    } else {
                        setResultadosBusqueda(encontrados);
                        setMostrarModalSeleccion(true);
                    }
                }
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

    // Función callback cuando eligen alguien del modal
    const handleSeleccionarSocio = (socio: Persona) => {
        setMostrarModalSeleccion(false);
        setIdBusqueda(String(socio.nro));
        
        // Disparamos la búsqueda de cuenta corriente manualmente
        setLoading(true);
        if (!socio.nro) {
            alert('Error: El socio seleccionado no tiene un número de socio válido.');
            setLoading(false);
            return;
        };
        api.get(API_ROUTES.personas.estadoCuenta(socio.nro))
        .then(res => {
            if(res.data.success) setDatos(res.data.data);
        })
        .catch(() => {
            alert('Error al cargar la cuenta corriente del socio seleccionado.');
        })
        .finally(() => setLoading(false));
    };

    const abrirModalPago = (cuota: CuotaResumen) => {
        setCuotaAPagar(cuota);
        setObservacion('');
        
        // Reseteamos la lista de pagos
        setPagosList([]);
        
        // Sugerimos pagar el total pendiente en el input inicial
        setMontoInput(cuota.saldoPendiente.toString());
        setMedioInput('efectivo');
    };

    const agregarPagoALista = () => {
        const valor = Number(montoInput);
        
        // Validaciones simples
        if (!valor || valor <= 0) return alert("Ingrese un monto válido");
        if (valor > saldoRestante && saldoRestante > 0) {
            if(!confirm(`Estás pagando $${valor} pero solo restan $${saldoRestante}. ¿Deseas continuar generando saldo a favor?`)) return;
        }

        const nuevoPago: PagoParcial = {
            id: Date.now().toString(), // ID temporal
            monto: valor,
            metodo: medioInput
        };

        setPagosList([...pagosList, nuevoPago]);

        // Calcular cuánto falta para sugerir en el input del siguiente pago
        const nuevoRestante = saldoRestante - valor;
        setMontoInput(nuevoRestante > 0 ? nuevoRestante.toString() : '');
    };

    const quitarPagoDeLista = (id: string) => {
        setPagosList(pagosList.filter(p => p.id !== id));
    };

    const confirmarPago = async () => {
        if (!cuotaAPagar || pagosList.length === 0) return;
        
        setProcesandoPago(true);
        
        try {
            // Armamos el payload con la estructura nueva
            const payload = {
                cuotaId: cuotaAPagar.id,
                // Mapeamos nuestra lista local al formato del DTO del backend
                pagos: pagosList.map(p => ({
                    monto: p.monto,
                    medioPago: p.metodo.toUpperCase(), // Asegurar que coincida con el ENUM del back
                    observacion: observacion // Observación general o por ítem, como prefieras
                }))
            };

            // NOTA: Usamos fetch nativo o configuramos axios para responseType: 'blob'
            // Si usás tu instancia 'api' de axios, tenés que asegurarte que no intente parsear JSON automáticamente
            // Para simplificar, acá uso fetch, pero con axios es parecido:
            
            /* Con AXIOS (Recomendado si ya tenés interceptores de auth) */
            const res = await api.post(API_ROUTES.pagos.create, payload, {
                responseType: 'blob', // CLAVE: Decirle a Axios que esperamos un archivo
                validateStatus: (status) => status < 500 // Para poder leer el JSON de error 400
            });

            // Verificamos el tipo de contenido
            const isPdf = res.headers['content-type']?.includes('application/pdf');

            if (isPdf) {
                // ÉXITO: Descargar/Abrir PDF
                const blob = new Blob([res.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank'); // Abrir en nueva pestaña para imprimir

                // Limpieza
                alert('¡Pago registrado correctamente!');
                setCuotaAPagar(null);
                setPagosList([]);
                await buscarSocio(); // Refrescar estado de cuenta
            } else {
                // ERROR: Intentar leer el JSON del blob (caso raro con responseType blob)
                // Si axios detecta JSON a veces lo parsea solo, pero con blob forzado hay que convertirlo
                const textData = await res.data.text(); 
                const errorJson = JSON.parse(textData);
                alert("Error: " + (errorJson.messages?.join(", ") || "Error desconocido"));
            }
        }catch (error) { 
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
            type="text"
            placeholder="Ingrese Id, Nombre o Apellido..." 
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

        {/* --- MODAL DE PAGO (NUEVO DISEÑO MULTI-PAGO) --- */}
        {cuotaAPagar && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }} onClick={() => setCuotaAPagar(null)}>
                
                <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '95%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                    
                    {/* CABECERA */}
                    <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Cobrar Cuota {cuotaAPagar.mes}/{cuotaAPagar.anio}</h2>
                            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                Deuda Original: <strong>${cuotaAPagar.saldoPendiente}</strong>
                            </p>
                        </div>
                        <button onClick={() => setCuotaAPagar(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                    </div>

                    <div style={{ padding: '20px' }}>
                        
                        {/* 1. LISTA DE PAGOS AGREGADOS */}
                        <div style={{ marginBottom: '20px', minHeight: '60px', background: '#f1f5f9', borderRadius: '8px', padding: '10px' }}>
                            {pagosList.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', margin: '10px 0' }}>No hay pagos agregados aún.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {pagosList.map(p => (
                                        <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', marginBottom: '5px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                            <span style={{ fontSize: '0.9rem' }}>
                                                <strong>${p.monto}</strong> <span style={{ color: '#64748b' }}>({p.metodo})</span>
                                            </span>
                                            <button onClick={() => quitarPagoDeLista(p.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16}/></button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* TOTALIZADOR */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '0.95rem' }}>
                                <span>Total a Pagar:</span>
                                <span style={{ fontWeight: 'bold', color: saldoRestante < 0 ? '#16a34a' : '#1e293b' }}>
                                    ${totalSumado} 
                                    {saldoRestante > 0 && <span style={{ color: '#ef4444', marginLeft: '5px', fontSize: '0.8rem' }}>(Faltan ${saldoRestante})</span>}
                                </span>
                            </div>
                        </div>

                        {/* 2. FORMULARIO PARA AGREGAR PAGO */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Monto</label>
                                <input 
                                    type="number" 
                                    value={montoInput} 
                                    onChange={e => setMontoInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && agregarPagoALista()}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Medio</label>
                                <select 
                                    value={medioInput} 
                                    onChange={e => setMedioInput(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="debito">Débito</option>
                                    <option value="credito">Crédito</option>
                                    <option value="mercadopago">MercadoPago</option>
                                </select>
                            </div>
                            <button 
                                onClick={agregarPagoALista}
                                style={{ padding: '10px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                +
                            </button>
                        </div>

                        {/* OBSERVACIONES */}
                        <div style={{ marginBottom: '20px' }}>
                            <input 
                                type="text" 
                                value={observacion} 
                                onChange={e => setObservacion(e.target.value)}
                                placeholder="Observaciones generales (opcional)"
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }}
                            />
                        </div>

                        {/* BOTÓN CONFIRMAR */}
                        <button 
                            onClick={confirmarPago} 
                            disabled={procesandoPago || pagosList.length === 0} // Deshabilitado si lista vacía
                            style={{ 
                                width: '100%', padding: '16px', 
                                background: pagosList.length === 0 ? '#cbd5e1' : '#16a34a', 
                                color: 'white', border: 'none', borderRadius: '8px', 
                                fontSize: '16px', fontWeight: 'bold', cursor: pagosList.length === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                                transition: 'background 0.2s'
                            }}
                        >
                            {procesandoPago ? 'Procesando...' : <><CheckCircle size={20} /> Confirmar e Imprimir</>}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL DE DESAMBIGUACIÓN */}
        {mostrarModalSeleccion && (
            <ModalSeleccionSocio 
                resultados={resultadosBusqueda}
                onClose={() => setMostrarModalSeleccion(false)}
                onSelect={handleSeleccionarSocio}
            />
        )}
        </div>
    );
}

export default CajaPage;