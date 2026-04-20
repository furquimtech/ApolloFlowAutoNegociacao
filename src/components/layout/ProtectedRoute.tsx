import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useNegociacao } from '../../contexts/NegociacaoContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { cliente } = useNegociacao();
  if (!cliente) return <Navigate to="/" replace />;
  return <>{children}</>;
}
