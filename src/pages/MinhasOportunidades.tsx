import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acordosApi } from '../api/acordos';
import DadosAcordoModal from '../components/ui/DadosAcordoModal';
import DetalhesContratoModal from '../components/ui/DetalhesContratoModal';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { useTracking } from '../hooks/useTracking';
import { useViewport } from '../hooks/useViewport';
import type { Parcelamento } from '../types';
import { formatCurrency, getNumeroParcelas, isParcelamentoAvista, temEntradaDiferente } from '../utils/parcelamento';

const fmtMoeda = formatCurrency;
const AVISTA_IDLE_MS = Number(import.meta.env.VITE_OPORTUNIDADES_AVISTA_IDLE_MS ?? '5000');
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

function temSituacaoAcordoAtivo(situacao: string): boolean {
  const normalizada = (situacao ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

  return ['ATIVO', 'PENDENTE', 'ABERTO', 'EM ANDAMENTO'].includes(normalizada);
}

function getCorCredor(nome: string): string {
  const normalizado = (nome ?? '').toLowerCase();
  if (normalizado.includes('vivo')) return '#6b1fb2';
  if (normalizado.includes('tim')) return '#1450ff';
  if (normalizado.includes('claro')) return '#d60f2c';
  return '#7a2fa2';
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: '#ececef',
        color: '#5f6066',
        borderRadius: 999,
        height: 28,
        padding: '0 0.9rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.72rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function getOfertaPrincipal(oferta: Parcelamento): string {
  const parcelas = getNumeroParcelas(oferta);

  if (isParcelamentoAvista(oferta)) {
    return fmtMoeda(oferta.valorParcela);
  }

  if (temEntradaDiferente(oferta)) {
    return `${fmtMoeda(oferta.valorEntrada)} + ${parcelas}x ${fmtMoeda(oferta.valorParcela)}`;
  }

  return `${parcelas}x ${fmtMoeda(oferta.valorParcela)}`;
}

function OfertaCard({
  oferta,
  valorDivida,
  credorNome,
  isMelhor,
  destacarCard,
  isMobile,
  onSelect,
}: {
  oferta: Parcelamento;
  valorDivida: string;
  credorNome: string;
  isMelhor: boolean;
  destacarCard: boolean;
  isMobile: boolean;
  onSelect: () => void;
}) {
  const pct = oferta.percentualDesconto ?? 0;
  const parcelas = getNumeroParcelas(oferta);
  const isAvista = isParcelamentoAvista(oferta);
  const corCredor = getCorCredor(credorNome);
  const valorPrincipal = getOfertaPrincipal(oferta);

  return (
    <div
      className={destacarCard ? 'animate-avista-pulse' : undefined}
      style={{
        background: '#fff',
        borderRadius: 28,
        padding: isMobile ? '1rem 0.9rem 1.1rem' : '1.15rem 1.1rem 1.2rem',
        border: destacarCard ? '2px solid #fa3650' : '1px solid #f0edf4',
        boxShadow: '0 16px 40px rgba(89, 58, 128, 0.10)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        minHeight: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.7rem' }}>
        <div style={{ color: corCredor, fontWeight: 900, fontSize: isMobile ? '1.45rem' : '1.75rem', lineHeight: 1 }}>
          {credorNome.toLowerCase()}
        </div>
        {isMelhor && (
          <div
            style={{
              background: '#eafff0',
              color: '#28a348',
              borderRadius: 999,
              padding: '0.18rem 0.55rem',
              fontSize: '0.62rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
            }}
          >
            MELHOR OFERTA
          </div>
        )}
      </div>

      <div
        style={{
          border: '1.5px solid #ff5466',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1.4fr 0.8fr' : '1.65fr 0.75fr',
          minHeight: isMobile ? 92 : 108,
        }}
      >
        <div style={{ background: '#fff', padding: isMobile ? '0.65rem 0.8rem' : '0.75rem 0.95rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.66rem', color: '#ff3950', fontWeight: 700 }}>
            sua divida de: <span style={{ textDecoration: 'line-through' }}>{fmtMoeda(valorDivida)}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#676872', marginTop: '0.28rem' }}>Por:</div>
          <div
            style={{
              fontSize: isMobile ? '1.14rem' : '1.28rem',
              color: '#6b2eae',
              fontWeight: 900,
              lineHeight: 1.18,
              marginTop: '0.15rem',
              wordBreak: 'break-word',
            }}
          >
            {valorPrincipal}
          </div>
        </div>

        <div
          style={{
            background: '#fa3650',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: isMobile ? '0.35rem' : '0.4rem',
          }}
        >
          <div style={{ textAlign: 'center', lineHeight: 1 }}>
            <div style={{ fontSize: isMobile ? '1.3rem' : '1.55rem', fontWeight: 900 }}>{pct}%</div>
            <div style={{ fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.04em' }}>DE DESCONTO</div>
          </div>
          <div style={{ position: 'absolute', right: 10, fontSize: '1.6rem', fontWeight: 300 }}>&gt;</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <BadgePill>{isAvista ? 'Parcela unica' : `Em ${parcelas}x`}</BadgePill>
        <BadgePill>Total: {fmtMoeda(oferta.valorTotal)}</BadgePill>
      </div>

      <div style={{ borderTop: '1px solid #e6e4ea', paddingTop: '0.85rem' }}>
        <button
          onClick={onSelect}
          style={{
            width: '100%',
            height: 38,
            border: 'none',
            borderRadius: 999,
            background: 'linear-gradient(180deg, #84f000 0%, #31c600 100%)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          Quero Negociar
        </button>
      </div>
    </div>
  );
}

export default function MinhasOportunidades() {
  const navigate = useNavigate();
  const { cliente, contratosDisponiveis, contratos, simulacao } = useNegociacao();
  const { track } = useTracking();
  const { isMobile, isCompact } = useViewport();
  const [modalParcelamento, setModalParcelamento] = useState<Parcelamento | null>(null);
  const [mostrarDetalhesContrato, setMostrarDetalhesContrato] = useState(false);
  const [temAcordoAtivo, setTemAcordoAtivo] = useState(false);
  const [acordosCarregados, setAcordosCarregados] = useState(false);
  const [destacarOfertaAvista, setDestacarOfertaAvista] = useState(false);
  const [mostrarTodasOfertas, setMostrarTodasOfertas] = useState(false);

  const ofertasHabilitadasCheck = simulacao?.parcelamentos.filter((p) => p.habilitado) ?? [];
  const existeOfertaAvista = ofertasHabilitadasCheck.some((p) => isParcelamentoAvista(p));

  useEffect(() => {
    if (!cliente) return;
    if (!simulacao && contratosDisponiveis.length > 1 && contratos.length === 0) {
      navigate('/selecionar-contrato');
    }
  }, [cliente, contratosDisponiveis.length, contratos.length, simulacao, navigate]);

  useEffect(() => {
    if (!cliente) return;
    track('PAGE_VIEW', { pagina: '/oportunidades' });
  }, [cliente, track]);

  useEffect(() => {
    if (!cliente || !acordosCarregados || temAcordoAtivo) return;
    if (ofertasHabilitadasCheck.length > 0) {
      track('OFERTA_VISUALIZADA', {
        pagina: '/oportunidades',
        dados: { total: ofertasHabilitadasCheck.length },
      });
    }
  }, [cliente, acordosCarregados, temAcordoAtivo, ofertasHabilitadasCheck.length, track]);

  useEffect(() => {
    if (!cliente) return;
    setAcordosCarregados(false);
    acordosApi.listarPorCliente(cliente.id).then((result) => {
      if (result.sucesso && result.data) {
        const ativo = result.data.some((a) => temSituacaoAcordoAtivo(a.situacao));
        setTemAcordoAtivo(ativo);
      }
      setAcordosCarregados(true);
    });
  }, [cliente]);

  useEffect(() => {
    if (!cliente || !acordosCarregados || temAcordoAtivo || !existeOfertaAvista || ofertasHabilitadasCheck.length === 0) {
      setDestacarOfertaAvista(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;

    function resetTimer() {
      if (timer) clearTimeout(timer);
      setDestacarOfertaAvista(false);
      timer = setTimeout(() => setDestacarOfertaAvista(true), AVISTA_IDLE_MS);
    }

    resetTimer();
    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));

    return () => {
      if (timer) clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [cliente, acordosCarregados, temAcordoAtivo, existeOfertaAvista, ofertasHabilitadasCheck.length]);

  useEffect(() => {
    setMostrarTodasOfertas(false);
  }, [simulacao]);

  if (!cliente || !simulacao) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--brand-text-muted)' }}>
        Sessao invalida.
        <button onClick={() => navigate('/')} style={{ marginLeft: 8, color: 'var(--brand-accent)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Voltar ao inicio
        </button>
      </div>
    );
  }

  const ofertasHabilitadas = acordosCarregados && !temAcordoAtivo ? ofertasHabilitadasCheck : [];
  const ofertasVisiveis = mostrarTodasOfertas ? ofertasHabilitadas : ofertasHabilitadas.slice(0, 2);
  const temMaisQueDuas = ofertasHabilitadas.length > 2;
  const valorDivida = simulacao.valorDivida;
  const credorNome = contratos[0]?.empresa ?? 'vivo';
  const contratoResumo = contratos[0];

  return (
    <div
      style={{
        padding: isMobile ? '1rem 0.85rem 1.4rem' : '1.4rem 1.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#7a2fa2', fontSize: isMobile ? '1.55rem' : '2rem', fontWeight: 900, lineHeight: 1.05 }}>
          Escolha a melhor oferta para voce
        </h1>
        
      </div>

      {contratoResumo && (
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: isMobile ? '1rem' : '1rem 1.1rem',
            border: '1px solid #f0ecf4',
            boxShadow: '0 10px 24px rgba(96, 72, 124, 0.06)',
            display: 'flex',
            alignItems: isCompact ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: '0.9rem',
            flexDirection: isCompact ? 'column' : 'row',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.76rem', color: '#6f6f77', fontWeight: 700 }}>Contrato selecionado</div>
            <div style={{ fontSize: '0.98rem', color: '#494b55', fontWeight: 800 }}>{contratoResumo.numeroContrato}</div>
            <div style={{ fontSize: '0.84rem', color: '#6f6f77' }}>
              Divida atual: <strong>{fmtMoeda(valorDivida)}</strong>
            </div>
          </div>

          <button
            onClick={() => {
              track('BOTAO_VER_DETALHES_CONTRATO', { pagina: '/oportunidades' });
              setMostrarDetalhesContrato(true);
            }}
            style={{
              height: 38,
              padding: '0 1rem',
              borderRadius: 999,
              border: '1px solid #fa3650',
              background: '#fff',
              color: '#fa3650',
              fontWeight: 800,
              cursor: 'pointer',
              width: isCompact ? '100%' : 'auto',
            }}
          >
            Ver detalhes
          </button>
        </div>
      )}

      {temAcordoAtivo && (
        <div
          style={{
            background: '#fff7e7',
            border: '1px solid #ffd08e',
            borderRadius: 20,
            padding: '1rem 1.1rem',
            display: 'flex',
            alignItems: isCompact ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexDirection: isCompact ? 'column' : 'row',
          }}
        >
          <div>
            <div style={{ color: '#9b5a03', fontSize: '1rem', fontWeight: 900 }}>Existe acordo em andamento</div>
            <div style={{ color: '#815c1d', fontSize: '0.84rem', marginTop: '0.22rem', lineHeight: 1.45 }}>
              Enquanto houver um acordo ativo, novas ofertas ficam indisponiveis para este acesso.
            </div>
          </div>
          <button
            onClick={() => navigate('/meus-acordos')}
            style={{
              height: 40,
              padding: '0 1rem',
              border: 'none',
              borderRadius: 999,
              background: '#fa3650',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              width: isCompact ? '100%' : 'auto',
            }}
          >
            Ir para Meus Acordos
          </button>
        </div>
      )}

      {!acordosCarregados && (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: '#6e6e75' }}>Carregando suas ofertas...</div>
      )}

      {acordosCarregados && !temAcordoAtivo && ofertasHabilitadas.length > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isCompact ? '1fr' : 'repeat(2, minmax(280px, 1fr))',
              gap: isMobile ? '1rem' : '1.25rem',
              alignItems: 'stretch',
              maxWidth: 1080,
              width: '100%',
              margin: '0 auto',
            }}
          >
            {ofertasVisiveis.map((oferta, idx) => {
              const isAvista = isParcelamentoAvista(oferta);
              const destacarCard = isAvista && destacarOfertaAvista;

              return (
                <OfertaCard
                  key={`${oferta.numeroParcelas}-${idx}`}
                  oferta={oferta}
                  valorDivida={valorDivida}
                  credorNome={credorNome}
                  isMelhor={idx === 0}
                  destacarCard={destacarCard}
                  isMobile={isMobile}
                  onSelect={() => {
                    track('OFERTA_SELECIONADA', {
                      pagina: '/oportunidades',
                      referencia: String(oferta.numeroParcelas),
                      dados: { valorTotal: oferta.valorTotal, numeroParcelas: oferta.numeroParcelas },
                    });
                    setModalParcelamento(oferta);
                  }}
                />
              );
            })}
          </div>

          {temMaisQueDuas && !mostrarTodasOfertas && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.1rem' }}>
              <button
                onClick={() => setMostrarTodasOfertas(true)}
                style={{
                  height: 40,
                  padding: '0 1.45rem',
                  border: 'none',
                  borderRadius: 999,
                  background: '#fa3650',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                }}
              >
                + Mostrar Mais
              </button>
            </div>
          )}
        </>
      )}

      {acordosCarregados && !temAcordoAtivo && ofertasHabilitadas.length === 0 && (
        <div
          style={{
            background: '#fff',
            borderRadius: 22,
            padding: '2rem 1.5rem',
            textAlign: 'center',
            color: '#676872',
            maxWidth: 760,
            margin: '0 auto',
            border: '1px solid #f0edf4',
          }}
        >
          Nenhuma proposta disponivel no momento.
        </div>
      )}

      {!temAcordoAtivo && acordosCarregados && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.25rem' }}>
          <button
            onClick={() => {
              track('BOTAO_PERSONALIZAR_PROPOSTA', { pagina: '/oportunidades' });
              navigate('/simulador');
            }}
            style={{
              height: 40,
              padding: '0 1.3rem',
              borderRadius: 999,
              border: '1px solid #d7d0df',
              background: '#fff',
              color: '#7a2fa2',
              fontWeight: 800,
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? 320 : 'none',
            }}
          >
            Personalizar proposta
          </button>
        </div>
      )}

      {modalParcelamento && (
        <DadosAcordoModal
          parcelamento={modalParcelamento}
          valorDivida={valorDivida}
          onClose={() => setModalParcelamento(null)}
        />
      )}

      {mostrarDetalhesContrato && (
        <DetalhesContratoModal
          contratos={contratos}
          onClose={() => setMostrarDetalhesContrato(false)}
        />
      )}
    </div>
  );
}
