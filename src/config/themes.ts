/**
 * ─── CONFIGURAÇÃO DE TEMAS WHITELABEL ────────────────────────────────────────
 *
 * Para adicionar um novo cliente:
 * 1. Copie um bloco existente e ajuste os valores
 * 2. Coloque o logo em /public/themes/<id>/logo.png (recomendado: ~300×80px, PNG transparente)
 * 3. (Opcional) Coloque o favicon em /public/themes/<id>/favicon.ico
 * 4. Pronto — nenhuma outra alteração é necessária
 *
 * Convenção de cores:
 *   primary    → cor principal da marca (cabeçalhos, botões outline, textos de destaque)
 *   accent     → cor de ação (botões primários, badges, links, barra de progresso)
 *   bg         → fundo da página
 *   surface    → fundo de cards e painéis
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ThemeTokens {
  primary:       string;  // ex.: #1B2F4E
  primaryHover:  string;  // ex.: #243d66  (~10% mais escuro)
  primaryLight:  string;  // ex.: #eef2f7  (~95% mais claro, fundos sutis)
  accent:        string;  // ex.: #2ABFAA
  accentHover:   string;  // ex.: #3acfba
  accentLight:   string;  // ex.: #eafbf9
  bg:            string;  // ex.: #f0f4f8
  surface:       string;  // ex.: #ffffff
  text:          string;  // ex.: #1B2F4E
  textMuted:     string;  // ex.: #6b7280
  border:        string;  // ex.: #e2e8f0
  shadow:        string;  // ex.: 0 4px 24px rgba(...)
  radius:        string;  // ex.: 12px
}

export interface ThemeDefinition {
  id:           string;
  name:         string;         // Nome exibido na interface
  companyName:  string;         // Nome da empresa (copyright, title, etc.)
  logoUrl:      string;         // Caminho relativo a /public
  faviconUrl?:  string;         // Opcional — fallback para /favicon.ico
  tokens:       ThemeTokens;
}

// ─── Registro de temas ────────────────────────────────────────────────────────

export const THEME_REGISTRY: Record<string, ThemeDefinition> = {

  // ── FTech (padrão) ─────────────────────────────────────────────────────────
  ftech: {
    id:          'ftech',
    name:        'FTech',
    companyName: 'FTech',
    logoUrl:     '/themes/ftech/logo.png',
    faviconUrl:  '/themes/ftech/favicon.ico',
    tokens: {
      primary:      '#1B2F4E',
      primaryHover: '#243d66',
      primaryLight: '#eef2f7',
      accent:       '#2ABFAA',
      accentHover:  '#22a898',
      accentLight:  '#eafbf9',
      bg:           '#f0f4f8',
      surface:      '#ffffff',
      text:         '#1B2F4E',
      textMuted:    '#6b7280',
      border:       '#e2e8f0',
      shadow:       '0 4px 24px rgba(27,47,78,0.10)',
      radius:       '12px',
    },
  },

  // ── TW Capital ─────────────────────────────────────────────────────────────
  // Identidade visual: roxo (#7B3FA0) + vermelho-coral (#E8314A)
  // Logo: ícone "Wi" + logotipo "tw.capital" — /public/themes/tw-capital/logo.png
  'tw-capital': {
    id:          'tw-capital',
    name:        'TW Capital',
    companyName: 'TW Capital',
    logoUrl:     '/themes/tw-capital/logo.png',
    faviconUrl:  '/themes/tw-capital/favicon.ico',
    tokens: {
      primary:      '#7B3FA0',   // roxo — cor principal da marca
      primaryHover: '#6a3590',
      primaryLight: '#f3ebf9',
      accent:       '#E8314A',   // vermelho-coral — cor de ação (botões, badges)
      accentHover:  '#d42840',
      accentLight:  '#fde8eb',
      bg:           '#f8f5fa',   // fundo levemente arroxeado
      surface:      '#ffffff',
      text:         '#3d1a5c',   // texto principal — roxo escuro
      textMuted:    '#6b7280',
      border:       '#e9e0f0',
      shadow:       '0 4px 24px rgba(123,63,160,0.10)',
      radius:       '12px',
    },
  },

  // ── Template para novo cliente ─────────────────────────────────────────────
  // Descomente, preencha e coloque o logo em /public/themes/<id>/logo.png
  //
  // 'nome-cliente': {
  //   id:          'nome-cliente',
  //   name:        'Nome do Cliente',
  //   companyName: 'Nome do Cliente S.A.',
  //   logoUrl:     '/themes/nome-cliente/logo.png',
  //   tokens: {
  //     primary:      '#000000',
  //     primaryHover: '#111111',
  //     primaryLight: '#f5f5f5',
  //     accent:       '#0066cc',
  //     accentHover:  '#0055aa',
  //     accentLight:  '#e6f0ff',
  //     bg:           '#f4f4f4',
  //     surface:      '#ffffff',
  //     text:         '#111111',
  //     textMuted:    '#6b7280',
  //     border:       '#e0e0e0',
  //     shadow:       '0 4px 24px rgba(0,0,0,0.08)',
  //     radius:       '12px',
  //   },
  // },

};

export const DEFAULT_THEME_ID = 'ftech';
