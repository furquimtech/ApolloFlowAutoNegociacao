import { useNavigate } from 'react-router-dom';
import { useViewport } from '../hooks/useViewport';

const SECTIONS = [
  {
    title: '1. Objetivo desta politica',
    content:
      'Esta Politica de Privacidade explica como seus dados pessoais sao coletados, utilizados, armazenados e protegidos durante a utilizacao do portal de negociacao da TW Capital. O tratamento dos dados ocorre de acordo com a Lei Geral de Protecao de Dados Pessoais - LGPD.',
  },
  {
    title: '2. Quais dados podemos tratar',
    content:
      'Podemos tratar dados de identificacao, como nome, CPF, data de nascimento, telefone, e-mail e dados relacionados aos contratos e acordos exibidos no portal. Tambem podem ser tratados registros tecnicos de acesso, autenticacao e navegacao necessarios para seguranca da plataforma.',
  },
  {
    title: '3. Finalidades do uso dos dados',
    content:
      'Os dados sao utilizados para validar sua identidade, permitir o acesso seguro ao portal, exibir contratos e acordos, enviar comunicacoes relacionadas a cobranca, gerar segunda via de boletos, registrar manifestacoes e cumprir obrigacoes legais e regulatorias.',
  },
  {
    title: '4. Compartilhamento',
    content:
      'Os dados podem ser compartilhados com credores, parceiros operacionais, fornecedores de tecnologia, meios de pagamento e autoridades competentes, sempre dentro do limite necessario para execucao do servico, cumprimento de obrigacao legal ou exercicio regular de direitos.',
  },
  {
    title: '5. Seguranca e armazenamento',
    content:
      'Adotamos medidas tecnicas e administrativas para proteger suas informacoes contra acesso nao autorizado, vazamento, alteracao ou destruicao indevida. Os dados sao armazenados apenas pelo periodo necessario para atender as finalidades descritas nesta politica e as exigencias legais aplicaveis.',
  },
  {
    title: '6. Seus direitos',
    content:
      'Voce pode solicitar confirmacao da existencia de tratamento, acesso, correcao, atualizacao, anonimização, bloqueio ou eliminacao de dados, quando cabivel. Tambem pode pedir informacoes sobre compartilhamento e apresentar requerimentos relacionados aos seus direitos previstos na LGPD.',
  },
  {
    title: '7. Contato',
    content:
      'Para assuntos relacionados a privacidade, protecao de dados ou exercicio de direitos, entre em contato com nosso canal de atendimento informado no portal. Recomendamos incluir seu nome completo e CPF para agilizar a analise da solicitacao.',
  },
];

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();
  const { isMobile } = useViewport();

  return (
    <div style={{ padding: isMobile ? '1rem 0.75rem 1.5rem' : '1.35rem 1rem 2rem', width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'none',
          border: 'none',
          color: '#7a2fa2',
          fontWeight: 800,
          cursor: 'pointer',
          marginBottom: '1rem',
          padding: 0,
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>‹</span>
        Voltar
      </button>

      <div
        style={{
          background: '#fff',
          border: '1px solid #f0ebf4',
          borderRadius: 28,
          boxShadow: '0 18px 40px rgba(89, 58, 128, 0.08)',
          padding: isMobile ? '1.2rem 1rem' : '1.6rem 1.6rem 1.8rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, color: '#7a2fa2', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900 }}>Politicas de Privacidade</h1>
          <p style={{ margin: '0.4rem 0 0', color: '#66666d', fontSize: isMobile ? '0.84rem' : '0.92rem' }}>
            Ultima atualizacao: abril de 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 style={{ margin: '0 0 0.35rem', color: '#fa3650', fontSize: '1rem', fontWeight: 900 }}>{section.title}</h2>
              <p style={{ margin: 0, color: '#585962', fontSize: '0.9rem', lineHeight: 1.7 }}>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
