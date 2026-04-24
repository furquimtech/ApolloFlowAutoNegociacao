import axios from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteApi } from '../api/cliente';
import { contratosApi } from '../api/contratos';
import { tracksApi } from '../api/tracks';
import { useNegociacao } from '../contexts/NegociacaoContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTracking } from '../hooks/useTracking';
import { useViewport } from '../hooks/useViewport';
import { simularPorContratos } from '../services/negociacao';
import type { Cliente } from '../types';

type AccessStep = 'cpf' | 'birthdate' | 'phone';
type VerificationChannel = 'sms';

interface Errors {
  cpf?: string;
  birthdate?: string;
  celular?: string;
  codigo?: string;
}

interface PendingVerification {
  canal: 'email' | 'sms';
  enviadoPara: string;
  expiraEm: string;
}

interface IdentitySnapshot {
  cliente: Cliente;
  rawCpf: string;
}

const TEMP_BYPASS_VERIFICATION = false;
const TELEFONE_VALIDADO_CACHE_KEY = 'cliente_telefone_validado';

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

function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length !== 8) return '';
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { erro?: string } | undefined)?.erro ?? fallback;
  }
  return fallback;
}

function getStepContent(step: AccessStep, smsSent: boolean) {
  if (step === 'cpf') {
    return {
      title: 'Negocie aqui, e simples e rapido!',
      subtitle: 'A melhor oferta para quitar seus debitos',
      buttonLabel: 'Consulte gratis',
    };
  }

  if (step === 'birthdate') {
    return {
      title: 'Complete seus dados',
      subtitle: 'Preencha os dados em seu primeiro acesso',
      buttonLabel: 'Entrar',
    };
  }

  return {
    title: 'Etapa de Seguranca!',
    subtitle: smsSent ? 'Digite o codigo enviado por SMS para continuar' : 'Preencha os dados em seu primeiro acesso',
    buttonLabel: smsSent ? 'Validar codigo' : 'Entrar',
  };
}

function renderBrandDecoration(isMobile: boolean) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? 220 : 520,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src="/themes/tw-capital/W-da-TwCapital-transparente.png"
        alt=""
        aria-hidden="true"
        style={{
          width: isMobile ? 250 : 470,
          height: 'auto',
          position: 'absolute',
          left: isMobile ? -26 : -38,
          top: isMobile ? 4 : 8,
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

export default function Identificacao() {
  const navigate = useNavigate();
  const { setCliente, setContratosDisponiveis, setContratos, setContratoSelecionadoId, setSimulacao } = useNegociacao();
  const { theme } = useTheme();
  const { sessionId, init, track } = useTracking();
  const { isMobile, isCompact } = useViewport();

  const [step, setStep] = useState<AccessStep>('cpf');
  const [cpf, setCpf] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [celular, setCelular] = useState('');
  const [codigo, setCodigo] = useState('');
  const [identidadeValidada, setIdentidadeValidada] = useState<IdentitySnapshot | null>(null);
  const [codigoEnviado, setCodigoEnviado] = useState<PendingVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const canalVerificacao: VerificationChannel = 'sms';
  const stepContent = useMemo(() => getStepContent(step, !!codigoEnviado), [step, codigoEnviado]);

  function clearFeedback() {
    setError('');
    setErrors({});
  }

  function clienteJaPossuiTelefone(identity: IdentitySnapshot, telefoneInformado: string): boolean {
    const telefoneLimpo = telefoneInformado.replace(/\D/g, '');

    return (identity.cliente.telefones ?? []).some((telefone) => {
      const telefoneExistente = `${telefone.ddd ?? ''}${telefone.telefone ?? ''}`.replace(/\D/g, '');
      return telefoneExistente === telefoneLimpo;
    });
  }

  function jaPersistiuTelefone(clienteId: string, telefone: string): boolean {
    return sessionStorage.getItem(`${TELEFONE_VALIDADO_CACHE_KEY}:${clienteId}`) === telefone.replace(/\D/g, '');
  }

  function marcarTelefonePersistido(clienteId: string, telefone: string) {
    sessionStorage.setItem(`${TELEFONE_VALIDADO_CACHE_KEY}:${clienteId}`, telefone.replace(/\D/g, ''));
  }

  function destinationFor(): string {
    return celular.replace(/\D/g, '');
  }

  function resetSmsState() {
    setCodigo('');
    setCodigoEnviado(null);
  }

  function goToStep(nextStep: AccessStep) {
    clearFeedback();
    if (nextStep !== 'phone') resetSmsState();
    setStep(nextStep);
  }

  async function ensureAttemptSession(opts?: { clienteId?: string; clienteCpf?: string }) {
    await tracksApi.iniciarSessao({
      sessionId,
      clienteId: opts?.clienteId,
      clienteCpf: opts?.clienteCpf,
      negociacaoId: import.meta.env.VITE_NEGOCIACAO_ID,
      themeId: import.meta.env.VITE_THEME_ID,
      userAgent: navigator.userAgent,
    });
  }

  async function registerFailedLoginEvent(tipo: string, dados: Record<string, unknown>) {
    try {
      await ensureAttemptSession({ clienteCpf: cpf.replace(/\D/g, '') || undefined });
      await tracksApi.registrarEvento({
        sessionId,
        tipo,
        cpf: cpf.replace(/\D/g, '') || undefined,
        pagina: '/',
        dados,
      });
    } catch {
      // silent
    }
  }

  function validateCpfStep(): boolean {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) {
      setErrors({ cpf: 'CPF invalido' });
      return false;
    }

    clearFeedback();
    return true;
  }

  function validateBirthdateStep(): boolean {
    const isoDate = parseBirthDate(birthdate);
    if (!isoDate) {
      setErrors({ birthdate: 'Data invalida' });
      return false;
    }

    clearFeedback();
    return true;
  }

  function validatePhoneStep(): boolean {
    const nextErrors: Errors = {};
    const phoneDigits = celular.replace(/\D/g, '');

    if (phoneDigits.length < 10) nextErrors.celular = 'Celular invalido';
    if (codigoEnviado && codigo.trim().length < 4) nextErrors.codigo = 'Digite o codigo enviado';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function searchCustomerByCpf(): Promise<IdentitySnapshot | null> {
    const rawCpf = cpf.replace(/\D/g, '');
    const clienteResult = await clienteApi.buscarPorCpf(rawCpf);

    if (!clienteResult.sucesso || !clienteResult.data) {
      await registerFailedLoginEvent('LOGIN_FAILED_IDENTIFICACAO', {
        motivo: 'cpf_nao_encontrado',
        cpf: rawCpf,
      });
      setError('Nao encontramos esse CPF em nossa base.');
      return null;
    }

    return { cliente: clienteResult.data, rawCpf };
  }

  async function validateBirthdateWithCustomer(identity: IdentitySnapshot): Promise<boolean> {
    const isoDate = parseBirthDate(birthdate);
    const apiDate = identity.cliente.dataNascimento?.slice(0, 10);

    if (!apiDate || isoDate !== apiDate) {
      await registerFailedLoginEvent('LOGIN_FAILED_IDENTIFICACAO', {
        motivo: 'data_nascimento_invalida',
        cpf: identity.rawCpf,
        clienteId: identity.cliente.id,
        dataNascimentoInformada: isoDate,
        dataNascimentoCadastrada: apiDate,
        canalVerificacao,
      });
      setError('A data de nascimento informada nao confere.');
      setErrors({ birthdate: 'Data invalida' });
      return false;
    }

    return true;
  }

  async function concludeLogin(identity: IdentitySnapshot) {
    const contratosResult = await contratosApi.listar(identity.cliente.id);
    if (!contratosResult.sucesso || !contratosResult.data?.length) {
      setError('Nenhum contrato encontrado para este CPF.');
      return;
    }

    const contratos = contratosResult.data;

    setCliente(identity.cliente);
    setContratosDisponiveis(contratos);

    await init({ clienteId: identity.cliente.id, clienteCpf: identity.rawCpf });
    await track('LOGIN', {
      pagina: '/',
      referencia: identity.cliente.id,
      dados: {
        cpf: identity.rawCpf,
        nome: identity.cliente.nome,
        canalVerificacao,
      },
    });

    const primeiroContrato = contratos[0];
    const simResult = await simularPorContratos(identity.cliente.id, [primeiroContrato]);
    if (!simResult) {
      setError('Nao foi possivel calcular as propostas. Tente novamente.');
      return;
    }

    setContratos([primeiroContrato]);
    setContratoSelecionadoId(primeiroContrato.id);
    setSimulacao(simResult);
    navigate('/oportunidades');
  }

  async function persistirTelefoneValidado(identity: IdentitySnapshot) {
    const telefoneLimpo = destinationFor();
    if (!telefoneLimpo || jaPersistiuTelefone(identity.cliente.id, telefoneLimpo) || clienteJaPossuiTelefone(identity, telefoneLimpo)) {
      return;
    }

    const result = await clienteApi.adicionarTelefone(identity.cliente.id, telefoneLimpo);
    if (result.sucesso) {
      marcarTelefonePersistido(identity.cliente.id, telefoneLimpo);
      identity.cliente.telefones = [
        ...(identity.cliente.telefones ?? []),
        {
          id: '',
          idExterno: '',
          ddd: telefoneLimpo.slice(0, 2),
          telefone: telefoneLimpo.slice(2),
          ramal: null,
          tipo: 'CELULAR',
          principal: false,
          usuarioCriador: null,
          ranking: null,
          cpc: null,
          dataHoraModificacao: new Date().toISOString(),
        },
      ];
      return;
    }

    console.warn('[Cadastro] Nao foi possivel persistir telefone validado:', result.mensagem);
  }

  async function handleCpfStep() {
    if (!validateCpfStep()) return;

    const identity = await searchCustomerByCpf();
    if (!identity) return;

    setIdentidadeValidada(identity);
    goToStep('birthdate');
  }

  async function handleBirthdateStep() {
    if (!identidadeValidada) {
      goToStep('cpf');
      return;
    }

    if (!validateBirthdateStep()) return;

    const birthdateIsValid = await validateBirthdateWithCustomer(identidadeValidada);
    if (!birthdateIsValid) return;

    goToStep('phone');
  }

  async function handlePhoneStep() {
    if (!identidadeValidada) {
      goToStep('cpf');
      return;
    }

    if (!validatePhoneStep()) return;

    if (codigoEnviado) {
      await tracksApi.validarCodigo({
        documento: identidadeValidada.rawCpf,
        canal: codigoEnviado.canal,
        destino: destinationFor(),
        codigo: codigo.trim(),
      });

      await persistirTelefoneValidado(identidadeValidada);
      await concludeLogin(identidadeValidada);
      return;
    }

    if (TEMP_BYPASS_VERIFICATION) {
      await concludeLogin(identidadeValidada);
      return;
    }

    const response = await tracksApi.solicitarCodigo({
      documento: identidadeValidada.rawCpf,
      nome: identidadeValidada.cliente.nome,
      canal: canalVerificacao,
      destino: destinationFor(),
      clienteId: identidadeValidada.cliente.id,
    });

    setCodigoEnviado({
      canal: response.canal,
      enviadoPara: response.enviadoPara,
      expiraEm: response.expiraEm,
    });
    setCodigo('');
    clearFeedback();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    clearFeedback();

    try {
      if (step === 'cpf') {
        await handleCpfStep();
        return;
      }

      if (step === 'birthdate') {
        await handleBirthdateStep();
        return;
      }

      await handlePhoneStep();
    } catch (err) {
      if (step === 'phone' && codigoEnviado && identidadeValidada) {
        await registerFailedLoginEvent('LOGIN_FAILED_CODIGO', {
          motivo: 'codigo_invalido_ou_expirado',
          cpf: identidadeValidada.rawCpf,
          clienteId: identidadeValidada.cliente.id,
          canalVerificacao: codigoEnviado.canal,
          destino: destinationFor(),
        });
      }

      setError(getErrorMessage(err, step === 'phone' && codigoEnviado ? 'Nao foi possivel validar o codigo.' : 'Nao foi possivel continuar. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!identidadeValidada) return;

    setLoading(true);
    clearFeedback();

    try {
      const response = await tracksApi.solicitarCodigo({
        documento: identidadeValidada.rawCpf,
        nome: identidadeValidada.cliente.nome,
        canal: canalVerificacao,
        destino: destinationFor(),
        clienteId: identidadeValidada.cliente.id,
      });

      setCodigoEnviado({
        canal: response.canal,
        enviadoPara: response.enviadoPara,
        expiraEm: response.expiraEm,
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Nao foi possivel reenviar o codigo.'));
    } finally {
      setLoading(false);
    }
  }

  const fieldLabelStyle: React.CSSProperties = {
    fontSize: '1.02rem',
    fontWeight: 700,
    color: '#7b2fa8',
    display: 'block',
    marginBottom: '0.5rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: isMobile ? 46 : 40,
    boxSizing: 'border-box',
    padding: '0 1rem',
    border: '1.4px solid #dfd8e7',
    borderRadius: 12,
    fontSize: isMobile ? '0.92rem' : '0.96rem',
    color: '#5a5a61',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const primaryButtonStyle: React.CSSProperties = {
    minWidth: isMobile ? '100%' : 168,
    height: 42,
    border: 'none',
    borderRadius: 14,
    background: 'linear-gradient(90deg, #8f34b3 0%, #70279f 100%)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 800,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.72 : 1,
    boxShadow: '0 10px 24px rgba(112, 39, 159, 0.18)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e9e7ee',
        display: 'grid',
        gridTemplateColumns: isCompact ? '1fr' : 'minmax(320px, 1fr) minmax(420px, 520px)',
        alignItems: 'center',
        gap: isMobile ? '1.25rem' : '2rem',
        padding: isMobile ? '1.1rem 0.9rem 5rem' : '2rem 3rem 4rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          minHeight: isCompact ? 220 : 560,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          order: isCompact ? 2 : 1,
        }}
      >
        {renderBrandDecoration(isMobile)}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: isCompact ? 540 : 520,
          justifySelf: 'center',
          order: 1,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: isMobile ? 28 : 34,
            padding: isMobile ? '1.7rem 1.2rem 1.45rem' : '2rem 2rem 1.75rem',
            boxShadow: '0 26px 70px rgba(61, 40, 95, 0.12)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.4rem' }}>
            <img
              src={theme.logoUrl}
              alt={theme.companyName}
              style={{ width: isMobile ? 190 : 220, objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.7rem' }}>
            <h1
              style={{
                fontSize: isMobile ? '1.75rem' : '1.98rem',
                lineHeight: 1.05,
                color: '#ff334b',
                fontWeight: 800,
                marginBottom: '0.5rem',
                letterSpacing: '-0.03em',
              }}
            >
              {stepContent.title}
            </h1>
            <p style={{ color: '#55555f', fontSize: isMobile ? '0.95rem' : '0.98rem', fontWeight: 500 }}>
              {stepContent.subtitle}
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: '1rem',
                background: '#fff1f3',
                border: '1px solid #ffc7cf',
                borderRadius: 12,
                padding: '0.8rem 0.95rem',
                color: '#d81f39',
                fontSize: '0.86rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {step === 'cpf' && (
              <div>
                <label style={fieldLabelStyle}>CPF</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Digite seu CPF"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  style={{
                    ...inputStyle,
                    borderColor: errors.cpf ? '#ef4444' : '#dfd8e7',
                  }}
                />
                {errors.cpf && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.35rem' }}>{errors.cpf}</div>}
              </div>
            )}

            {step === 'birthdate' && (
              <>
                <div>
                  <label style={fieldLabelStyle}>CPF</label>
                  <input type="text" value={cpf} disabled style={{ ...inputStyle, color: '#8b8794', background: '#faf8fc' }} />
                </div>

                <div>
                  <label style={fieldLabelStyle}>Data de Nascimento</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="XX/XX/XXXX"
                    value={birthdate}
                    onChange={(e) => setBirthdate(formatBirthDate(e.target.value))}
                    style={{
                      ...inputStyle,
                      borderColor: errors.birthdate ? '#ef4444' : '#dfd8e7',
                    }}
                  />
                  {errors.birthdate && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.35rem' }}>{errors.birthdate}</div>}
                </div>
              </>
            )}

            {step === 'phone' && (
              <>
                <div>
                  <label style={fieldLabelStyle}>Celular</label>
                  <input
                    type="text"
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    value={celular}
                    onChange={(e) => setCelular(formatPhone(e.target.value))}
                    disabled={!!codigoEnviado}
                    style={{
                      ...inputStyle,
                      borderColor: errors.celular ? '#ef4444' : '#dfd8e7',
                      background: codigoEnviado ? '#faf8fc' : '#fff',
                      color: codigoEnviado ? '#8b8794' : '#5a5a61',
                    }}
                  />
                  {errors.celular && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.35rem' }}>{errors.celular}</div>}
                </div>

                {codigoEnviado && (
                  <div>
                    <label style={fieldLabelStyle}>Codigo de validacao</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{
                        ...inputStyle,
                        letterSpacing: '0.32em',
                        textAlign: 'center',
                        fontWeight: 700,
                        borderColor: errors.codigo ? '#ef4444' : '#dfd8e7',
                      }}
                    />
                    {errors.codigo && <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.35rem' }}>{errors.codigo}</div>}
                    <div style={{ fontSize: '0.72rem', color: '#706a78', marginTop: '0.45rem', lineHeight: 1.45 }}>
                      Enviamos um codigo por SMS para <strong>{codigoEnviado.enviadoPara}</strong>.
                      {' '}Validade ate {new Date(codigoEnviado.expiraEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: step === 'cpf' ? 'flex-end' : 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '1.8rem',
            }}
          >
            {step !== 'cpf' && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'birthdate') {
                      setIdentidadeValidada(null);
                      goToStep('cpf');
                      return;
                    }

                    if (codigoEnviado) {
                      resetSmsState();
                      clearFeedback();
                      return;
                    }

                    goToStep('birthdate');
                  }}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    height: 40,
                    padding: '0 1.1rem',
                    borderRadius: 12,
                    border: '1px solid #d9d1e3',
                    background: '#fff',
                    color: '#6f6a77',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {step === 'birthdate' ? 'Alterar CPF' : codigoEnviado ? 'Alterar celular' : 'Voltar'}
                </button>

                {step === 'phone' && codigoEnviado && (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{
                      width: isMobile ? '100%' : 'auto',
                      height: 40,
                      padding: '0 1.1rem',
                      borderRadius: 12,
                      border: '1px solid #7b2fa8',
                      background: '#fff',
                      color: '#7b2fa8',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.72 : 1,
                    }}
                  >
                    Reenviar codigo
                  </button>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              )}
              {stepContent.buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
