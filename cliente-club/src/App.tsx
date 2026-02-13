import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { ProtectedRoute } from './api/components/protectedRoute';

import CajaPage from './pages/caja/cajaPage';
import { NuevoSocioPage } from './pages/nuevoSocioPage';
import { LoginPage } from './pages/loginPage';
import { ProcesosPage } from './pages/procesosPage';
import { DashboardPage } from './pages/dashboardPage';
import { ActividadesPage } from './pages/actividadesPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- RUTA PÚBLICA --- */}
          <Route path="/login" element={<LoginPage />} />

          {/* --- RUTAS PRIVADAS (El Guardián protege todo lo que está adentro) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<CajaPage />} />
            <Route path="/nuevo-socio" element={<NuevoSocioPage />} />
            <Route path="/procesos" element={<ProcesosPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/actividades" element={<ActividadesPage />} />
          </Route>

          {/* CATCH ALL: Si entra a cualquier ruta desconocida, mandar a Home (o Login si no tiene sesión) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;