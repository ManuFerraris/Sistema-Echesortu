import { Link } from "react-router-dom";
import { Home, UserPlus, Settings } from "lucide-react";

export function Navbar() {
    return (
        <nav style={{ 
            background: '#1e293b', 
            padding: '1rem', 
            marginBottom: '2rem',
            display: 'flex',
            gap: '20px'
        }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Home size={20} /> Caja / Cobros
            </Link>
            <Link to="/nuevo-socio" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} /> Nuevo Socio
            </Link>
            <Link to="/procesos" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} /> Admin
            </Link>
        </nav>
    );
}