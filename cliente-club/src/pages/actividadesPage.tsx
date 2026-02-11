import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../api/routes';
import type { Actividad, ApiResponse } from '../types';
import { Edit2, Save, X, Dumbbell } from 'lucide-react';

export function ActividadesPage() {
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [/*loading*/, setLoading] = useState(true);
    const [/*error*/, setError] = useState<string | null>(null);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ nombre: '', descripcion: '', precioActual: 0 });

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
        setEditForm({ nombre: act.nombre, descripcion: act.descripcion, precioActual: act.precioActual });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (id: number) => {
        try {
            await api.put(API_ROUTES.actividades.update(id), editForm);
            setEditingId(null);
            fetchActividades(); // Recargar datos
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

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Dumbbell color="#2563eb" /> Catálogo de Actividades
                    </h1>
                    <p style={{ color: '#64748b' }}>Gestiona los precios y servicios del club.</p>
                </div>
                {/* Futuro boton de nueva actividad */}
            </div>

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
                                                onChange={e => setEditForm({...editForm, precioActual: Number(e.target.value)})}
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
        </div>
    );
}