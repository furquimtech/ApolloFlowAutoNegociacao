import { useEffect, useState } from 'react';
import { acordosApi } from '../../api/acordos';
import { useNegociacao } from '../../contexts/NegociacaoContext';
import { useTracking } from '../../hooks/useTracking';
import { useViewport } from '../../hooks/useViewport';
import type { EfetivarRequest, Parcelamento } from '../../types';
import { formatCurrency, getNumeroParcelas, isParcelamentoAvista, temEntradaDiferente } from '../../utils/parcelamento';
import SuccessPopup from './SuccessPopup';

interface Props {
  parcelamento: Parcelamento;
  valorDivida: string;
  onClose: () => void;
}

const fmtMoeda = formatCurrency;

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DadosAcordoModal({ parcelamento, valorDivida, onClose }: Props) {
  const { cliente } = useNegociacao();
  const { track } = useTracking();
  const { isMobile } = useViewport();

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

    return () => {
      document.body.style.overflow = '';
    };
  }, [parcelamento.numeroParcelas, parcelamento.valorTotal, track]);

  const totalDisplay = getNumeroParcelas(parcelamento);
  const isAvista = isParcelamentoAvista(parcelamento);
  const entradaDiferente = temEntradaDiferente(parcelamento);

  async function handleConfirmar() {
    if (!aceitouTermos) {
      setErro('Voce precisa aceitar os termos para confirmar o acordo.');
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
        setErro(result.mensagem || 'Nao foi possivel confirmar o acordo.');
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
        subtitulo="Pague em dia para evitar perder as condicoes desse acordo"
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
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        animation: 'fadeInBackdrop 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 28,
          width: isMobile ? '94%' : '90%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUpModal 0.25s ease',
          boxShadow: '0 22px 60px rgba(48, 26, 82, 0.24)',
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
          Dados do Acordo
        </div>

        <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem', background: '#fcfbfe' }}>
            <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Valor da Divida</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fa3650' }}>{fmtMoeda(valorDivida)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83', marginBottom: '0.3rem' }}>Quantidade de parcelas</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#4f5058',
                }}
              >
                {isAvista ? '1X (A vista)' : `${totalDisplay}X`}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7b7c83" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83', marginBottom: '0.3rem' }}>Escolha a data de vencimento</div>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: '#4f5058',
                  background: 'transparent',
                  width: '100%',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {entradaDiferente && (
            <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Valor da Entrada</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f5058' }}>{fmtMoeda(parcelamento.valorEntrada)}</div>
            </div>
          )}

          <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>{isAvista ? 'Valor do Acordo' : 'Valor da Parcela'}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f5058' }}>{fmtMoeda(parcelamento.valorParcela)}</div>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: '0.85rem 1rem',
              background: 'linear-gradient(90deg, #bbf7d0 0%, #86efac 100%)',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#166534' }}>Desconto</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>{fmtMoeda(parcelamento.descontoTotal || '0')}</div>
          </div>

          <div style={{ border: '1px solid #ffd7de', borderRadius: 18, padding: '0.9rem 1rem', background: '#fff7f8' }}>
            <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Total a pagar</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fa3650' }}>{fmtMoeda(parcelamento.valorTotal)}</div>
          </div>

          <div
            style={{
              border: '1px solid #eee7f3',
              borderRadius: 18,
              padding: '0.95rem 1rem',
              background: '#faf8fc',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4f5058', marginBottom: '0.4rem' }}>TERMO DE ACEITE:</div>
            <div style={{ fontSize: '0.7rem', color: '#7b7c83', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto' }}>
              <strong>Renegociacao da Divida:</strong>
              <br />
              1.1. As partes concordam que o valor total da divida sera renegociado em carater de excecao no valor de{' '}
              {fmtMoeda(parcelamento.valorTotal)}, a ser pago da seguinte forma: {isAvista ? 'pagamento a vista' : `${totalDisplay} parcelas`}.
              A forma de pagamento sera Boleto. Os boletos referentes as demais parcelas do acordo serao enviados por email.
            </div>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#4f5058',
            }}
          >
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#fa3650' }}
            />
            Li e aceito os termos desse acordo.
          </label>

          {erro && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '0.6rem 0.9rem', color: '#dc2626', fontSize: '0.82rem' }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexDirection: isMobile ? 'column' : 'row' }}>
            <button
              onClick={() => {
                track('BOTAO_VOLTAR_MODAL_ACORDO', { pagina: '/oportunidades', referencia: String(parcelamento.numeroParcelas) });
                onClose();
              }}
              style={{
                flex: 1,
                padding: '0.78rem',
                background: '#fff',
                border: '1.5px solid #eadff2',
                borderRadius: 999,
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                color: '#7a2fa2',
              }}
            >
              Voltar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={loading}
              style={{
                flex: 2,
                padding: '0.78rem',
                background: '#fa3650',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                fontSize: '0.9rem',
                fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              {loading && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }}
                />
              )}
              {loading ? 'Confirmando...' : 'Confirmar Acordo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
