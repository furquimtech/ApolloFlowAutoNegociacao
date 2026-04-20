import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { acordosApi } from '../api/acordos';
import { propostasApi } from '../api/propostas';
import SuccessPopup from '../components/ui/SuccessPopup';
import type { EfetivarRequest, Parcelamento } from '../types';

function fmtMoeda(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Simulador() {
  const navigate = useNavigate();
  const { cliente, simulacao } = useNegociacao();

  const todosParcelamentos = simulacao?.parcelamentos ?? [];
  const [idxSelecionado, setIdxSelecionado] = useState(0);
  const [dataVencimento, setDataVencimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  if (!cliente || !simulacao) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--brand-text-muted)' }}>
        Sessão inválida.{' '}
        <button onClick={() => navigate('/')} style={{ color: 'var(--brand-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const parcelamento: Parcelamento = todosParcelamentos[idxSelecionado] ?? todosParcelamentos[0];
  const minDate = parcelamento?.dataVencimentoMin || hoje();
  const maxDate = parcelamento?.dataVencimentoMax || hoje();
  const dataSelecionada = dataVencimento || minDate;

  function handleChangeParcela(e: React.ChangeEvent<HTMLSelectElement>) {
    setIdxSelecionado(Number(e.target.value));
    setDataVencimento('');
  }

  async function handleEnviar() {
    if (!parcelamento || !cliente) return;
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

      const fn = simulacao!.permiteProposta ? propostasApi.efetivar : acordosApi.efetivar;
      const result = await fn(request);

      if (!result.sucesso) {
        setErro(result.mensagem || 'Não foi possível enviar a proposta.');
        return;
      }
      setSucesso(true);
    } catch {
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const totalParcelas = parcelamento?.parcelas.length ?? 1;
  const isAvista = totalParcelas <= 1;

  if (sucesso) {
    return (
      <SuccessPopup
        titulo="Recebemos sua Proposta."
        subtitulo="Entraremos em contato com você para finalizar o acordo."
        botaoLabel="Ver meus acordos"
        destino="/meus-acordos"
        onClose={() => navigate('/meus-acordos')}
      />
    );
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{
          background: '#fff',
          border: '1px solid var(--brand-border)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: 'var(--brand-shadow)',
        }}>
          {/* Header roxo */}
          <div style={{
            background: 'var(--brand-primary)', color: '#fff',
            padding: '1rem 1.5rem', fontWeight: 700, fontSize: '1rem', textAlign: 'center',
          }}>
            Faça sua proposta agora:
          </div>

          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Valor da Dívida */}
            <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)' }}>Valor da Dívida</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-accent)' }}>
                {fmtMoeda(simulacao.valorDivida)}
              </div>
            </div>

            {/* Quantidade de parcelas + Data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)', marginBottom: '0.3rem' }}>Quantidade de parcelas</div>
                <select
                  value={idxSelecionado}
                  onChange={handleChangeParcela}
                  style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-text)',
                    width: '100%', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {todosParcelamentos.map((p, idx) => {
                    const count = p.parcelas.length;
                    const label = count <= 1 ? '1X (À vista)' : `${count}X`;
                    return (
                      <option key={idx} value={idx}>{label}</option>
                    );
                  })}
                </select>
              </div>

              <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)', marginBottom: '0.3rem' }}>Escolha a data de vencimento</div>
                <input
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={dataVencimento || minDate}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  style={{
                    border: 'none', outline: 'none', background: 'transparent',
                    fontWeight: 700, fontSize: '0.85rem', color: 'var(--brand-text)',
                    width: '100%', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Valor da Parcela */}
            <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)' }}>Valor da Parcela</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-text)' }}>
                {isAvista ? fmtMoeda(parcelamento?.valorTotal) : fmtMoeda(parcelamento?.valorParcela)}
              </div>
            </div>

            {/* Desconto */}
            <div style={{
              borderRadius: 8, padding: '0.75rem 1rem',
              background: 'linear-gradient(90deg, #bbf7d0 0%, #86efac 100%)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#166534' }}>Desconto</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#15803d' }}>
                {fmtMoeda(parcelamento?.descontoTotal || '0')}
              </div>
            </div>

            {/* Total a pagar */}
            <div style={{ border: '1px solid var(--brand-border)', borderRadius: 8, padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-text-muted)' }}>Total a pagar</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-accent)' }}>
                {fmtMoeda(parcelamento?.valorTotal)}
              </div>
            </div>

            {erro && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.6rem 0.9rem', color: '#dc2626', fontSize: '0.82rem' }}>
                {erro}
              </div>
            )}

            {/* Ações */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/oportunidades')}
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
                onClick={handleEnviar}
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
                {loading ? 'Enviando...' : 'Enviar Proposta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
