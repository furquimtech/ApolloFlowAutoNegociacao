import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteApi } from '../api/cliente';
import { contratosApi } from '../api/contratos';
import { acordosApi } from '../api/acordos';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { useTheme } from '../contexts/ThemeContext';
import type { SimulacaoRequest } from '../types';

function formatCpf(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

function parseDateParts(dd: string, mm: string, yyyy: string): string {
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return '';
  return `${yyyy}-${mm}-${dd}`;
}

interface Errors {
  nome?: string;
  cpf?: string;
  email?: string;
  celular?: string;
  dd?: string;
}

export default function Identificacao() {
  const navigate = useNavigate();
  const { setCliente, setContratos, setSimulacao } = useNegociacao();
  const { theme } = useTheme();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  function validate(): boolean {
    const errs: Errors = {};
    if (!nome.trim()) errs.nome = 'Campo obrigatório';
    const rawCpf = cpf.replace(/\D/g, '');
    if (!rawCpf || rawCpf.length !== 11) errs.cpf = 'CPF inválido';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido';
    if (!celular.replace(/\D/g, '') || celular.replace(/\D/g, '').length < 10) errs.celular = 'Celular inválido';
    if (!dd || !mm || !yyyy || dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) {
      errs.dd = 'Data inválida';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    const rawCpf = cpf.replace(/\D/g, '');
    const isoDate = parseDateParts(dd, mm, yyyy);

    setLoading(true);
    try {
      const clienteResult = await clienteApi.buscarPorCpf(rawCpf);
      if (!clienteResult.sucesso || !clienteResult.data) {
        setError('Dados não encontrados. Confirme CPF e Data de Nascimento.');
        return;
      }

      const cliente = clienteResult.data;
      const apiDate = cliente.dataNascimento?.slice(0, 10);
      if (apiDate && isoDate && apiDate !== isoDate) {
        setError('Dados não encontrados. Confirme CPF e Data de Nascimento.');
        return;
      }

      const contratosResult = await contratosApi.listar(cliente.id);
      if (!contratosResult.sucesso || !contratosResult.data?.length) {
        setError('Nenhum contrato encontrado para este CPF.');
        return;
      }

      const contratos = contratosResult.data;
      const todasParcelas = contratos.flatMap((c) =>
        c.parcelas.map((p) => ({
          parcela: p.id,
          descontoPrincipal: '0',
          descontoJuros: '0',
          descontoMora: '0',
          descontoMulta: '0',
          valorDesconto: '0',
        }))
      );

      const simRequest: SimulacaoRequest = {
        cliente: cliente.id,
        negociacao: import.meta.env.VITE_NEGOCIACAO_ID,
        meioPagamento: import.meta.env.VITE_MEIO_PAGAMENTO,
        calcularDescontoParcelamento: true,
        parcelas: todasParcelas,
      };

      const simResult = await acordosApi.simular(simRequest);
      if (!simResult.sucesso || !simResult.data) {
        setError('Não foi possível calcular as propostas. Tente novamente.');
        return;
      }

      setCliente(cliente);
      setContratos(contratos);
      setSimulacao(simResult.data);
      navigate('/oportunidades');
    } catch {
      setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.9rem',
    border: '1.5px solid var(--brand-border)',
    borderRadius: 8,
    fontSize: '0.9rem',
    color: 'var(--brand-text)',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--brand-text)',
    display: 'block',
    marginBottom: '0.3rem',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    color: '#ef4444',
    marginTop: '0.2rem',
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: 'calc(100vh - 64px - 68px)',
    }}>
      {/* ── Coluna esquerda: decorativa ── */}
      <div style={{
        background: 'var(--brand-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        minHeight: 500,
      }}>
        <img
          src={theme.logoUrl}
          alt={theme.companyName}
          style={{ maxWidth: '70%', maxHeight: 300, objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* ── Coluna direita: formulário ── */}
      <div style={{
        background: '#fff',
        padding: '2.5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '1.25rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--brand-text)', lineHeight: 1.2 }}>
            Consulte aqui a melhor
          </h2>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--brand-text)', lineHeight: 1.2 }}>
            proposta para você
          </h2>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '0.75rem 1rem',
            color: '#dc2626', fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Nome */}
          <div>
            <label style={labelStyle}>Nome:</label>
            <input
              style={{ ...inputStyle, borderColor: errors.nome ? '#ef4444' : 'var(--brand-border)' }}
              type="text"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
            />
            {errors.nome && <p style={errorStyle}>{errors.nome}</p>}
          </div>

          {/* CPF */}
          <div>
            <label style={labelStyle}>CPF:</label>
            <input
              style={{ ...inputStyle, borderColor: errors.cpf ? '#ef4444' : 'var(--brand-border)' }}
              type="text"
              inputMode="numeric"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              autoComplete="off"
            />
            {errors.cpf && <p style={errorStyle}>{errors.cpf}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>email:</label>
            <input
              style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : 'var(--brand-border)' }}
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          {/* Celular */}
          <div>
            <label style={labelStyle}>Celular:</label>
            <input
              style={{ ...inputStyle, borderColor: errors.celular ? '#ef4444' : 'var(--brand-border)' }}
              type="text"
              inputMode="tel"
              placeholder="Digite seu Celular"
              value={celular}
              onChange={(e) => setCelular(formatPhone(e.target.value))}
              autoComplete="tel"
            />
            {errors.celular && <p style={errorStyle}>{errors.celular}</p>}
          </div>

          {/* Data de Nascimento — 3 campos */}
          <div>
            <label style={labelStyle}>Data de Nascimento:</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, width: 70, textAlign: 'center', borderColor: errors.dd ? '#ef4444' : 'var(--brand-border)' }}
                type="text"
                inputMode="numeric"
                placeholder="DD"
                maxLength={2}
                value={dd}
                onChange={(e) => setDd(e.target.value.replace(/\D/g, '').slice(0, 2))}
              />
              <input
                style={{ ...inputStyle, width: 70, textAlign: 'center', borderColor: errors.dd ? '#ef4444' : 'var(--brand-border)' }}
                type="text"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                value={mm}
                onChange={(e) => setMm(e.target.value.replace(/\D/g, '').slice(0, 2))}
              />
              <input
                style={{ ...inputStyle, width: 100, textAlign: 'center', borderColor: errors.dd ? '#ef4444' : 'var(--brand-border)' }}
                type="text"
                inputMode="numeric"
                placeholder="AAAA"
                maxLength={4}
                value={yyyy}
                onChange={(e) => setYyyy(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
            {errors.dd && <p style={errorStyle}>{errors.dd}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.25rem',
              padding: '0.75rem',
              background: loading ? 'var(--brand-primary)' : 'var(--brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s',
            }}
          >
            {loading && (
              <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            )}
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </form>
      </div>
    </div>
  );
}
