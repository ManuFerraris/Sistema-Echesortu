import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { API_ROUTES } from '../../api/routes';
import type { Caja } from '../../types/index';
import { AperturaCaja } from './components/aperturaCaja';
import { GestionCobros } from './components/gestionCobros';
import { CierreCajaModal } from './components/cierreCajaModal';
import { ResumenSesion } from './components/resumenSesion';
import { LogOut } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';

export function CajaPage() {
    const [caja, setCaja] = useState<Caja | null>(null);
    const [loading, setLoading] = useState(true);
    const [mostrarCierre, setMostrarCierre] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    const checkEstado = async () => {
        setLoading(true);
        try {
            const res = await api.get(API_ROUTES.caja.estado);
            setCaja(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCobroExitoso = () => {
        setUpdateTrigger(prev => prev + 1); // Cambiamos el valor para disparar el useEffect
    };

    useEffect(() => {
        checkEstado();
    }, []);

    if (loading) return <div style={{ padding: 50, textAlign: 'center' }}>Verificando estado de caja...</div>;

    // 1. SI ESTÁ CERRADA -> MOSTRAR FORMULARIO APERTURA
    if (!caja) {
        return <AperturaCaja onCajaAbierta={checkEstado} />;
    }

    // 2. SI ESTÁ ABIERTA -> MOSTRAR GESTIÓN DE COBROS CON HEADER DE CAJA
    return (
        <div style={{ position: 'relative' }}>
            {/* Header Flotante o Barra Superior de Caja */}
            <div style={{ 
                background: '#1e293b', color: 'white', padding: '10px 20px', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'sticky', top: 0, zIndex: 100 
            }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#22c55e', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: '#000' }}>
                        CAJA ABIERTA
                    </div>
                    <span>
                        ID: <strong>#{caja.numero}</strong> | Inicio: <strong>${caja.saldoInicial}</strong>
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Botón para ver dashboard/resumen rápido (Opcional) */}
                    <button style={{ background: '#334155', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <LayoutDashboard size={16} /> Resumen
                    </button>

                    <button 
                        onClick={() => setMostrarCierre(true)}
                        style={{ background: '#ef4444', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center', fontWeight: 'bold' }}
                    >
                        <LogOut size={16} /> Cerrar Caja
                    </button>
                </div>
            </div>

            <ResumenSesion triggerUpdate={updateTrigger}/>

            <GestionCobros onCobroRealizado={handleCobroExitoso} />

            {/* Modal de Cierre */}
            {mostrarCierre && (
                <CierreCajaModal 
                    onClose={() => setMostrarCierre(false)} 
                    onSuccess={() => {
                        setMostrarCierre(false);
                        checkEstado(); // Recargar para volver a pantalla de apertura
                    }} 
                />
            )}
        </div>
    );
}

export default CajaPage;