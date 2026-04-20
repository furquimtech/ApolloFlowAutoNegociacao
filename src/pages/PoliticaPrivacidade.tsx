import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';

const SECTIONS = [
  {
    title: '1. Quem somos',
    content: `Este portal de negociação é operado pela Furquim Tecnologia em parceria com as empresas credoras. Somos responsáveis pelo tratamento dos seus dados pessoais durante o processo de negociação de dívidas realizado nesta plataforma.`,
  },
  {
    title: '2. Dados coletados',
    content: `Coletamos apenas os dados estritamente necessários para viabilizar a negociação:
• CPF e data de nascimento — para identificação e validação do titular;
• Nome completo — para personalização do atendimento;
• E-mail e telefone — para envio do boleto e comunicações sobre o acordo;
• Dados do contrato e da dívida — para apresentação das opções de negociação.`,
  },
  {
    title: '3. Finalidade do tratamento',
    content: `Os dados coletados são utilizados exclusivamente para:
• Verificar sua identidade (autenticação);
• Consultar e exibir seus débitos em aberto;
• Processar e formalizar o acordo de negociação;
• Emitir e enviar o boleto bancário correspondente;
• Cumprir obrigações legais e regulatórias.`,
  },
  {
    title: '4. Base legal (LGPD)',
    content: `O tratamento dos seus dados está fundamentado nas seguintes bases legais previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
• Execução de contrato — para viabilizar a negociação da dívida;
• Cumprimento de obrigação legal — para atender exigências regulatórias;
• Legítimo interesse — para gestão de crédito e cobrança.`,
  },
  {
    title: '5. Compartilhamento de dados',
    content: `Seus dados podem ser compartilhados com:
• A empresa credora titular da dívida negociada;
• Instituições financeiras responsáveis pela emissão do boleto;
• Órgãos reguladores e autoridades públicas, quando exigido por lei.

Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins comerciais ou de marketing.`,
  },
  {
    title: '6. Armazenamento e segurança',
    content: `Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/HTTPS) e em repouso. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.

Os dados são retidos pelo período mínimo necessário ao cumprimento das finalidades descritas nesta política e das obrigações legais aplicáveis.`,
  },
  {
    title: '7. Seus direitos',
    content: `Nos termos da LGPD, você tem direito a:
• Confirmar a existência de tratamento dos seus dados;
• Acessar os dados que possuímos sobre você;
• Corrigir dados incompletos, inexatos ou desatualizados;
• Solicitar a eliminação dos dados desnecessários ou excessivos;
• Revogar o consentimento, quando aplicável;
• Obter informações sobre o compartilhamento de dados.

Para exercer seus direitos, entre em contato conosco pelo e-mail: privacidade@furquimtecnologia.com.br`,
  },
  {
    title: '8. Cookies e rastreamento',
    content: `Este portal não utiliza cookies de rastreamento ou ferramentas de análise de terceiros. A sessão é mantida exclusivamente em memória do navegador, sem persistência local de dados sensíveis, e é encerrada automaticamente após 5 minutos de inatividade.`,
  },
  {
    title: '9. Alterações nesta política',
    content: `Esta Política de Privacidade pode ser atualizada periodicamente. Em caso de alterações relevantes, a data de atualização será revisada. Recomendamos a leitura periódica deste documento.`,
  },
  {
    title: '10. Contato',
    content: `Furquim Tecnologia
E-mail: privacidade@furquimtecnologia.com.br
Encarregado de Dados (DPO): disponível no mesmo endereço de e-mail.`,
  },
];

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: 'var(--brand-surface)',
        borderRadius: 'var(--brand-radius)',
        boxShadow: 'var(--brand-shadow)',
        padding: '2.5rem 2rem',
      }}
    >
      {/* Cabeçalho */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--brand-border)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <img
            src={theme.logoUrl}
            alt={theme.companyName}
            style={{ height: 40, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '0.4rem' }}>
          Política de Privacidade
        </h1>
        <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.85rem' }}>
          Portal de Negociação — {theme.companyName} &amp; Furquim Tecnologia
          <br />
          Última atualização: março de 2026
        </p>
      </div>

      {/* Introdução */}
      <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
        Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos
        os seus dados pessoais quando você utiliza nosso Portal de Negociação. Ao usar este portal,
        você concorda com as práticas descritas neste documento, em conformidade com a{' '}
        <strong>Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018)</strong>.
      </p>

      {/* Seções */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                marginBottom: '0.5rem',
              }}
            >
              {s.title}
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--brand-text-muted)',
                lineHeight: 1.75,
                whiteSpace: 'pre-line',
              }}
            >
              {s.content}
            </p>
          </section>
        ))}
      </div>

      {/* Rodapé da página */}
      <div
        style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--brand-border)',
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      >
        <Button variant="secondary" onClick={() => navigate('/')}>
          Voltar ao portal
        </Button>
      </div>
    </div>
  );
}
