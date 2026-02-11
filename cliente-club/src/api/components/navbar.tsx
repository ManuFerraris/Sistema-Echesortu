import { Link } from "react-router-dom";
import { Home, UserPlus, Settings, LogOut, User, BarChart3, List } from "lucide-react";
import { useAuth } from "../../context/authContext.tsx";

export function Navbar() {
    const { logout, user } = useAuth();
    
    const handleLogout = () => {
        if (confirm('¿Seguro que deseas cerrar sesión?')) {
            logout(); // Esto borra token, usuario y redirige a /login
        }
    };

    return (
        <nav style={{ 
            background: '#1e293b', 
            padding: '1rem 2rem', 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between', // Separa menú izquierda de usuario derecha
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
            {/* SECCIÓN IZQUIERDA: MENÚ */}
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                <Link to="/" style={linkStyle}>
                    <Home size={20} /> Caja
                </Link>
                <Link to="/nuevo-socio" style={linkStyle}>
                    <UserPlus size={20} /> Nuevo Socio
                </Link>
                {/* Solo mostramos Admin si es ADMIN (Opcional, por ahora lo mostramos siempre) */}
                <Link to="/procesos" style={linkStyle}>
                    <Settings size={20} /> Admin
                </Link>
                <Link to="/dashboard" style={linkStyle}>
                    <BarChart3 size={20} /> Reportes
                </Link>
                <Link to="/actividades" style={linkStyle}>
                    <List size={20} /> Servicios
                </Link>
            </div>

            {/* SECCIÓN DERECHA: USUARIO Y SALIR */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                
                {/* Info del Usuario */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <div style={{ background: '#334155', padding: '6px', borderRadius: '50%' }}>
                        <User size={16} color="white" />
                    </div>
                    <span style={{ fontWeight: '500', color: '#e2e8f0' }}>
                        {user?.username || 'Usuario'}
                    </span>
                </div>

                {/* Separador vertical */}
                <div style={{ width: '1px', height: '24px', background: '#475569' }}></div>

                {/* Botón Logout */}
                <button 
                    onClick={handleLogout}
                    style={{ 
                        background: 'transparent', 
                        border: '1px solid #ef4444', 
                        color: '#ef4444', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                >
                    <LogOut size={16} /> Salir
                </button>
            </div>
        </nav>
    );
}

// Estilo común para los links (para no repetir código)
const linkStyle = {
    color: '#cbd5e1', 
    textDecoration: 'none', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    fontWeight: '500',
    transition: 'color 0.2s'
};