import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { Save, ArrowLeft, UserPlus } from 'lucide-react';
import { API_ROUTES } from '../api/routes';

export function NuevoSocioPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
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
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post(API_ROUTES.personas.create, formData);
            alert('¡Socio creado exitosamente!');
            // Redirigir a la Caja para buscarlo
            navigate('/'); 
        } catch (error) {
            console.error(error);
            alert('Error al crear el socio. Revisa que el DNI no esté duplicado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        
        {/* Encabezado con botón de volver */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <button 
            onClick={() => navigate('/')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
            <ArrowLeft size={24} />
            </button>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus /> Nuevo Socio
            </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            
            {/* Fila 1: Nombre y Apellido */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
                <label>Nombre *</label>
                <input 
                required
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }} 
                />
            </div>
            <div>
                <label>Apellido *</label>
                <input 
                required
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }} 
                />
            </div>
            </div>

            {/* Fila 2: DNI y Fecha Nacimiento */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
                <label>DNI / CUIT *</label>
                <input 
                required
                name="dni_cuit"
                value={formData.dni_cuit}
                onChange={handleChange}
                placeholder="Ej: 30123456"
                style={{ width: '100%', padding: '10px' }} 
                />
            </div>
            <div>
                <label>Fecha de Nacimiento</label>
                <input 
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }} 
                />
            </div>
            </div>

            {/* Fila 3: Contacto */}
            <div>
            <label>Email</label>
            <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }} 
            />
            </div>

            <div>
            <label>Teléfono</label>
            <input 
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }} 
            />
            </div>

            <div>
            <label>Domicilio</label>
            <input 
                name="domicilio"
                value={formData.domicilio}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px' }} 
            />
            </div>

            <button 
            type="submit" 
            disabled={loading}
            style={{ 
                background: '#2563eb', color: 'white', padding: '15px', 
                border: 'none', borderRadius: '5px', fontSize: '16px', 
                cursor: 'pointer', marginTop: '10px', display: 'flex', 
                justifyContent: 'center', alignItems: 'center', gap: '10px'
            }}
            >
            {loading ? 'Guardando...' : <><Save size={18} /> Guardar Socio</>}
            </button>

        </form>
        </div>
    );
}