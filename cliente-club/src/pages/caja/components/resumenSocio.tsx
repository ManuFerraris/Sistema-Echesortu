import { Camera, UserCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import type { EstadoCuenta } from '../../../types';
import { api } from '../../../api/axios';
import { AxiosError } from 'axios';
import { API_ROUTES } from '../../../api/routes';

interface Props {
    datos: EstadoCuenta;
    onNuevaInscripcion: () => void;
    onFotoActualizada?: () => void;
}

export function ResumenSocio({ datos, onNuevaInscripcion, onFotoActualizada }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [subiendo, setSubiendo] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validaciones básicas
        if (!file.type.startsWith('image/')) return alert('Solo se permiten imágenes');
        if (file.size > 5 * 1024 * 1024) return alert('La imagen es muy pesada (máx 5MB)');

        if (!confirm('¿Querés actualizar la foto de perfil?')) return;

        setSubiendo(true);
        try {
            const formData = new FormData();
            formData.append('fotoPerfil', file); // Nombre clave 'fotoPerfil'

            // Usamos el ID de la persona (no el nro de socio) para el endpoint
            // Asegurate de que datos.cliente.id tenga el valor correcto
            await api.put(API_ROUTES.personas.updatePicture(datos.cliente.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Foto actualizada correctamente');
            
            // Avisamos al padre (GestionCobros) para que vuelva a pedir los datos y se vea la foto nueva
            if (onFotoActualizada) onFotoActualizada();

        } catch (error) {
            const err = error as AxiosError<{ messages: string[] }>;
            alert(err.response?.data?.messages?.[0] || 'Error al actualizar la foto');
            alert('Error al subir la foto');
        } finally {
            setSubiendo(false);
            // Limpiamos el input para permitir subir la misma foto de nuevo si falla
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', background: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                
                {/* Header con Foto y Datos */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>

                    {/* --- SECCIÓN FOTO CON EDICIÓN --- */}
                    <div style={{ position: 'relative' }}>
                        {datos.cliente.fotoUrl ? (
                            <img 
                                src={datos.cliente.fotoUrl} 
                                alt={`Foto de ${datos.cliente.nombre}`}
                                style={{ 
                                    width: '80px', height: '80px', borderRadius: '50%', 
                                    objectFit: 'cover', border: '3px solid #e2e8f0',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    opacity: subiendo ? 0.5 : 1
                                }} 
                            />
                        ) : (
                            <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: '3px solid #e2e8f0' }}>
                                <UserCheck size={40} color="#2563eb" />
                            </div>
                        )}

                        {/* Botón flotante para editar */}
                        <button 
                            disabled={subiendo}
                            onClick={() => fileInputRef.current?.click()}
                            style={{ 
                                position: 'absolute', bottom: 0, right: -5,
                                background: '#2563eb', color: 'white', border: '2px solid white',
                                borderRadius: '50%', width: '30px', height: '30px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                            title="Cambiar foto"
                        >
                            {subiendo ? '...' : <Camera size={16} />}
                        </button>

                        {/* Input Oculto */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>
                            {datos.cliente.nombre} {datos.cliente.apellido}
                        </h2>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '1.1rem' }}>
                            DNI: {datos.cliente.dni || datos.cliente.dni}
                        </p>
                        {/* BOTÓN EDITAR */}
                        <button 
                            onClick={() => navigate(`/socios/editar/${datos.cliente.id}`)} // O datos.cliente.nro
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            title="Editar datos personales"
                        >
                            <Pencil size={18} /> Editar usuario
                        </button>
                        <button onClick={onNuevaInscripcion} style={{ marginTop: '10px', background: '#eff6ff', border: '1px solid #2563eb', color: '#2563eb', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            + Agregar Actividad
                        </button>
                    </div>
                </div>

                {/* Tarjetas Saldo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '25px' }}>
                    <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '10px', color: '#991b1b', border: '1px solid #fecaca' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Deuda Total</h3>
                        <p style={{ fontSize: '32px', fontWeight: '800', margin: '10px 0' }}>${datos.resumenFinanciero.totalDeudaClub}</p>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', color: '#166534', border: '1px solid #bbf7d0' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Pagado Histórico</h3>
                        <p style={{ fontSize: '32px', fontWeight: '800', margin: '10px 0' }}>${datos.resumenFinanciero.totalPagadoHistorico}</p>
                    </div>
                </div>
            </div>
        </>
    );
}