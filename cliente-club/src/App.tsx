import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './api/components/navbar';
import { ProcesosPage } from './pages/procesosPage';

import CajaPage from './pages/cajaPage';
import { NuevoSocioPage } from './pages/nuevoSocioPage';

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar aparece en TODAS las páginas */}
      <Navbar />

      <Routes>
        {/* Ruta Principal: La Caja */}
        <Route path="/" element={<CajaPage />} />
        
        {/* Ruta Nueva: Alta de Socios */}
        <Route path="/nuevo-socio" element={<NuevoSocioPage />} />

        {/* Ruta Nueva: Procesos Administrativos */}
        <Route path="/procesos" element={<ProcesosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;