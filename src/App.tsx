import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NegociacaoProvider } from './contexts/NegociacaoContext';
import PortalLayout from './components/layout/PortalLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Identificacao from './pages/Identificacao';
import SelecionarContrato from './pages/SelecionarContrato';
import MinhasOportunidades from './pages/MinhasOportunidades';
import Simulador from './pages/Simulador';
import MeusAcordos from './pages/MeusAcordos';
import MeusDados from './pages/MeusDados';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import TermosUso from './pages/TermosUso';

export default function App() {
  return (
    <ThemeProvider>
      <NegociacaoProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<PortalLayout />}>
              <Route path="/" element={<Identificacao />} />
              <Route path="/selecionar-contrato" element={<ProtectedRoute><SelecionarContrato /></ProtectedRoute>} />
              <Route path="/oportunidades" element={<ProtectedRoute><MinhasOportunidades /></ProtectedRoute>} />
              <Route path="/simulador" element={<ProtectedRoute><Simulador /></ProtectedRoute>} />
              <Route path="/meus-acordos" element={<ProtectedRoute><MeusAcordos /></ProtectedRoute>} />
              <Route path="/meus-dados" element={<ProtectedRoute><MeusDados /></ProtectedRoute>} />
              <Route path="/privacidade" element={<ProtectedRoute><PoliticaPrivacidade /></ProtectedRoute>} />
              <Route path="/termos-de-uso" element={<ProtectedRoute><TermosUso /></ProtectedRoute>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </NegociacaoProvider>
    </ThemeProvider>
  );
}
