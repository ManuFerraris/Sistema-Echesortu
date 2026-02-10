import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { Navbar } from './navbar.tsx';

export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    // 'replace' evita que pueda volver atrás con el botón del navegador
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si SÍ está autenticado, mostramos el Navbar y el contenido (Outlet)
    return (
        <>
            <Navbar />
            <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
                <Outlet /> {/* Aquí se renderizará la página correspondiente (Caja, NuevoSocio, etc.) */}
            </div>
        </>
    );
};