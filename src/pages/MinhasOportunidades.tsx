import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { acordosApi } from '../api/acordos';
import DadosAcordoModal from '../components/ui/DadosAcordoModal';
import type { Parcelamento } from '../types';

function fmtMoeda(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function totalParcelas(p: Parcelamento): number {
  return p.parcelas.length;
}

function labelParcelas(p: Parcelamento): string {
  const total = totalParcelas(p);
  if (total <= 1) return 'à vista';
  return `até ${total}x`;
}

function descontoPercent(p: Parcelamento, valorDivida: string): number {
  const desconto = parseFloat(p.descontoTotal ?? '0');
  const divida = parseFloat(valorDivida ?? '0');
  if (!divida || !desconto) return 0;
  return Math.round((desconto / divida) * 100);
}

function primeiroPrimeiroNome(nome: string): string {
  return nome.split(' ')[0];
}

export default function MinhasOportunidades() {
  const navigate = useNavigate();
  const { cliente, contratos, simulacao } = useNegociacao();
  const [modalParcelamento, setModalParcelamento] = useState<Parcelamento | null>(null);
  const [temAcordoAtivo, setTemAcordoAtivo] = useState(false);

  const ofertasHabilitadasCheck = simulacao?.parcelamentos.filter((p) => p.habilitado) ?? [];

  useEffect(() => {
    if (!cliente || ofertasHabilitadasCheck.length > 0) return;
    acordosApi.listarPorCliente(cliente.id).then((result) => {
      if (result.sucesso && result.data) {
        const ativo = result.data.some((a) =>
          ['ATIVO', 'PENDENTE', 'ABERTO'].includes(a.situacao)
        );
        setTemAcordoAtivo(ativo);
      }
    });
  }, [cliente, ofertasHabilitadasCheck.length]);

  if (!cliente || !simulacao) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--brand-text-muted)' }}>
        Sessão inválida.
        <button onClick={() => navigate('/')} style={{ marginLeft: 8, color: 'var(--brand-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const ofertasHabilitadas = ofertasHabilitadasCheck;
  const valorDivida = simulacao.valorDivida;

  const credorNome = contratos[0]?.empresa ?? 'credor';
  const totalDebitos = contratos.reduce((acc, c) => acc + parseFloat(c.saldoAtual || '0'), 0);
  const qtdDebitos = contratos.reduce((acc, c) => acc + parseInt(c.numeroParcelas || '0', 10), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Banner do credor ── */}
      <div style={{
        background: 'var(--brand-primary)',
        color: '#fff',
        padding: '0.9rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700,
          }}>
            {credorNome.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{credorNome}</span>
        </div>
        <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Neste contrato, você possui {qtdDebitos} débito(s) no valor de {fmtMoeda(totalDebitos)}.
        </span>
        <button style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.5)',
          color: '#fff',
          borderRadius: 6,
          padding: '0.35rem 0.9rem',
          fontSize: '0.8rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
          Ver detalhes deste contrato
        </button>
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ padding: '1.5rem 2rem', maxWidth: 1100, width: '100%', margin: '0 auto' }}>

        {/* Aviso de cessão de crédito */}
        <p style={{ fontSize: '0.8rem', color: 'var(--brand-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {primeiroPrimeiroNome(cliente.nome)}, o(s) contrato(s) abaixo, firmados com{' '}
          <strong>{credorNome}</strong>, foi(ram) cedido(s) para TW Capital S.A. - CNPJ sob nº 29.063.190/0001-78
          que deve receber seus pagamentos nos termos do artigo 290 do Código Civil Brasileiro.
        </p>

        {/* Lista de ofertas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ofertasHabilitadas.map((oferta, idx) => {
            const isMelhor = idx === 0;
            const pct = descontoPercent(oferta, valorDivida);
            const isAvista = totalParcelas(oferta) <= 1;

            return (
              <div
                key={oferta.numeroParcelas}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr auto auto auto',
                  alignItems: 'center',
                  gap: '1rem',
                  background: '#fff',
                  border: '1px solid var(--brand-border)',
                  borderRadius: 10,
                  padding: '1rem 1.25rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                {/* Etiqueta roxa */}
                <div style={{
                  background: 'var(--brand-primary)',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  color: '#fff',
                  textAlign: 'center',
                  minWidth: 150,
                }}>
                  {pct > 0 ? (
                    <>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1 }}>{pct}% de</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1 }}>desconto</div>
                    </>
                  ) : (
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                      {isAvista ? 'À Vista' : `Em até ${totalParcelas(oferta)}x`}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.85 }}>
                    {labelParcelas(oferta)}
                  </div>
                </div>

                {/* Valores */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)' }}>
                    de: <span style={{ textDecoration: pct > 0 ? 'line-through' : 'none' }}>{fmtMoeda(valorDivida)}</span> por:
                  </div>
                  {isAvista ? (
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
                      {fmtMoeda(oferta.valorTotal)}
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
                      {totalParcelas(oferta)}x de{' '}
                      <span style={{ fontSize: '1.1rem' }}>{fmtMoeda(oferta.valorParcela)}</span>
                    </div>
                  )}
                </div>

                {/* Desconto */}
                <div style={{ textAlign: 'center', minWidth: 140 }}>
                  {pct > 0 ? (
                    <>
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand-text-muted)' }}>Desconto de</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-text)' }}>
                        {fmtMoeda(oferta.descontoTotal)}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--brand-text-muted)' }}>Sem desconto</div>
                  )}
                </div>

                {/* Badge melhor oferta */}
                <div style={{ minWidth: 70, textAlign: 'center' }}>
                  {isMelhor && (
                    <div style={{
                      background: '#22c55e',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 56, height: 56,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.55rem', fontWeight: 800,
                      textAlign: 'center', lineHeight: 1.2,
                      textTransform: 'uppercase',
                    }}>
                      MELHOR<br />OFERTA
                    </div>
                  )}
                </div>

                {/* Botão */}
                <button
                  onClick={() => setModalParcelamento(oferta)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: '#fff', border: '1.5px solid var(--brand-text-muted)',
                    borderRadius: 6, padding: '0.5rem 1rem',
                    fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    color: 'var(--brand-text)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand-text)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand-text-muted)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Quero esta Opção
                </button>
              </div>
            );
          })}

          {ofertasHabilitadas.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: 10, border: `1px solid ${temAcordoAtivo ? 'var(--brand-primary)' : 'var(--brand-border)'}` }}>
              {temAcordoAtivo ? (
                <>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
                  <p style={{ fontWeight: 600, color: 'var(--brand-text)', marginBottom: '0.4rem' }}>
                    Acordo em andamento
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--brand-text-muted)', marginBottom: '1rem' }}>
                    Você já possui um acordo ativo. Clique em Meus Acordos para visualizar e pagar seus boletos.
                  </p>
                  <button
                    onClick={() => navigate('/meus-acordos')}
                    style={{
                      background: 'var(--brand-primary)', color: '#fff',
                      border: 'none', borderRadius: 8,
                      padding: '0.6rem 1.5rem', fontSize: '0.85rem',
                      fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Ver Meus Acordos
                  </button>
                </>
              ) : (
                <p style={{ color: 'var(--brand-text-muted)' }}>
                  Nenhuma proposta disponível no momento.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Link personalizar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={() => navigate('/simulador')}
            style={{
              background: 'none', border: '1px solid var(--brand-text-muted)',
              borderRadius: 6, padding: '0.45rem 1rem',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              color: 'var(--brand-text)', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Clique aqui para personalizar sua proposta
          </button>
        </div>
      </div>

      {/* Modal de dados do acordo */}
      {modalParcelamento && (
        <DadosAcordoModal
          parcelamento={modalParcelamento}
          valorDivida={valorDivida}
          onClose={() => setModalParcelamento(null)}
        />
      )}
    </div>
  );
}
