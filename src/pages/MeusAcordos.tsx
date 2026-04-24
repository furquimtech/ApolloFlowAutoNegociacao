import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acordosApi } from '../api/acordos';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { useTracking } from '../hooks/useTracking';
import { useViewport } from '../hooks/useViewport';
import type { AcordoHistorico, ParcelaAcordo } from '../types';

function fmtMoeda(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtData(value: string): string {
  if (!value) return '-';
  try {
    const [y, m, d] = value.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return value;
  }
}

function normalizarSituacao(situacao: string): string {
  return (situacao ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function statusAcordoLabel(situacao: string): string {
  const normalizada = normalizarSituacao(situacao);
  if (['ATIVO', 'ABERTO', 'PENDENTE', 'EM ANDAMENTO'].includes(normalizada)) return 'EM ABERTO';
  if (normalizada === 'PAGO') return 'LIQUIDADO';
  if (normalizada === 'CANCELADO') return 'CANCELADO';
  return situacao.toUpperCase();
}

function statusParcelaLabel(situacao: string): string {
  const normalizada = normalizarSituacao(situacao);
  if (normalizada === 'PAGO') return 'Liquidado';
  if (normalizada === 'CANCELADO') return 'Cancelado';
  return 'Em Aberto';
}

function compararNumeroAcordoDesc(a: AcordoHistorico, b: AcordoHistorico): number {
  const numeroA = BigInt(a.numeroAcordo || '0');
  const numeroB = BigInt(b.numeroAcordo || '0');

  if (numeroA === numeroB) return 0;
  return numeroA > numeroB ? -1 : 1;
}

function PagoIcon({ situacao }: { situacao: string }) {
  const normalizada = normalizarSituacao(situacao);
  const quitado = normalizada === 'PAGO';
  const cancelado = normalizada === 'CANCELADO';
  const emAberto = ['ABERTO', 'ATIVO', 'PENDENTE', 'EM ANDAMENTO'].includes(normalizada);

  return (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: quitado ? '#20d338' : cancelado ? '#ff4b5d' : emAberto ? '#f4b400' : '#66666b',
        color: '#fff',
        fontSize: '0.74rem',
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {quitado ? '✓' : cancelado ? '×' : emAberto ? '!' : '•'}
    </span>
  );
}

function ActionPill({
  label,
  onClick,
  disabled,
  variant = 'filled',
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
}) {
  const isOutline = variant === 'outline';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 30,
        minWidth: 108,
        padding: '0 0.9rem',
        borderRadius: 999,
        border: isOutline || disabled ? '1px solid #e3dee8' : 'none',
        background: disabled ? '#fff' : isOutline ? '#fff' : '#66666d',
        color: disabled ? '#b7b3bc' : isOutline ? '#9b97a2' : '#fff',
        fontSize: '0.7rem',
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.35rem',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function resumoAcordo(acordo: AcordoHistorico) {
  const valorDivida = parseFloat(acordo.valorTotal || '0');
  const totalAberto = parseFloat(acordo.saldoTotal || '0');
  const valorPago = Math.max(0, valorDivida - totalAberto);

  return {
    valorDivida,
    valorPago,
    totalAberto,
  };
}

function ParcelaCardMobile({
  parcela,
  ocultarSegundaVia,
  loading,
  codigoCopiado,
  onBaixar,
  onCopiarCodigo,
}: {
  parcela: ParcelaAcordo;
  ocultarSegundaVia: boolean;
  loading: boolean;
  codigoCopiado: boolean;
  onBaixar: (id: string) => void;
  onCopiarCodigo: (parcela: ParcelaAcordo) => void;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ece7f2',
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '0.8rem',
          padding: '0.9rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: '#75757b', marginBottom: '0.15rem' }}>Parcela</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#4d4d54' }}>{parcela.numeroParcela.padStart(2, '0')}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#75757b', marginBottom: '0.15rem' }}>Valor</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#4d4d54' }}>{fmtMoeda(parcela.valorTotal)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#75757b', marginBottom: '0.15rem' }}>Vencimento</div>
          <div style={{ fontSize: '0.86rem', color: '#4d4d54' }}>{fmtData(parcela.dataVencimento)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#75757b', marginBottom: '0.15rem' }}>Status</div>
          <div style={{ fontSize: '0.84rem', color: '#4d4d54', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <PagoIcon situacao={parcela.situacao} />
            {statusParcelaLabel(parcela.situacao)}
          </div>
        </div>
      </div>

      {!ocultarSegundaVia && (
        <div
          style={{
            padding: '0 0.9rem 0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          <ActionPill label="Baixar Boleto" onClick={() => onBaixar(parcela.id)} disabled={loading} />
          <ActionPill
            label={codigoCopiado ? 'Codigo Copiado' : 'Copiar Codigo'}
            onClick={() => onCopiarCodigo(parcela)}
            disabled={!parcela.nossoNumero}
          />
          <ActionPill label="Confirme seu email" disabled variant="outline" />
        </div>
      )}
    </div>
  );
}

function AcordoCard({ acordo }: { acordo: AcordoHistorico }) {
  const { isMobile } = useViewport();
  const { track } = useTracking();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [codigoCopiadoId, setCodigoCopiadoId] = useState<string | null>(null);
  const resumo = resumoAcordo(acordo);
  const ocultarSegundaVia = normalizarSituacao(acordo.situacao) === 'CANCELADO';

  async function handleBoleto(parcelaId: string) {
    setLoadingId(parcelaId);
    try {
      await acordosApi.baixarBoleto(parcelaId);
      track('BOLETO_GERADO', { pagina: '/meus-acordos', referencia: parcelaId });
    } catch {
      alert('Nao foi possivel carregar o boleto. Tente novamente.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCopiarCodigo(parcela: ParcelaAcordo) {
    if (!parcela.nossoNumero) return;

    try {
      await navigator.clipboard.writeText(parcela.nossoNumero);
      setCodigoCopiadoId(parcela.id);
      setTimeout(() => {
        setCodigoCopiadoId((current) => (current === parcela.id ? null : current));
      }, 2000);
      track('CODIGO_COPIADO', { pagina: '/meus-acordos', referencia: parcela.id });
    } catch {
      alert('Nao foi possivel copiar o codigo.');
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1040,
        margin: '0 auto',
        borderRadius: 10,
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #ece7f0',
        boxShadow: '0 12px 26px rgba(89, 58, 128, 0.07)',
      }}
    >
      <div
        style={{
          background: '#fa3650',
          color: '#fff',
          padding: isMobile ? '0.9rem 1rem' : '0.95rem 1rem',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
          gap: '0.5rem 1rem',
          alignItems: 'center',
          fontSize: isMobile ? '0.88rem' : '0.95rem',
          fontWeight: 800,
        }}
      >
        <div style={{ textTransform: 'uppercase' }}>Acordo N° {acordo.numeroAcordo}</div>
        <div>
          <span style={{ fontWeight: 900 }}>STATUS:</span> <span style={{ fontWeight: 500 }}>{statusAcordoLabel(acordo.situacao)}</span>
        </div>
      </div>

      {isMobile ? (
        <div style={{ background: '#f7f5f8', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {acordo.parcelas.map((parcela) => (
            <ParcelaCardMobile
              key={parcela.id}
              parcela={parcela}
              ocultarSegundaVia={ocultarSegundaVia}
              loading={loadingId === parcela.id}
              codigoCopiado={codigoCopiadoId === parcela.id}
              onBaixar={handleBoleto}
              onCopiarCodigo={handleCopiarCodigo}
            />
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#f7f5f8' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ece9ed' }}>
                {['Parcela', 'Valor', 'Vencimento', 'Status', 'Receber Boleto por Email'].map((label) => (
                  <th
                    key={label}
                    style={{
                      padding: '0.72rem 0.9rem',
                      textAlign: 'left',
                      fontSize: '0.88rem',
                      color: '#606067',
                      fontWeight: 800,
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {acordo.parcelas.map((parcela, index) => (
                <tr key={parcela.id} style={{ background: index % 2 === 0 ? '#fff' : '#faf9fb' }}>
                  <td style={{ padding: '0.82rem 0.9rem', fontSize: '0.88rem', color: '#4d4d54' }}>{parcela.numeroParcela.padStart(2, '0')}</td>
                  <td style={{ padding: '0.82rem 0.9rem', fontSize: '0.88rem', color: '#4d4d54', fontWeight: 600 }}>{fmtMoeda(parcela.valorTotal)}</td>
                  <td style={{ padding: '0.82rem 0.9rem', fontSize: '0.88rem', color: '#4d4d54' }}>{fmtData(parcela.dataVencimento)}</td>
                  <td style={{ padding: '0.82rem 0.9rem', fontSize: '0.88rem', color: '#4d4d54' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <PagoIcon situacao={parcela.situacao} />
                      {statusParcelaLabel(parcela.situacao)}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    {!ocultarSegundaVia && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <ActionPill label="Baixar Boleto" onClick={() => handleBoleto(parcela.id)} disabled={loadingId === parcela.id} />
                        <ActionPill
                          label={codigoCopiadoId === parcela.id ? 'Codigo Copiado' : 'Copiar Codigo'}
                          onClick={() => handleCopiarCodigo(parcela)}
                          disabled={!parcela.nossoNumero}
                        />
                        <ActionPill label="Confirme seu email" disabled variant="outline" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          background: '#fa3650',
          padding: isMobile ? '0.9rem' : '0.95rem 1rem',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: '0.9rem',
        }}
      >
        {[
          { label: 'Valor da Divida', value: fmtMoeda(resumo.valorDivida), color: '#55555d' },
          { label: 'Valor pago', value: fmtMoeda(resumo.valorPago), color: '#55555d' },
          { label: 'Total em aberto', value: fmtMoeda(resumo.totalAberto), color: '#fa3650' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '0.9rem 1rem',
              minHeight: 60,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#66666d', marginBottom: '0.18rem' }}>{item.label}</div>
            <div style={{ fontSize: isMobile ? '1.12rem' : '1.2rem', fontWeight: 900, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MeusAcordos() {
  const navigate = useNavigate();
  const { cliente } = useNegociacao();
  const { track } = useTracking();
  const { isMobile } = useViewport();
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
        setAcordos([...result.data].sort(compararNumeroAcordoDesc));
      } else {
        setErro(result.mensagem ?? 'Nao foi possivel carregar os acordos.');
      }
      setLoading(false);
    });
  }, [cliente, navigate, track]);

  if (!cliente) return null;

  return (
    <div style={{ padding: isMobile ? '1rem 0.75rem 1.5rem' : '1.35rem 1rem 2rem', width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--brand-text-muted)' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--brand-border)', borderTopColor: '#fa3650', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Carregando acordos...
        </div>
      )}

      {!loading && erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>
          {erro}
        </div>
      )}

      {!loading && !erro && acordos.length === 0 && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #f0ebf4',
            borderRadius: 16,
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--brand-text-muted)',
            boxShadow: '0 16px 34px rgba(89, 58, 128, 0.08)',
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#4f5058' }}>Nenhum acordo encontrado</p>
          <p style={{ fontSize: '0.82rem' }}>Voce ainda nao possui acordos registrados.</p>
          <button
            onClick={() => navigate('/oportunidades')}
            style={{
              marginTop: '1rem',
              background: '#fa3650',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '0.7rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Ver oportunidades
          </button>
        </div>
      )}

      {!loading && !erro && acordos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {acordos.map((acordo) => (
            <AcordoCard key={acordo.id} acordo={acordo} />
          ))}
        </div>
      )}
    </div>
  );
}
