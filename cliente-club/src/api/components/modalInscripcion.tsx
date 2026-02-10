import { useState, useEffect } from 'react';
import { X, CheckCircle, Dumbbell, AlertTriangle } from 'lucide-react';
import { api } from '../axios.ts';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../routes.ts';
import type { Actividad, ApiResponse } from '../../types/index';

interface Props {
  idPersona: number;
  nombrePersona: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalInscripcion({ idPersona, nombrePersona, onClose, onSuccess }: Props) {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [selectedActividad, setSelectedActividad] = useState<string>('');
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string>(''); // <--- Nuevo estado para el error

  // Cargar Actividades al abrir
  useEffect(() => {
    const fetchActividades = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<Actividad[]>>(API_ROUTES.actividades.list);
        if (res.data.success) {
          setActividades(res.data.data);
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
    fetchActividades();
  }, []);

  // Enviar Inscripción
  const handleInscribir = async () => {
    if (!selectedActividad) return;
    
    setProcesando(true);
    setError(''); // Limpiamos errores previos

    try {
      // Enviamos el ID de persona y el ID de actividad (convertido a número)
      await api.post(API_ROUTES.inscripciones.create, {
        idPersona: idPersona,
        idActividad: Number(selectedActividad)
      });
      
      // Si pasa el await, es que fue éxito (201 Created)
      alert('¡Inscripción exitosa! Se generó la primera cuota.');
      onSuccess(); // Recargar la Caja para ver la deuda nueva
      onClose();   // Cerrar modal
      
    } catch (err) {
      const errorAxios = err as AxiosError<ApiResponse<null>>;
      
      // Intentamos leer el mensaje que manda el Backend (InscribirSocio.ts)
      // El backend manda: { success: false, messages: ["El socio ya está inscripto..."] }
      const msg = errorAxios.response?.data?.messages?.[0] || 'Ocurrió un error al intentar inscribir.';
      
      setError(msg); // Mostramos el mensaje en el modal
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }} onClick={onClose}>
        
      <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                <Dumbbell color="#2563eb" /> Nueva Actividad
            </h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '25px' }}>
            <p style={{ marginTop: 0, marginBottom: '20px', color: '#64748b' }}>
                Vas a inscribir a <strong style={{ color: '#0f172a' }}>{nombrePersona}</strong>.
            </p>

            {/* SECCIÓN DE ERROR (Feedback visual) */}
            {error && (
                <div style={{ 
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', 
                    padding: '12px', borderRadius: '8px', marginBottom: '20px',
                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
                }}>
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Selecciona la Actividad</label>
                {loading ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando catálogo...</p>
                ) : (
                    <select
                        value={selectedActividad}
                        onChange={e => {
                            setSelectedActividad(e.target.value);
                            setError('');
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', background: 'white', color: '#1e293b' }}
                    >
                        <option value="">-- Elegir Actividad --</option>
                        {actividades.map(act => (
                            <option key={act.numero} value={act.numero}>
                                {act.nombre} - {act.descripcion} - ${act.precioActual}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <button 
                onClick={handleInscribir}
                disabled={procesando || !selectedActividad || loading}
                style={{ 
                    width: '100%', padding: '14px', background: '#2563eb', color: 'white', 
                    border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', 
                    cursor: (procesando || !selectedActividad) ? 'not-allowed' : 'pointer', 
                    opacity: (procesando || !selectedActividad) ? 0.6 : 1,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                    transition: 'all 0.2s'
                }}
            >
                {procesando ? 'Procesando...' : <><CheckCircle size={20} /> Confirmar Inscripción</>}
            </button>
        </div>
      </div>
    </div>
  );
}