import { useState, useEffect } from 'react';
import { useNegociacao } from '../../contexts/NegociacaoContext';
import { acordosApi } from '../../api/acordos';
import { useTracking } from '../../hooks/useTracking';
import SuccessPopup from './SuccessPopup';
import type { Parcelamento, EfetivarRequest } from '../../types';

interface Props {
  parcelamento: Parcelamento;
  valorDivida: string;
  onClose: () => void;
}

function fmtMoeda(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function totalParcelas(p: Parcelamento): number {
  return p.parcelas.length;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DadosAcordoModal({ parcelamento, valorDivida, onClose }: Props) {
  const { cliente } = useNegociacao();
  const { track } = useTracking();

  const minDate = parcelamento.dataVencimentoMin || parcelamento.dataVencimento || hoje();
  const maxDate = parcelamento.dataVencimentoMax || parcelamento.dataVencimento || hoje();

  const [dataVencimento, setDataVencimento] = useState(minDate);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    track('ACORDO_INICIADO', {
      pagina: '/oportunidades',
      referencia: String(parcelamento.numeroParcelas),
      dados: { valorTotal: parcelamento.valorTotal, numeroParcelas: parcelamento.numeroParcelas },
    });
    return () => { document.body.style.overflow = ''; };
  }, []);

  const totalDisplay = totalParcelas(parcelamento);
  const isAvista = totalDisplay <= 1;

  async function handleConfirmar() {
    if (!aceitouTermos) {
      setErro('Você precisa aceitar os termos para confirmar o acordo.');
      return;
    }
    if (!cliente) return;

    setErro('');
    setLoading(true);
    try {
      const parcelas = parcelamento.descontos.map((d) => ({
        parcela: d.parcela,
        descontoPrincipal: d.descontoPrincipal,
        descontoJuros: d.descontoJuros,
        descontoPermanencia: d.descontoPermanencia,
        descontoMora: d.descontoMora,
        descontoMulta: d.descontoMulta,
        descontoOutros: d.descontoOutros,
        valorDesconto: d.valorDesconto,
      }));

      const request: EfetivarRequest = {
        cliente: cliente.id,
        negociacao: import.meta.env.VITE_NEGOCIACAO_ID,
        meioPagamento: import.meta.env.VITE_MEIO_PAGAMENTO,
        observacao: 'Portal TW Capital',
        parcelas,
        parcelamento: {
          numeroParcelas: parcelamento.numeroParcelas,
          valorEntrada: parcelamento.valorEntrada,
          dataEmissao: parcelamento.dataEmissao || hoje(),
          dataVencimento,
          descontoDivida: parcelamento.descontoDivida,
          taxaOperacao: parcelamento.taxaOperacao || '0.00',
          descontoTarifa: parcelamento.descontoTarifa || '0.00',
        },
      };

      const result = await acordosApi.efetivar(request);
      if (!result.sucesso) {
        setErro(result.mensagem || 'Não foi possível confirmar o acordo.');
        return;
      }
      await track('ACORDO_CONFIRMADO', {
        pagina: '/oportunidades',
        referencia: String(parcelamento.numeroParcelas),
        dados: { valorTotal: parcelamento.valorTotal, numeroParcelas: parcelamento.numeroParcelas },
      });
      setSucesso(true);
    } catch {
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <SuccessPopup
        titulo="Seu acordo foi realizado."
        subtitulo="Pague em dia para evitar perder as condições desse acordo"
        botaoLabel="Ver meus acordos"
        destino="/meus-acordos"
        onClose={onClose}
      />
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
        animation: 'fadeInBackdrop 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          width: '90%', maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUpModal 0.25s ease',
        }}
      >
        {/* Cabeçalho roxo */}
        <div style={{
          background: 'var(--brand-primary)',
          color: '#fff',
          borderRadius: '16px 16px 0 0',
          padding: '1rem 1.5rem',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1rem',
        }}>
          Dados do Acordo
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Valor da Dívida */}
          <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)' }}>Valor da Dívida</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-accent)' }}>{fmtMoeda(valorDivida)}</div>
          </div>

          {/* Parcelas + Data */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)', marginBottom: '0.3rem' }}>Quantidade de parcelas</div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontWeight: 700, fontSize: '0.95rem',
              }}>
                {isAvista ? '1X (À vista)' : `${totalDisplay}X`}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-text-muted)" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)', marginBottom: '0.3rem' }}>Escolha a data de vencimento</div>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                style={{
                  border: 'none', outline: 'none',
                  fontWeight: 700, fontSize: '0.9rem',
                  color: 'var(--brand-text)', background: 'transparent',
                  width: '100%', cursor: 'pointer', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Valor da Parcela */}
          <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)' }}>Valor da Parcela</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-text)' }}>
              {isAvista ? fmtMoeda(parcelamento.valorTotal) : fmtMoeda(parcelamento.valorParcela)}
            </div>
          </div>

          {/* Desconto */}
          <div style={{
            borderRadius: 8, padding: '0.75rem 1rem',
            background: 'linear-gradient(90deg, #bbf7d0 0%, #86efac 100%)',
          }}>
            <div style={{ fontSize: '0.78rem', color: '#166534' }}>Desconto</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>
              {fmtMoeda(parcelamento.descontoTotal || '0')}
            </div>
          </div>

          {/* Total a pagar */}
          <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)' }}>Total a pagar</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-accent)' }}>
              {fmtMoeda(parcelamento.valorTotal)}
            </div>
          </div>

          {/* Termo de aceite */}
          <div style={{
            border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.9rem 1rem',
            background: 'var(--brand-bg)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-text)', marginBottom: '0.4rem' }}>
              TERMO DE ACEITE:
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--brand-text-muted)', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto' }}>
              <strong>Renegociação da Dívida:</strong><br />
              1.1. As partes concordam que o valor total da dívida será renegociado em caráter de exceção
              no valor de {fmtMoeda(parcelamento.valorTotal)}, a ser pago da seguinte forma: {isAvista ? 'pagamento à vista' : `${totalDisplay} parcelas`}.
              A forma de pagamento será Boleto. Os boletos referentes às demais parcelas do acordo serão enviados por email.
            </div>
          </div>

          {/* Checkbox */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
            color: 'var(--brand-text)',
          }}>
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
            />
            Li e aceito os termos desse acordo.
          </label>

          {erro && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#dc2626', fontSize: '0.82rem' }}>
              {erro}
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              onClick={() => { track('BOTAO_VOLTAR_MODAL_ACORDO', { pagina: '/oportunidades', referencia: String(parcelamento.numeroParcelas) }); onClose(); }}
              style={{
                flex: 1, padding: '0.7rem',
                background: '#fff', border: '1.5px solid var(--brand-border)',
                borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', color: 'var(--brand-text)',
              }}
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={loading}
              style={{
                flex: 2, padding: '0.7rem',
                background: 'var(--brand-primary)', color: '#fff',
                border: 'none', borderRadius: 8,
                fontSize: '0.9rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              }}
            >
              {loading && (
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              )}
              {loading ? 'Confirmando...' : 'Confirmar Acordo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
