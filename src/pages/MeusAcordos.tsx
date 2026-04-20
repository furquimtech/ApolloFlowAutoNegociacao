import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { acordosApi } from '../api/acordos';
import { useTracking } from '../hooks/useTracking';
import type { AcordoHistorico, ParcelaAcordo } from '../types';

function fmtMoeda(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(value: string): string {
  if (!value) return '—';
  try {
    const [y, m, d] = value.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return value;
  }
}

function situacaoBadge(situacao: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ATIVO:     { bg: '#dcfce7', color: '#166534', label: 'Ativo' },
    PENDENTE:  { bg: '#fef9c3', color: '#854d0e', label: 'Pendente' },
    PAGO:      { bg: '#dbeafe', color: '#1e40af', label: 'Pago' },
    CANCELADO: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' },
    ABERTO:    { bg: '#fef9c3', color: '#854d0e', label: 'Aberto' },
  };
  const style = map[situacao] ?? { bg: '#f3f4f6', color: '#374151', label: situacao };
  return (
    <span style={{
      background: style.bg, color: style.color,
      borderRadius: 999, padding: '0.2rem 0.6rem',
      fontSize: '0.72rem', fontWeight: 700, display: 'inline-block',
    }}>
      {style.label}
    </span>
  );
}

function ParcelasTable({ parcelas }: { parcelas: ParcelaAcordo[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { track } = useTracking();

  async function handleBoleto(parcelaId: string) {
    setLoadingId(parcelaId);
    try {
      await acordosApi.baixarBoleto(parcelaId);
      track('BOLETO_GERADO', { pagina: '/meus-acordos', referencia: parcelaId });
    } catch {
      alert('Não foi possível carregar o boleto. Tente novamente.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
      <thead>
        <tr style={{ background: 'var(--brand-bg)' }}>
          {['Parcela', 'Vencimento', 'Valor', 'Situação', ''].map((h) => (
            <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--brand-text-muted)', borderBottom: '1px solid var(--brand-border)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {parcelas.map((p) => (
          <tr key={p.id} style={{ borderBottom: '1px solid var(--brand-border)' }}>
            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
              {parseInt(p.numeroParcela) === 0 ? 'Entrada' : `Parcela ${p.numeroParcela}`}
            </td>
            <td style={{ padding: '0.5rem 0.75rem' }}>{fmtData(p.dataVencimento)}</td>
            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>{fmtMoeda(p.valorTotal)}</td>
            <td style={{ padding: '0.5rem 0.75rem' }}>{situacaoBadge(p.situacao)}</td>
            <td style={{ padding: '0.5rem 0.75rem' }}>
              {p.situacao === 'ABERTO' && (
                <button
                  onClick={() => handleBoleto(p.id)}
                  disabled={loadingId === p.id}
                  style={{
                    background: 'var(--brand-primary)', color: '#fff',
                    border: 'none', borderRadius: 6,
                    padding: '0.3rem 0.75rem', fontSize: '0.75rem',
                    fontWeight: 600, cursor: loadingId === p.id ? 'not-allowed' : 'pointer',
                    opacity: loadingId === p.id ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  {loadingId === p.id ? (
                    <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  )}
                  Boleto
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AcordoCard({ acordo }: { acordo: AcordoHistorico }) {
  const [expanded, setExpanded] = useState(false);
  const isAvista = parseInt(acordo.numeroParcelas) <= 1;

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--brand-border)',
      borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto auto',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--brand-text-muted)' }}>Acordo Nº</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{acordo.numeroAcordo}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--brand-text-muted)' }}>Modalidade</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{isAvista ? 'À Vista' : `${acordo.numeroParcelas}x`}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--brand-text-muted)' }}>Total</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-accent)' }}>{fmtMoeda(acordo.valorTotal)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--brand-text-muted)' }}>Data</div>
          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{fmtData(acordo.dataEmissao)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {situacaoBadge(acordo.situacao)}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--brand-text-muted)" strokeWidth="2"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {expanded && acordo.parcelas.length > 0 && (
        <div style={{ borderTop: '1px solid var(--brand-border)', padding: '0 0 0.5rem 0' }}>
          <ParcelasTable parcelas={acordo.parcelas} />
        </div>
      )}
    </div>
  );
}

export default function MeusAcordos() {
  const navigate = useNavigate();
  const { cliente } = useNegociacao();
  const { track } = useTracking();
  const [acordos, setAcordos] = useState<AcordoHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!cliente) {
      navigate('/');
      return;
    }
    track('PAGE_VIEW', { pagina: '/meus-acordos' });
    acordosApi.listarPorCliente(cliente.id).then((result) => {
      if (result.sucesso && result.data) {
        setAcordos(result.data);
      } else {
        setErro(result.mensagem ?? 'Não foi possível carregar os acordos.');
      }
      setLoading(false);
    });
  }, [cliente, navigate]);

  if (!cliente) return null;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--brand-text)' }}>Meus Acordos</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--brand-text-muted)', marginTop: '0.25rem' }}>
          Histórico de acordos e boletos para pagamento
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--brand-text-muted)' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--brand-border)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Carregando acordos...
        </div>
      )}

      {!loading && erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>
          {erro}
        </div>
      )}

      {!loading && !erro && acordos.length === 0 && (
        <div style={{
          background: '#fff', border: '1px solid var(--brand-border)',
          borderRadius: 10, padding: '3rem',
          textAlign: 'center', color: 'var(--brand-text-muted)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum acordo encontrado</p>
          <p style={{ fontSize: '0.82rem' }}>Você ainda não possui acordos registrados.</p>
          <button
            onClick={() => navigate('/oportunidades')}
            style={{
              marginTop: '1rem', background: 'var(--brand-primary)', color: '#fff',
              border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Ver oportunidades
          </button>
        </div>
      )}

      {!loading && !erro && acordos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {acordos.map((a) => (
            <AcordoCard key={a.id} acordo={a} />
          ))}
        </div>
      )}
    </div>
  );
}
