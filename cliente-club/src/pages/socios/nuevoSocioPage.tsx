import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { AxiosError } from 'axios';
import { Save, ArrowLeft, UserPlus, Upload, X } from 'lucide-react';
import { API_ROUTES } from '../../api/routes';

export function NuevoSocioPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // ESTADO PARA LA IMAGEN
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Estado inicial del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni_cuit: '',
        fechaNacimiento: '',
        email: '',
        telefono: '',
        domicilio: '',
        tipo: 'fisica'
    });

    // Manejador genérico para todos los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // 2. Manejador de Selección de Imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar que sea imagen
            if (!file.type.startsWith('image/')) return alert('Por favor, subí una imagen válida.');
            // Validar peso (ej: max 5MB)
            if (file.size > 5 * 1024 * 1024) return alert('La imagen pesa más de 5MB.');

            setFotoArchivo(file); // Guardamos el archivo real para mandarlo
            
            // Creamos una URL local temporal para la previsualización
            const previewUrl = URL.createObjectURL(file);
            setFotoPreview(previewUrl);
        }
    };

    const quitarFoto = () => {
        setFotoArchivo(null);
        setFotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Resetea el input file
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            // A. Instanciamos el FormData (El "sobre" que permite archivos + texto)
            const payload = new FormData();

            // B. Metemos todos los campos de texto
            payload.append('nombre', formData.nombre);
            payload.append('apellido', formData.apellido);
            payload.append('dni_cuit', formData.dni_cuit);
            payload.append('email', formData.email);
            payload.append('domicilio', formData.domicilio);
            payload.append('tipo', formData.tipo.toLowerCase());
            
            if (formData.fechaNacimiento) payload.append('fechaNacimiento', formData.fechaNacimiento);
            if (formData.telefono) payload.append('telefono', formData.telefono);
            
            // Le mandamos activo true por defecto
            //payload.append('activo', 'true');

            // C. INCORPORAMOS LA IMAGEN (si hay)
            if (fotoArchivo) {
                // 'fotoPerfil' es el nombre que configuraste en el middleware uploadFoto.single('fotoPerfil')
                payload.append('fotoPerfil', fotoArchivo); 
            }

            // D. Disparamos la API (Axios detecta automáticamente que es FormData y ajusta los headers)
            const res = await api.post(API_ROUTES.personas.create, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                }
            });
            console.log('[DEBUG] Respuesta del servidor:', res.data);
            alert('¡Socio creado exitosamente!');
            navigate('/');
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('[DEBUG 3] Error de Axios:', error.response);
                const msg = error.response?.data?.messages?.[0] || 'Error al crear el socio.';
                alert(msg);
            }else{
                alert('Error al crear el socio. Revisa que el DNI no esté duplicado.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><UserPlus /> Nuevo Socio</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                
                {/* COLUMNA IZQUIERDA: FOTO DE PERFIL */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                        width: '200px', height: '200px', borderRadius: '50%', border: '2px dashed #cbd5e1',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
                        backgroundColor: '#f8fafc', position: 'relative'
                    }}>
                        {fotoPreview ? (
                            <>
                                <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button type="button" onClick={quitarFoto} style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <Upload size={40} style={{ marginBottom: '10px' }}/>
                                <div>Sin foto</div>
                            </div>
                        )}
                    </div>
                    
                    {/* Input file oculto */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        style={{ display: 'none' }} 
                    />
                    
                    {/* Botón estético para llamar al input file */}
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 15px', background: '#e2e8f0', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}>
                        Seleccionar Imagen
                    </button>
                </div>

                {/* COLUMNA DERECHA: DATOS DE TEXTO */}
                <div style={{ display: 'grid', gap: '15px', alignContent: 'start' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>Nombre *</label>
                            <input required name="nombre" value={formData.nombre} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
                        </div>
                        <div>
                            <label>Apellido *</label>
                            <input required name="apellido" value={formData.apellido} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>DNI / CUIT *</label>
                            <input required name="dni_cuit" value={formData.dni_cuit} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
                        </div>
                        <div>
                            <label>Fecha Nacimiento *</label>
                            <input type="date" required name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>Email *</label>
                            <input type="email" required name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
                        </div>
                        <div>
                            <label>Teléfono</label>
                            <input name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
                        </div>
                    </div>

                    <div>
                        <label>Domicilio *</label>
                        <input required name="domicilio" value={formData.domicilio} onChange={handleChange} style={{ width: '100%', padding: '10px' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        {loading ? 'Guardando (Esto puede demorar)...' : <><Save size={18} /> Guardar Socio</>}
                    </button>
                </div>

            </form>
        </div>
    );
}