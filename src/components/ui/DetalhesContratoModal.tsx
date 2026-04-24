import type { Contrato } from '../../types';
import { useViewport } from '../../hooks/useViewport';

interface Props {
  contratos: Contrato[];
  onClose: () => void;
}

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

export default function DetalhesContratoModal({ contratos, onClose }: Props) {
  const { isMobile, isCompact } = useViewport();
  const totalParcelas = contratos.reduce((acc, contrato) => acc + contrato.parcelas.length, 0);
  const totalSaldo = contratos.reduce((acc, contrato) => acc + parseFloat(contrato.saldoAtual || '0'), 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 28,
          width: isMobile ? '95%' : '92%',
          maxWidth: 780,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            background: '#fa3650',
            color: '#fff',
            borderRadius: '28px 28px 0 0',
            padding: isMobile ? '1rem' : '1.1rem 1.5rem',
            textAlign: 'center',
            fontWeight: 900,
            fontSize: isMobile ? '1rem' : '1.05rem',
          }}
        >
          Detalhes do Contrato
        </div>

        <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
            <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.85rem 1rem', background: '#fcfbfe' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Quantidade de contratos</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f5058' }}>{contratos.length}</div>
            </div>
            <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.85rem 1rem', background: '#fcfbfe' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Quantidade de parcelas</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f5058' }}>{totalParcelas}</div>
            </div>
            <div style={{ border: '1px solid #ffd7de', borderRadius: 18, padding: '0.85rem 1rem', background: '#fff7f8' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Saldo total</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fa3650' }}>{fmtMoeda(totalSaldo)}</div>
            </div>
          </div>

          {contratos.map((contrato) => (
            <div key={contrato.id} style={{ border: '1px solid #f0ebf4', borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 28px rgba(89, 58, 128, 0.06)' }}>
              <div
                style={{
                  background: '#fff7f8',
                  padding: '0.95rem 1rem',
                  display: 'grid',
                  gridTemplateColumns: isCompact ? '1fr 1fr' : '1.2fr 1fr 1fr 1fr',
                  gap: '0.75rem',
                  alignItems: 'center',
                  borderBottom: '1px solid #f2e3e8',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#7b7c83' }}>Contrato</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#4f5058' }}>{contrato.numeroContrato}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#7b7c83' }}>Produto</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#4f5058' }}>{contrato.nomeProduto || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#7b7c83' }}>Situacao</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#4f5058' }}>{contrato.situacao}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#7b7c83' }}>Saldo atual</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#fa3650' }}>{fmtMoeda(contrato.saldoAtual)}</div>
                </div>
              </div>

              <div style={{ padding: '0.95rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '0.9rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#7b7c83' }}>Empresa</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#4f5058' }}>{contrato.empresa}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#7b7c83' }}>Data emissao</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#4f5058' }}>{fmtData(contrato.dataEmissao)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#7b7c83' }}>Dias em atraso</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#4f5058' }}>{contrato.diasAtraso || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#7b7c83' }}>Saldo vencido</div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#4f5058' }}>{fmtMoeda(contrato.saldoVencido)}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #eee7f3', paddingTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4f5058', marginBottom: '0.5rem' }}>Parcelas do contrato</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {contrato.parcelas.map((parcela) => (
                      <div
                        key={parcela.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr 1fr' : '90px 120px 1fr 120px 110px',
                          gap: '0.75rem',
                          alignItems: 'center',
                          background: '#fcfbfe',
                          border: '1px solid #eee7f3',
                          borderRadius: 16,
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.78rem',
                          color: '#4f5058',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#7b7c83' }}>Parcela</div>
                          <div style={{ fontWeight: 700 }}>{parcela.numeroParcela}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#7b7c83' }}>Vencimento</div>
                          <div style={{ fontWeight: 700 }}>{fmtData(parcela.dataVencimento)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#7b7c83' }}>Situacao</div>
                          <div style={{ fontWeight: 700 }}>{parcela.situacao}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#7b7c83' }}>Saldo atual</div>
                          <div style={{ fontWeight: 700 }}>{fmtMoeda(parcela.saldoAtual)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#7b7c83' }}>Dias atraso</div>
                          <div style={{ fontWeight: 700 }}>{parcela.diasAtraso || '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.15rem' }}>
            <button
              onClick={onClose}
              style={{
                minWidth: isMobile ? '100%' : 150,
                padding: '0.72rem 1.1rem',
                background: '#fa3650',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                fontSize: '0.9rem',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
