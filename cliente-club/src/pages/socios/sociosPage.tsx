import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { API_ROUTES } from '../../api/routes';
import { Search, Plus, Edit, Trash2, User } from 'lucide-react';
import type { Socio } from '../../types/index';

export function SociosPage() {
    const navigate = useNavigate();
    const [socios, setSocios] = useState<Socio[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    const cargarSocios = async () => {
        setLoading(true);
        try {
            // Asumimos que este endpoint trae el listado
            // Podrías necesitar paginación a futuro si son más de 1000
            const res = await api.get(API_ROUTES.socios.list);
            console.log("[DEBUG] Respuesta API:", res);
            setSocios(res.data.data || []);
        } catch (error) {
            console.error("Error cargando socios", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarSocios();
    }, []);

    // Filtrado en cliente (rápido para < 500 socios)
    const sociosFiltrados = socios.filter(s => 
        s.persona.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        s.persona.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
        s.persona.dni_cuit.includes(filtro) ||
        s.nro_socio.includes(filtro)
    );

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* ENCABEZADO Y ACCIONES */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Padrón de Socios</h1>
                <button 
                    onClick={() => navigate('/nuevo-socio')} 
                    style={{ 
                        background: '#2563eb', color: 'white', border: 'none', 
                        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                    }}
                >
                    <Plus size={18} /> Nuevo Socio
                </button>
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, apellido o DNI..." 
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{ 
                        width: '100%', padding: '12px 12px 12px 45px', 
                        borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px'
                    }} 
                />
            </div>

            {/* TABLA */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>Socio</th>
                            <th style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>DNI / CUIT</th>
                            <th style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>Contacto</th>
                            <th style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>Estado</th>
                            <th style={{ padding: '15px', color: '#64748b', fontSize: '14px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center' }}>Cargando socios...</td></tr>
                        ) : sociosFiltrados.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center' }}>No se encontraron socios.</td></tr>
                        ) : (
                            sociosFiltrados.map(socio => (
                                <tr key={socio.nro_socio} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    
                                    {/* COLUMNA: FOTO Y NOMBRE */}
                                    <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        {socio.persona.fotoUrl ? (
                                            <img 
                                                src={socio.persona.fotoUrl} 
                                                alt={socio.persona.nombre} 
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={20} color="#64748b" />
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{socio.persona.apellido}, {socio.persona.nombre}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: #{socio.nro_socio}</div>
                                        </div>
                                    </td>

                                    {/* COLUMNA: DNI */}
                                    <td style={{ padding: '15px', color: '#334155' }}>{socio.persona.dni_cuit}</td>

                                    {/* COLUMNA: CONTACTO */}
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontSize: '14px', color: '#334155' }}>{socio.persona.email}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{socio.persona.telefono || '-'}</div>
                                    </td>

                                    {/* COLUMNA: ESTADO */}
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                            background: socio.activo ? '#dcfce7' : '#fee2e2',
                                            color: socio.activo ? '#166534' : '#991b1b'
                                        }}>
                                            {socio.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </td>

                                    {/* COLUMNA: ACCIONES */}
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => navigate(`/socios/editar/${socio.nro_socio}`)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', color: '#64748b' }}
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => { /* Lógica de borrado */ alert('Función eliminar pendiente') }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}