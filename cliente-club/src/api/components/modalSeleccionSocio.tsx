import { User } from 'lucide-react';
import type { Persona } from '../../types/index';

interface Props {
    resultados: Persona[];
    onSelect: (socio: Persona) => void;
    onClose: () => void;
}

export function ModalSeleccionSocio({ resultados, onSelect, onClose }: Props) {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }} onClick={onClose}>
            
            <div style={{ 
                background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90%', 
                overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
            }} onClick={e => e.stopPropagation()}>
                
                <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Seleccionar Socio</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        Encontramos varios resultados. ¿A quién buscas?
                    </p>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {resultados.map(socio => (
                        <div 
                            key={socio.nro}
                            onClick={() => onSelect(socio)}
                            style={{ 
                                padding: '15px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '15px', transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '50%', color: '#0284c7' }}>
                                <User size={20} />
                            </div>
                            <div>
                                <strong style={{ display: 'block', color: '#0f172a' }}>{socio.nombre} {socio.apellido}</strong>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>DNI: {socio.dni_cuit} | Socio #{socio.nro}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '15px', textAlign: 'right', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}