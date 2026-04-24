import { useNavigate } from 'react-router-dom';
import { useViewport } from '../hooks/useViewport';

const SECTIONS = [
  {
    title: '1. Aceitacao dos termos',
    content:
      'Ao acessar e utilizar este portal, voce declara que leu, compreendeu e concorda com estes Termos de Uso. Caso nao concorde, recomendamos interromper a utilizacao da plataforma.',
  },
  {
    title: '2. Finalidade do portal',
    content:
      'O portal tem como objetivo permitir consulta de contratos, visualizacao de oportunidades de negociacao, acompanhamento de acordos, emissao de boletos e atualizacao de determinados dados cadastrais do usuario.',
  },
  {
    title: '3. Responsabilidades do usuario',
    content:
      'O usuario se compromete a fornecer informacoes veridicas, manter seus dados atualizados, nao compartilhar codigos de verificacao e utilizar o portal exclusivamente para fins legitimos relacionados aos seus proprios contratos e acordos.',
  },
  {
    title: '4. Regras de acesso e seguranca',
    content:
      'O acesso depende de validacao de identidade e pode ser bloqueado em caso de suspeita de fraude, uso indevido, tentativa de acesso nao autorizado ou descumprimento destes termos. O usuario deve zelar pela confidencialidade das informacoes exibidas em tela.',
  },
  {
    title: '5. Disponibilidade do servico',
    content:
      'A TW Capital envidara esforcos razoaveis para manter o portal disponivel, mas nao garante funcionamento ininterrupto ou livre de falhas. Podem ocorrer indisponibilidades temporarias para manutencao, atualizacao ou por motivos tecnicos alheios ao nosso controle.',
  },
  {
    title: '6. Limitacoes',
    content:
      'As condicoes de negociacao exibidas no portal estao sujeitas a regras de credito, vigencia, disponibilidade operacional e validacao final. A simples exibicao de uma oferta nao representa garantia irrevogavel de formalizacao futura sem as validacoes necessarias.',
  },
  {
    title: '7. Alteracoes destes termos',
    content:
      'Estes Termos de Uso podem ser atualizados a qualquer momento para refletir ajustes legais, operacionais ou de seguranca. Recomendamos consulta periodica desta pagina.',
  },
];

export default function TermosUso() {
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
          <h1 style={{ margin: 0, color: '#7a2fa2', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900 }}>Termos de uso</h1>
          <p style={{ margin: '0.4rem 0 0', color: '#66666d', fontSize: isMobile ? '0.84rem' : '0.92rem' }}>
            Condicoes gerais para utilizacao do portal
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
