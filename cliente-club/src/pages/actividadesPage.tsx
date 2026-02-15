import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../api/routes';
import type { Actividad, ApiResponse } from '../types';
import { Edit2, Save, X, Dumbbell, Plus } from 'lucide-react';

export function ActividadesPage() {
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [/*loading*/, setLoading] = useState(true);
    const [/*error*/, setError] = useState<string | null>(null);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ nombre: '', descripcion: '', precioActual: '' });

    // Estados para Creación (Modal)
    const [showModal, setShowModal] = useState(false);
    const [creando, setCreando] = useState(false);
    const [newForm, setNewForm] = useState({ nombre: '', descripcion: '', precioActual: '' });

    const fetchActividades = async () => {
        try {
            const res = await api.get<ApiResponse<Actividad[]>>(API_ROUTES.actividades.list);
            if (res.data.success) setActividades(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActividades();
    }, []);

    const startEdit = (act: Actividad) => {
        setEditingId(act.numero);
        setEditForm({ nombre: act.nombre, descripcion: act.descripcion, precioActual: String(act.precioActual) });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (id: number) => {
        try {
            const res = await api.put(API_ROUTES.actividades.update(id), editForm);
            console.log("[DEBUG] Respuesta de actualización:", res);
            setEditingId(null);
            fetchActividades();
            alert('¡Actividad actualizada!');
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

    // --- LÓGICA CREACIÓN ---
    const crearActividad = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreando(true);
        try {
            const res = await api.post(API_ROUTES.actividades.create, newForm);
            console.log("[DEBUG] Respuesta de creación:", res);
            alert('Actividad creada exitosamente');
            setShowModal(false);
            setNewForm({ nombre: '', descripcion: '', precioActual: '' }); // Reset form
            fetchActividades(); // Recargar tabla
        } catch (error) {
            const err = error as AxiosError<ApiResponse<null>>;
            alert(err.response?.data?.messages?.[0] || 'Error al crear actividad');
            console.error("Error detallado:", err.response);
            console.log("[DEBUG] Datos enviados:", newForm);
            console.log("[DEBUG] ERROR:", error);
            console.log("[DEBUG] Error Axios:", err);
        } finally {
            setCreando(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {/*ENVABEZADO*/}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Dumbbell color="#2563eb" /> Catálogo de Actividades
                    </h1>
                    <p style={{ color: '#64748b' }}>Gestiona los precios y servicios del club.</p>
                </div>
                {/* BOTÓN NUEVA ACTIVIDAD */}
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ 
                        background: '#2563eb', color: 'white', border: 'none', 
                        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                    }}
                >
                    <Plus size={18} /> Nueva Actividad
                </button>
            </div>

            {/* TABLA DE ACTIVIDADES */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: '15px', color: '#64748b' }}>Nombre</th>
                            <th style={{ padding: '15px', color: '#64748b' }}>Descripción</th>
                            <th style={{ padding: '15px', color: '#64748b' }}>Precio Actual</th>
                            <th style={{ padding: '15px', color: '#64748b' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actividades.map(act => (
                            <tr key={act.numero} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                
                                {/* MODO LECTURA vs MODO EDICIÓN */}
                                {editingId === act.numero ? (
                                    <>
                                        <td style={{ padding: '15px' }}>
                                            <input 
                                                type="text" 
                                                value={editForm.nombre}
                                                onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%' }}
                                            />
                                        </td>
                                        
                                        <td style={{ padding: '15px' }}>
                                            <input 
                                                type="text" 
                                                value={editForm.descripcion}
                                                onChange={e => setEditForm({...editForm, descripcion: e.target.value})}
                                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%' }}
                                            />
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <input 
                                                type="number" 
                                                value={editForm.precioActual}
                                                onChange={e => setEditForm({...editForm, precioActual: (e.target.value)})}
                                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                            <button onClick={() => saveEdit(act.numero)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}><Save size={18} /></button>
                                            <button onClick={cancelEdit} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}><X size={18} /></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{act.nombre || 'Actividad'}</td>
                                        <td style={{ padding: '15px', color: '#64748b' }}>{act.descripcion}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a' }}>${act.precioActual.toLocaleString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <button 
                                                onClick={() => startEdit(act)}
                                                style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}
                                            >
                                                <Edit2 size={16} /> Editar
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* MODAL DE CREACIÓN */}
            {showModal && (
                <div 
                    // 1. CLIC AFUERA: Cerramos el modal si tocan el fondo oscuro
                    onClick={() => setShowModal(false)}
                    style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(0,0,0,0.5)', // Fondo oscuro semitransparente
                        display: 'flex', justifyContent: 'center', alignItems: 'center', 
                        zIndex: 1000 
                    }}
                >
                    <div 
                        // 2. STOP PROPAGATION: Evitamos que el clic ADENTRO del modal lo cierre
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                            background: 'white', padding: '30px', borderRadius: '12px', 
                            width: '400px', maxWidth: '90%', // Responsive
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
                        }}
                    >
                        {/* ENCABEZADO DEL MODAL */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Nueva Actividad</h2>
                            
                            {/* 3. BOTÓN X (CERRAR) */}
                            <button 
                                type="button" // Importante para que no envíe el formulario
                                onClick={() => setShowModal(false)} 
                                style={{ 
                                    background: 'transparent', border: 'none', cursor: 'pointer', 
                                    padding: '5px', borderRadius: '50%', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', color: '#64748b' 
                                }}
                                title="Cerrar ventana"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={crearActividad} style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Nombre *</label>
                                <input 
                                    required
                                    value={newForm.nombre}
                                    onChange={e => setNewForm({...newForm, nombre: e.target.value})}
                                    placeholder="Ej: Natación Libre"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Descripción</label>
                                <input 
                                    value={newForm.descripcion}
                                    onChange={e => setNewForm({...newForm, descripcion: e.target.value})}
                                    placeholder="Detalles del servicio..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Precio Actual *</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }}>$</span>
                                    <input 
                                        type="number"
                                        value={newForm.precioActual}
                                        onChange={e => setNewForm({...newForm, precioActual: (e.target.value)})}
                                        placeholder="0.00"
                                        required
                                        style={{ width: '100%', padding: '10px 10px 10px 25px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            {/* BOTONERA DE ACCIONES */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                {/* 4. BOTÓN CANCELAR (SECUNDARIO) */}
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    style={{ 
                                        flex: 1, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', 
                                        padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button 
                                    type="submit" 
                                    disabled={creando}
                                    style={{ 
                                        flex: 1, background: '#2563eb', color: 'white', border: 'none', 
                                        padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                                        opacity: creando ? 0.7 : 1
                                    }}
                                >
                                    {creando ? 'Creando...' : 'Crear Actividad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}