import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Cliente, Contrato, SimulacaoResponse, Parcelamento, AcordoHistorico } from '../types';

interface NegociacaoContextValue {
  cliente: Cliente | null;
  setCliente: (c: Cliente | null) => void;

  contratos: Contrato[];
  setContratos: (c: Contrato[]) => void;

  simulacao: SimulacaoResponse | null;
  setSimulacao: (s: SimulacaoResponse | null) => void;

  parcelamentoSelecionado: Parcelamento | null;
  setParcelamentoSelecionado: (p: Parcelamento | null) => void;

  meusAcordos: AcordoHistorico[];
  setMeusAcordos: (a: AcordoHistorico[]) => void;

  resetFlow: () => void;
}

const NegociacaoContext = createContext<NegociacaoContextValue | null>(null);

export function NegociacaoProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [simulacao, setSimulacao] = useState<SimulacaoResponse | null>(null);
  const [parcelamentoSelecionado, setParcelamentoSelecionado] = useState<Parcelamento | null>(null);
  const [meusAcordos, setMeusAcordos] = useState<AcordoHistorico[]>([]);

  function resetFlow() {
    setCliente(null);
    setContratos([]);
    setSimulacao(null);
    setParcelamentoSelecionado(null);
    setMeusAcordos([]);
  }

  return (
    <NegociacaoContext.Provider
      value={{
        cliente,
        setCliente,
        contratos,
        setContratos,
        simulacao,
        setSimulacao,
        parcelamentoSelecionado,
        setParcelamentoSelecionado,
        meusAcordos,
        setMeusAcordos,
        resetFlow,
      }}
    >
      {children}
    </NegociacaoContext.Provider>
  );
}

export function useNegociacao(): NegociacaoContextValue {
  const ctx = useContext(NegociacaoContext);
  if (!ctx) throw new Error('useNegociacao must be used inside NegociacaoProvider');
  return ctx;
}
