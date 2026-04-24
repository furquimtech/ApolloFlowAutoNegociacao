import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteApi } from '../api/cliente';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { useViewport } from '../hooks/useViewport';

function formatCpf(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeAddress(value: {
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}): string {
  return [
    value.endereco.trim().toLowerCase(),
    value.numero.trim().toLowerCase(),
    value.complemento.trim().toLowerCase(),
    value.bairro.trim().toLowerCase(),
    value.cidade.trim().toLowerCase(),
    value.uf.trim().toLowerCase(),
    value.cep.replace(/\D/g, ''),
  ].join('|');
}

export default function MeusDados() {
  const navigate = useNavigate();
  const { cliente } = useNegociacao();
  const { isMobile } = useViewport();
  const emailInicial = cliente?.emails?.find((item) => item.principal) ?? cliente?.emails?.[0];
  const telefoneInicial = cliente?.telefones?.find((item) => item.principal) ?? cliente?.telefones?.find((item) => item.tipo === 'CELULAR') ?? cliente?.telefones?.[0];
  const enderecoInicial = cliente?.enderecos?.find((item) => item.principal) ?? cliente?.enderecos?.[0];
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: cliente?.nome ?? '',
    cpf: formatCpf(cliente?.cic ?? ''),
    endereco: enderecoInicial?.logradouro ?? '',
    bairro: enderecoInicial?.bairro ?? '',
    numero: enderecoInicial?.numero ?? '',
    complemento: enderecoInicial?.complemento ?? '',
    cidade: enderecoInicial?.cidade ?? '',
    uf: enderecoInicial?.uf ?? '',
    cep: enderecoInicial?.cep ?? '',
    email: emailInicial?.email ?? '',
    telefone: telefoneInicial ? formatPhone(`${telefoneInicial.ddd}${telefoneInicial.telefone}`) : '',
  });
  const telefonesExistentes = (cliente?.telefones ?? []).map((item) => normalizePhone(`${item.ddd}${item.telefone}`));
  const emailsExistentes = (cliente?.emails ?? []).map((item) => normalizeEmail(item.email));
  const enderecosExistentes = (cliente?.enderecos ?? []).map((item) =>
    normalizeAddress({
      endereco: item.logradouro,
      numero: item.numero,
      complemento: item.complemento ?? '',
      bairro: item.bairro,
      cidade: item.cidade,
      uf: item.uf,
      cep: item.cep,
    })
  );

  function update<K extends keyof typeof form>(field: K, value: string) {
    setSalvo(false);
    setErro('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSalvar() {
    if (!cliente) return;

    setLoading(true);
    setSalvo(false);
    setErro('');

    try {
      const operacoes: Promise<unknown>[] = [];
      const telefoneNormalizado = normalizePhone(form.telefone);
      const emailNormalizado = normalizeEmail(form.email);
      const enderecoNormalizado = normalizeAddress(form);

      if (telefoneNormalizado.length >= 10 && !telefonesExistentes.includes(telefoneNormalizado)) {
        operacoes.push(clienteApi.adicionarTelefone(cliente.id, form.telefone));
      }

      if (emailNormalizado && !emailsExistentes.includes(emailNormalizado)) {
        operacoes.push(clienteApi.adicionarEmail(cliente.id, form.email.trim()));
      }

      const enderecoPreenchido = form.endereco.trim() && form.numero.trim() && form.cidade.trim() && form.uf.trim();
      if (enderecoPreenchido && !enderecosExistentes.includes(enderecoNormalizado)) {
        operacoes.push(
          clienteApi.adicionarEndereco(cliente.id, {
            cep: form.cep,
            complemento: form.complemento,
            logradouro: form.endereco,
            bairro: form.bairro,
            cidade: form.cidade,
            numero: form.numero,
            tipoLogradouro: 'Rua',
            uf: form.uf,
          })
        );
      }

      if (operacoes.length === 0) {
        setErro('Nenhum dado novo foi identificado para salvar.');
        return;
      }

      const resultados = await Promise.all(operacoes);
      const falha = resultados.find((resultado) => {
        const typed = resultado as { sucesso?: boolean; mensagem?: string };
        return typed.sucesso === false;
      }) as { sucesso?: boolean; mensagem?: string } | undefined;

      if (falha) {
        setErro(falha.mensagem || 'Nao foi possivel salvar os dados.');
        return;
      }

      setSalvo(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: isMobile ? '1rem 0.75rem 1.5rem' : '1.35rem 1rem 2rem', width: '100%', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '120px 1fr', alignItems: 'start', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            justifySelf: 'start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'none',
            border: 'none',
            color: '#7a2fa2',
            fontWeight: 800,
            cursor: 'pointer',
            padding: 0,
            marginBottom: isMobile ? '0.75rem' : 0,
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>‹</span>
          Voltar
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, color: '#7a2fa2', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900 }}>Meus dados</h1>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #f0ebf4',
          borderRadius: 28,
          boxShadow: '0 18px 40px rgba(89, 58, 128, 0.08)',
          padding: isMobile ? '1.2rem 1rem' : '1.6rem 1.8rem 1.8rem',
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '1.3rem' }}>
          <div style={{ color: '#fa3650', fontSize: isMobile ? '1.3rem' : '1.55rem', fontWeight: 900 }}>Mantenha seus dados atualizados</div>
          <div style={{ color: '#66666d', fontSize: '0.88rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Manter os dados atualizados e importante para o recebimento do boleto, avisos e lembretes.
          </div>
        </div>

        {salvo && (
          <div style={{ marginBottom: '1rem', background: '#edfdf2', border: '1px solid #b7ebc7', borderRadius: 12, padding: '0.8rem 0.9rem', color: '#1f7a38', fontSize: '0.84rem' }}>
            Dados enviados com sucesso.
          </div>
        )}

        {erro && (
          <div style={{ marginBottom: '1rem', background: '#fff1f3', border: '1px solid #ffc7cf', borderRadius: 12, padding: '0.8rem 0.9rem', color: '#d81f39', fontSize: '0.84rem' }}>
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Campo label="Nome Completo">
            <Input value={form.nome} onChange={(value) => update('nome', value)} placeholder="Seu nome completo" />
          </Campo>

          <Campo label="CPF">
            <Input value={form.cpf} onChange={(value) => update('cpf', formatCpf(value))} placeholder="000.000.000-00" />
          </Campo>

          <Campo label="Endereco">
            <Input value={form.endereco} onChange={(value) => update('endereco', value)} placeholder="Av." />
          </Campo>

          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.7rem' }}>
            <Input value={form.numero} onChange={(value) => update('numero', value)} placeholder="n°" />
            <Input value={form.complemento} onChange={(value) => update('complemento', value)} placeholder="Complemento" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr 1fr', gap: '0.7rem' }}>
            <Input value={form.bairro} onChange={(value) => update('bairro', value)} placeholder="Bairro" />
            <Input value={form.cidade} onChange={(value) => update('cidade', value)} placeholder="Cidade" />
            <Input value={form.uf} onChange={(value) => update('uf', value.toUpperCase().slice(0, 2))} placeholder="UF" />
            <Input value={form.cep} onChange={(value) => update('cep', value)} placeholder="CEP" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MiniButton label="Adicionar novo endereco" />
          </div>

          <Campo label="E-mail">
            <Input value={form.email} onChange={(value) => update('email', value)} placeholder="seuemail@seuemail.com" />
          </Campo>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MiniButton label="Adicionar novo e-mail" />
          </div>

          <Campo label="Telefone">
            <Input value={form.telefone} onChange={(value) => update('telefone', formatPhone(value))} placeholder="(00) 00000-0000" />
          </Campo>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MiniButton label="Adicionar novo telefone" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.4rem' }}>
          <button
            onClick={handleSalvar}
            style={{
              minWidth: 116,
              height: 40,
              border: 'none',
              borderRadius: 999,
              background: '#fa3650',
              color: '#fff',
              fontWeight: 900,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.72 : 1,
            }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <p style={{ margin: '1rem 0 0', color: '#7a7b82', fontSize: '0.63rem', lineHeight: 1.45 }}>
          Em caso de duvidas, requerimentos ou mais informacoes sobre a "LGPD" entre em contato com nosso Encarregado de Protecao de Dados/Data Protection Officer (DPO) pelo e-mail dpo@twcapital ou consulte nossa Politica de Privacidade.
        </p>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: '#7a2fa2', fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>{label}</div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        height: 40,
        boxSizing: 'border-box',
        padding: '0 0.9rem',
        borderRadius: 12,
        border: '1px solid #ddd6e6',
        background: '#fff',
        color: '#55565d',
        fontFamily: 'inherit',
      }}
    />
  );
}

function MiniButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      style={{
        height: 24,
        padding: '0 0.8rem',
        border: 'none',
        borderRadius: 999,
        background: '#fa3650',
        color: '#fff',
        fontWeight: 800,
        fontSize: '0.68rem',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
