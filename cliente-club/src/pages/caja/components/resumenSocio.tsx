import { UserCheck } from 'lucide-react';
import type { EstadoCuenta } from '../../../types';

interface Props {
    datos: EstadoCuenta;
    onNuevaInscripcion: () => void;
}

export function ResumenSocio({ datos, onNuevaInscripcion }: Props) {
    return (
        <>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', background: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '50%' }}>
                        <UserCheck size={40} color="#2563eb" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>{datos.cliente.nombre} {datos.cliente.apellido}</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>DNI: {datos.cliente.dni}</p>
                        <button onClick={onNuevaInscripcion} style={{ marginTop: '5px', background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
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