import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/axios';
import { ArrowLeft, Save, } from 'lucide-react';
import { API_ROUTES } from '../../api/routes';
import { AxiosError } from 'axios';

export function EditarSocioPage() {
    const { id } = useParams(); // Obtenemos el ID de la URL
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Estados para la foto
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', dni_cuit: '', fechaNacimiento: '',
        email: '', telefono: '', domicilio: '', tipo: 'fisica', activo: true
    });

    // 1. CARGAR DATOS AL INICIO
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                //console.log('[DEBUG] Cargando datos para socio ID:', id);
                const res = await api.get(API_ROUTES.personas.getById(id!)); 
                const cliente = res.data.data;
                //console.log('[DEBUG] Datos respuesta:', res); 
                //console.log('[DEBUG] Datos cliente:', cliente);

                // Rellenamos el form
                setFormData({
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    dni_cuit: cliente.dni || cliente.dni_cuit,
                    // Convertir fecha ISO a YYYY-MM-DD para el input date
                    fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
                    email: cliente.email,
                    telefono: cliente.telefono || '',
                    domicilio: cliente.domicilio,
                    tipo: cliente.tipo || 'fisica',
                    activo: cliente.activo
                });

                // Si tiene foto, la mostramos en el preview
                if (cliente.fotoUrl) {
                    setFotoPreview(cliente.fotoUrl);
                }
            } catch (error) {
                const err = error as AxiosError<{ messages: string[] }>;
                const msg = err.response?.data?.messages?.[0] || 'Error al cargar los datos del socio';
                alert(msg);
                navigate(-1);
            } finally {
                setLoading(false);
            };
        };
        if (id) cargarDatos();
    }, [id, navigate]);

    // 2. MANEJADORES (Igual que NuevoSocio)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFotoArchivo(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    // 3. GUARDAR CAMBIOS (PUT)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);

        try {
            const payload = new FormData();
            // Agregamos campos de texto
            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, String(value));
            });

            // Agregamos foto SOLO si el usuario subió una nueva
            if (fotoArchivo) {
                payload.append('fotoPerfil', fotoArchivo);
            }

            // PUT al endpoint de actualización
            // Ajustar ruta según tu API (puede ser /personas/:id)
            await api.put(API_ROUTES.personas.update(id!), payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Datos actualizados correctamente');
            navigate(-1); // Volver atrás
        } catch (error) {
            const err = error as AxiosError<{ messages: string[] }>;
            const msg = err.response?.data?.messages?.[0] || 'Error al actualizar los datos del socio';
            alert(msg);
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <div>Cargando datos...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Encabezado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft /></button>
                <h1 style={{ margin: 0 }}>Editar Socio #{id}</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                
                {/* FOTO */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto 15px',
                        overflow: 'hidden', border: '3px solid #e2e8f0', position: 'relative' 
                    }}>
                        {fotoPreview ? (
                            <img src={fotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>Sin foto</div>
                        )}
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '5px 10px' }}>Cambiar Foto</button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
                </div>

                {/* CAMPOS */}
                <div style={{ display: 'grid', gap: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div><label>Nombre</label><input name="nombre" value={formData.nombre} onChange={handleChange} style={{ width: '100%', padding: '8px' }} /></div>
                        <div><label>Apellido</label><input name="apellido" value={formData.apellido} onChange={handleChange} style={{ width: '100%', padding: '8px' }} /></div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div><label>DNI</label><input name="dni_cuit" value={formData.dni_cuit} onChange={handleChange} style={{ width: '100%', padding: '8px' }} /></div>
                        <div><label>Nacimiento</label><input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={{ width: '100%', padding: '8px' }} /></div>
                    </div>

                    <div><label>Email</label><input name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px' }} /></div>
                    <div><label>Domicilio</label><input name="domicilio" value={formData.domicilio} onChange={handleChange} style={{ width: '100%', padding: '8px' }} /></div>
                    <div><label>Teléfono</label><input name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '8px' }} /></div>

                    <button type="submit" disabled={guardando} style={{ padding: '15px', width: '104%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        <Save size={18} className="mr-2" />
                        {guardando ? '    Guardando...' : '    Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}