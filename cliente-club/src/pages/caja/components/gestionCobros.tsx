import { useState } from 'react';
import { api } from '../../../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../../../api/routes';
import { Search, AlertTriangle } from 'lucide-react';
import type { ApiResponse, EstadoCuenta, CuotaResumen, Persona } from '../../../types';

// Componentes extraídos
import { ModalInscripcion } from '../../../api/components/modalInscripcion';
import { ModalSeleccionSocio } from '../../../api/components/modalSeleccionSocio';
import { ResumenSocio } from '../components/resumenSocio';
import { ListaDeudas } from '../components/listaDeudas';
import { ModalCobro } from '../components/modalCobro';

export function GestionCobros() {
    // Estado de Búsqueda
    const [idBusqueda, setIdBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estado de Datos
    const [datos, setDatos] = useState<EstadoCuenta | null>(null);
    const [resultadosBusqueda, setResultadosBusqueda] = useState<Persona[]>([]);
    
    // Modales
    const [mostrarModalSeleccion, setMostrarModalSeleccion] = useState(false);
    const [mostrarInscripcion, setMostrarInscripcion] = useState(false);
    const [cuotaAPagar, setCuotaAPagar] = useState<CuotaResumen | null>(null);

    // --- LÓGICA DE BÚSQUEDA ---
    const buscarSocio = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!idBusqueda) return;

        setLoading(true); setError(''); setDatos(null);
        
        try {
            const esNumero = !isNaN(Number(idBusqueda));
            
            if (esNumero) {
                // Búsqueda Directa
                const res = await api.get(API_ROUTES.personas.estadoCuenta(Number(idBusqueda)));
                setDatos(res.data.data);
            } else {
                // Búsqueda por Texto
                const res = await api.get(API_ROUTES.personas.search(idBusqueda));
                const encontrados = res.data.data;

                if (encontrados.length === 0) alert('No se encontraron socios.');
                else if (encontrados.length === 1) {
                    const unico = encontrados[0];
                    setIdBusqueda(String(unico.nro || unico.id));
                    const cuentaRes = await api.get(API_ROUTES.personas.estadoCuenta(unico.nro || unico.id));
                    setDatos(cuentaRes.data.data);
                } else {
                    setResultadosBusqueda(encontrados);
                    setMostrarModalSeleccion(true);
                }
            }
        } catch (error) {
            const err = error as AxiosError<ApiResponse<null>>;
            setError(err.response?.data?.messages?.[0] || 'Error al buscar socio');
        } finally {
            setLoading(false);
        }
    };

    const handleSeleccionarSocio = (socio: Persona) => {
        if (!socio.nro) {
            alert("Socio seleccionado no tiene ID válido");
            return;
        };
        setMostrarModalSeleccion(false);
        setIdBusqueda(String(socio.nro));
        setLoading(true);
        api.get(API_ROUTES.personas.estadoCuenta(socio.nro))
            .then(res => setDatos(res.data.data))
            .catch(() => setError('Error al cargar socio'))
            .finally(() => setLoading(false));
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
            <h1>🏊‍♂️ Gestión de Caja</h1>

            {/* BUSCADOR */}
            <form onSubmit={buscarSocio} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <input 
                    type="text" 
                    placeholder="Ingrese ID, Nombre o Apellido..." 
                    value={idBusqueda} 
                    onChange={e => setIdBusqueda(e.target.value)} 
                    style={{ padding: '12px', flex: 1, border: '1px solid #ccc', borderRadius: '5px' }}
                />
                <button type="submit" disabled={loading} style={{ padding: '10px 25px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    {loading ? '...' : <><Search size={18} /> Buscar</>}
                </button>
            </form>

            {error && (
                <div style={{ padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <AlertTriangle size={20} /> {error}
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            {datos && (
                <>
                    <ResumenSocio 
                        datos={datos} 
                        onNuevaInscripcion={() => setMostrarInscripcion(true)} 
                    />

                    <ListaDeudas 
                        datos={datos} 
                        onCobrar={(cuota) => setCuotaAPagar(cuota)} 
                    />
                </>
            )}

            {/* MODALES */}
            {mostrarInscripcion && datos && (
                <ModalInscripcion 
                    idPersona={Number(idBusqueda)} 
                    nombrePersona={`${datos.cliente.nombre} ${datos.cliente.apellido}`}
                    onClose={() => setMostrarInscripcion(false)}
                    onSuccess={() => buscarSocio()}
                />
            )}

            {cuotaAPagar && (
                <ModalCobro 
                    cuota={cuotaAPagar} 
                    onClose={() => setCuotaAPagar(null)} 
                    onSuccess={() => {
                        setCuotaAPagar(null);
                        buscarSocio(); // Recargar datos tras pago exitoso
                    }} 
                />
            )}

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