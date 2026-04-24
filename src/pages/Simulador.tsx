import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { acordosApi } from '../api/acordos';
import { propostasApi } from '../api/propostas';
import { useTracking } from '../hooks/useTracking';
import { useViewport } from '../hooks/useViewport';
import SuccessPopup from '../components/ui/SuccessPopup';
import type { EfetivarRequest, Parcelamento } from '../types';
import { formatCurrency, getNumeroParcelas, isParcelamentoAvista, temEntradaDiferente } from '../utils/parcelamento';

const fmtMoeda = formatCurrency;

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateForInput(value: string): string {
  const iso = value?.slice(0, 10);
  if (!iso || !iso.includes('-')) return '';
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function formatTypedDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseTypedDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length !== 8) return '';
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
}

export default function Simulador() {
  const navigate = useNavigate();
  const { cliente, simulacao } = useNegociacao();
  const { track } = useTracking();
  const { isMobile } = useViewport();

  const todosParcelamentos = simulacao?.parcelamentos ?? [];
  const [idxSelecionado, setIdxSelecionado] = useState(0);
  const [parcelasDigitadas, setParcelasDigitadas] = useState('');
  const [dataVencimentoDigitada, setDataVencimentoDigitada] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (cliente) track('PAGE_VIEW', { pagina: '/simulador' });
  }, [cliente, track]);

  const parcelamento: Parcelamento = todosParcelamentos[idxSelecionado] ?? todosParcelamentos[0];
  const minDate = parcelamento?.dataVencimentoMin || hoje();
  const maxDate = parcelamento?.dataVencimentoMax || hoje();

  useEffect(() => {
    if (!parcelamento) return;
    setParcelasDigitadas(String(getNumeroParcelas(parcelamento)));
    setDataVencimentoDigitada(formatDateForInput(minDate));
  }, [idxSelecionado, minDate, parcelamento]);

  const dataSelecionada = useMemo(
    () => parseTypedDate(dataVencimentoDigitada) || minDate,
    [dataVencimentoDigitada, minDate]
  );

  if (!cliente || !simulacao || !parcelamento) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--brand-text-muted)' }}>
        Sessao invalida.
        <button
          onClick={() => navigate('/')}
          style={{ color: 'var(--brand-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginLeft: 6 }}
        >
          Voltar ao inicio
        </button>
      </div>
    );
  }

  const simulacaoAtual = simulacao;

  function handleChangeParcela(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 2);
    setParcelasDigitadas(digits);

    if (!digits) return;

    const totalParcelasDigitado = Number(digits);

    const novoIndice = todosParcelamentos.findIndex((p) => getNumeroParcelas(p) === totalParcelasDigitado);
    if (novoIndice >= 0) {
      setIdxSelecionado(novoIndice);
      setErro('');
    }
  }

  function validarDadosDigitados(): boolean {
    const totalParcelasDigitado = Number(parcelasDigitadas);
    const parcelamentoEncontrado = todosParcelamentos.find((p) => getNumeroParcelas(p) === totalParcelasDigitado);

    if (!parcelamentoEncontrado) {
      setErro('Digite uma quantidade de parcelas disponivel para a proposta.');
      return false;
    }

    const dataDigitadaIso = parseTypedDate(dataVencimentoDigitada);
    if (!dataDigitadaIso) {
      setErro('Digite uma data de vencimento valida no formato DD/MM/AAAA.');
      return false;
    }

    if (dataDigitadaIso < minDate || dataDigitadaIso > maxDate) {
      setErro(`A data de vencimento deve ficar entre ${formatDateForInput(minDate)} e ${formatDateForInput(maxDate)}.`);
      return false;
    }

    const indiceEncontrado = todosParcelamentos.findIndex((p) => getNumeroParcelas(p) === totalParcelasDigitado);
    if (indiceEncontrado !== idxSelecionado) {
      setIdxSelecionado(indiceEncontrado);
    }

    return true;
  }

  async function handleEnviar() {
    if (!parcelamento || !cliente) return;
    if (!validarDadosDigitados()) return;

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
        observacao: 'Proposta Portal TW Capital',
        parcelas,
        parcelamento: {
          numeroParcelas: parcelamento.numeroParcelas,
          valorEntrada: parcelamento.valorEntrada,
          dataEmissao: parcelamento.dataEmissao || hoje(),
          dataVencimento: dataSelecionada,
          descontoDivida: parcelamento.descontoDivida,
          taxaOperacao: parcelamento.taxaOperacao || '0.00',
          descontoTarifa: parcelamento.descontoTarifa || '0.00',
        },
      };

      const fn = simulacaoAtual.permiteProposta ? propostasApi.efetivar : acordosApi.efetivar;
      const result = await fn(request);

      if (!result.sucesso) {
        setErro(result.mensagem || 'Nao foi possivel enviar a proposta.');
        return;
      }

      await track('SIMULACAO_PERSONALIZADA', {
        pagina: '/simulador',
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

  const isAvista = isParcelamentoAvista(parcelamento);
  const entradaDiferente = temEntradaDiferente(parcelamento);

  if (sucesso) {
    return (
      <SuccessPopup
        titulo="Recebemos sua Proposta."
        subtitulo="Entraremos em contato com voce para finalizar o acordo."
        botaoLabel="Ver meus acordos"
        destino="/meus-acordos"
        onClose={() => navigate('/meus-acordos')}
      />
    );
  }

  return (
    <div style={{ padding: isMobile ? '1rem 0.75rem 1.5rem' : '1.5rem 1rem 2rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 620 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.1rem' }}>
          <h1 style={{ margin: 0, color: '#7a2fa2', fontSize: isMobile ? '1.45rem' : '1.9rem', fontWeight: 900 }}>
            Monte sua proposta
          </h1>
          <p style={{ margin: '0.45rem 0 0', color: '#676872', fontSize: isMobile ? '0.86rem' : '0.95rem' }}>
            Ajuste parcelas e vencimento para encontrar a melhor condicao para voce.
          </p>
        </div>
        <div
          style={{
            background: '#fff',
            border: '1px solid #f0ebf4',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 18px 40px rgba(89, 58, 128, 0.10)',
          }}
        >
          <div
            style={{
              background: '#fa3650',
              color: '#fff',
              padding: isMobile ? '1rem 1.1rem' : '1.15rem 1.5rem',
              fontWeight: 900,
              fontSize: isMobile ? '1rem' : '1.05rem',
              textAlign: 'center',
            }}
          >
            Faca sua proposta agora:
          </div>

          <div style={{ padding: isMobile ? '1rem' : '1.35rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.95rem 1.05rem', background: '#fcfbfe' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Valor da Divida</div>
              <div style={{ fontSize: '1.22rem', fontWeight: 900, color: '#fa3650' }}>
                {fmtMoeda(simulacaoAtual.valorDivida)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem', background: '#fff' }}>
                <div style={{ fontSize: '0.78rem', color: '#7b7c83', marginBottom: '0.3rem' }}>
                  Quantidade de parcelas
                </div>
                <input
                  list="parcelas-disponiveis"
                  type="text"
                  inputMode="numeric"
                  value={parcelasDigitadas}
                  onChange={(e) => handleChangeParcela(e.target.value)}
                  placeholder="Digite as parcelas"
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: '#4f5058',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
                <datalist id="parcelas-disponiveis">
                  {todosParcelamentos.map((p, idx) => {
                    const count = getNumeroParcelas(p);
                    return (
                      <option key={idx} value={String(count)}>
                        {count === 0 ? 'a vista' : `${count} parcelas`}
                      </option>
                    );
                  })}
                </datalist>
              </div>

              <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem', background: '#fff' }}>
                <div style={{ fontSize: '0.78rem', color: '#7b7c83', marginBottom: '0.3rem' }}>
                  Escolha a data de vencimento
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={dataVencimentoDigitada}
                  onChange={(e) => setDataVencimentoDigitada(formatTypedDate(e.target.value))}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#4f5058',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {entradaDiferente && (
              <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem', background: '#fff' }}>
                <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Valor da Entrada</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f5058' }}>
                  {fmtMoeda(parcelamento.valorEntrada)}
                </div>
              </div>
            )}

            <div style={{ border: '1px solid #eee7f3', borderRadius: 18, padding: '0.9rem 1rem', background: '#fff' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>
                {isAvista ? 'Valor do Acordo' : 'Valor da Parcela'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f5058' }}>
                {fmtMoeda(parcelamento.valorParcela)}
              </div>
            </div>

            <div
              style={{
                borderRadius: 8,
                padding: '0.75rem 1rem',
                background: 'linear-gradient(90deg, #bbf7d0 0%, #86efac 100%)',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#166534' }}>Desconto</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>
                {fmtMoeda(parcelamento.descontoTotal || '0')}
              </div>
            </div>

            <div style={{ border: '1px solid #ffd7de', borderRadius: 18, padding: '0.9rem 1rem', background: '#fff7f8' }}>
              <div style={{ fontSize: '0.78rem', color: '#7b7c83' }}>Total a pagar</div>
              <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#fa3650' }}>
                {fmtMoeda(parcelamento.valorTotal)}
              </div>
            </div>

            {erro && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: 8,
                  padding: '0.6rem 0.9rem',
                  color: '#dc2626',
                  fontSize: '0.82rem',
                }}
              >
                {erro}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => navigate('/oportunidades')}
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
                onClick={handleEnviar}
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
                {loading ? 'Enviando...' : 'Enviar Proposta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
