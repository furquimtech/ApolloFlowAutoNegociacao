import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { useTracking } from '../hooks/useTracking';
import { useViewport } from '../hooks/useViewport';
import { simularPorContratos } from '../services/negociacao';
import type { Contrato } from '../types';

function fmtMoeda(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

function primeiroNome(nome: string): string {
  return nome.split(' ')[0];
}

export default function SelecionarContrato() {
  const navigate = useNavigate();
  const { cliente, contratosDisponiveis, setContratos, setContratoSelecionadoId, setSimulacao } = useNegociacao();
  const { track } = useTracking();
  const { isMobile, isCompact } = useViewport();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!cliente) {
      navigate('/');
      return;
    }

    if (contratosDisponiveis.length <= 1) {
      navigate('/oportunidades');
    }
  }, [cliente, contratosDisponiveis.length, navigate]);

  if (!cliente) {
    return null;
  }

  if (contratosDisponiveis.length <= 1) {
    return null;
  }

  const clienteAtual = cliente;

  async function handleSelecionar(contrato: Contrato) {
    setErro('');
    setLoadingId(contrato.id);

    try {
      const simulacao = await simularPorContratos(clienteAtual.id, [contrato]);
      if (!simulacao) {
        setErro('Nao foi possivel calcular as propostas para este contrato.');
        return;
      }

      setContratos([contrato]);
      setContratoSelecionadoId(contrato.id);
      setSimulacao(simulacao);

      await track('CONTRATO_SELECIONADO', {
        pagina: '/selecionar-contrato',
        referencia: contrato.id,
        dados: {
          numeroContrato: contrato.numeroContrato,
          produto: contrato.nomeProduto,
        },
      });

      navigate('/oportunidades');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ padding: isMobile ? '1rem 0.75rem 1.5rem' : '1.35rem 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: 1120, width: '100%', margin: '0 auto' }}>
      <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
        <h1 style={{ fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 900, color: '#7a2fa2', marginBottom: '0.45rem' }}>
          Selecione o contrato para negociar
        </h1>
        <p style={{ fontSize: isMobile ? '0.84rem' : '0.96rem', color: '#676872', lineHeight: 1.5, maxWidth: 760, margin: isMobile ? 0 : '0 auto' }}>
          {primeiroNome(clienteAtual.nome)}, encontramos mais de um contrato em seu cadastro. Escolha abaixo qual deles deseja negociar agora.
        </p>
      </div>

      {erro && (
        <div style={{ background: '#fff0f1', border: '1px solid #ffc8d0', borderRadius: 12, padding: '0.7rem 0.9rem', color: '#dc2626', fontSize: '0.82rem' }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.85rem' }}>
        {contratosDisponiveis.map((contrato) => (
          <div
            key={contrato.id}
            style={{
              background: '#fff',
              border: '1px solid #f0ebf4',
              borderRadius: 26,
              padding: '1.15rem 1.2rem',
              display: 'grid',
              gridTemplateColumns: isCompact ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) auto',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 16px 34px rgba(89, 58, 128, 0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#7b7c83', marginBottom: '0.2rem' }}>Contrato</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#4f5058' }}>{contrato.numeroContrato}</div>
              <div style={{ fontSize: '0.8rem', color: '#7b7c83', marginTop: '0.25rem' }}>
                {contrato.nomeProduto || contrato.empresa}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#7b7c83', marginBottom: '0.2rem' }}>Saldo atual</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fa3650' }}>{fmtMoeda(contrato.saldoAtual)}</div>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83', marginTop: '0.25rem' }}>
                {contrato.parcelas.length} parcela(s)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#7b7c83', marginBottom: '0.2rem' }}>Emissao</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4f5058' }}>{fmtData(contrato.dataEmissao)}</div>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83', marginTop: '0.25rem' }}>
                Situacao: {contrato.situacao || '-'}
              </div>
            </div>

            <button
              onClick={() => handleSelecionar(contrato)}
              disabled={loadingId !== null}
              style={{
                minWidth: isCompact ? '100%' : 176,
                height: 42,
                padding: '0 1.1rem',
                background: '#fa3650',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: 900,
                cursor: loadingId !== null ? 'not-allowed' : 'pointer',
                opacity: loadingId !== null && loadingId !== contrato.id ? 0.65 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
              }}
            >
              {loadingId === contrato.id && (
                <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              )}
              {loadingId === contrato.id ? 'Carregando...' : 'Negociar este contrato'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
