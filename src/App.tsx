import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NegociacaoProvider } from './contexts/NegociacaoContext';
import PortalLayout from './components/layout/PortalLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Identificacao from './pages/Identificacao';
import MinhasOportunidades from './pages/MinhasOportunidades';
import Simulador from './pages/Simulador';
import MeusAcordos from './pages/MeusAcordos';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';

export default function App() {
  return (
    <ThemeProvider>
      <NegociacaoProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<PortalLayout />}>
              <Route path="/" element={<Identificacao />} />
              <Route path="/oportunidades" element={<ProtectedRoute><MinhasOportunidades /></ProtectedRoute>} />
              <Route path="/simulador" element={<ProtectedRoute><Simulador /></ProtectedRoute>} />
              <Route path="/meus-acordos" element={<ProtectedRoute><MeusAcordos /></ProtectedRoute>} />
              <Route path="/privacidade" element={<PoliticaPrivacidade />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </NegociacaoProvider>
    </ThemeProvider>
  );
}
