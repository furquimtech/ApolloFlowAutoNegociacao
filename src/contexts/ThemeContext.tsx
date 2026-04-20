import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ThemeId, ThemeConfig } from '../types';
import { THEME_REGISTRY, DEFAULT_THEME_ID } from '../config/themes';
import type { ThemeTokens } from '../config/themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'apolloflow_theme';

/** Mapeia ThemeTokens → CSS custom properties do portal */
function applyTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary',       tokens.primary);
  root.style.setProperty('--brand-primary-hover',  tokens.primaryHover);
  root.style.setProperty('--brand-primary-light',  tokens.primaryLight);
  root.style.setProperty('--brand-accent',         tokens.accent);
  root.style.setProperty('--brand-accent-hover',   tokens.accentHover);
  root.style.setProperty('--brand-accent-light',   tokens.accentLight);
  root.style.setProperty('--brand-bg',             tokens.bg);
  root.style.setProperty('--brand-surface',        tokens.surface);
  root.style.setProperty('--brand-text',           tokens.text);
  root.style.setProperty('--brand-text-muted',     tokens.textMuted);
  root.style.setProperty('--brand-border',         tokens.border);
  root.style.setProperty('--brand-shadow',         tokens.shadow);
  root.style.setProperty('--brand-radius',         tokens.radius);
}

/**
 * Hierarquia de detecção de tema (maior prioridade → menor):
 * 1. VITE_THEME_ID   — variável de ambiente do deploy (tema fixo por cliente)
 * 2. ?theme=xxx      — URL param  (útil para testes em dev)
 * 3. localStorage    — última sessão
 * 4. DEFAULT_THEME_ID
 */
function detectTheme(): ThemeId {
  // 1. Env do deploy
  const fromEnv = import.meta.env.VITE_THEME_ID as string | undefined;
  if (fromEnv && fromEnv in THEME_REGISTRY) return fromEnv;

  // 2. URL param
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('theme');
  if (fromUrl && fromUrl in THEME_REGISTRY) return fromUrl;

  // 3. localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in THEME_REGISTRY) return stored;

  return DEFAULT_THEME_ID;
}

/** Converte ThemeDefinition → ThemeConfig (shape que os componentes usam) */
function toConfig(id: ThemeId): ThemeConfig {
  const def = THEME_REGISTRY[id] ?? THEME_REGISTRY[DEFAULT_THEME_ID];
  return {
    id:          def.id,
    name:        def.name,
    companyName: def.companyName,
    logoUrl:     def.logoUrl,
    faviconUrl:  def.faviconUrl,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const id = detectTheme();
    // Aplica tokens imediatamente (síncrono) para evitar flash de cores erradas
    const def = THEME_REGISTRY[id] ?? THEME_REGISTRY[DEFAULT_THEME_ID];
    applyTokens(def.tokens);
    return id;
  });

  useEffect(() => {
    const def = THEME_REGISTRY[themeId] ?? THEME_REGISTRY[DEFAULT_THEME_ID];

    // Aplica tokens de cor via CSS vars (sem classes CSS por tema)
    applyTokens(def.tokens);

    // Favicon dinâmico
    if (def.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = def.faviconUrl;
    }

    // Título da aba
    document.title = `Portal de Negociação — ${def.companyName}`;

    localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

  const availableThemes = Object.values(THEME_REGISTRY).map((d) => toConfig(d.id));

  return (
    <ThemeContext.Provider
      value={{
        theme: toConfig(themeId),
        setTheme: setThemeId,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
