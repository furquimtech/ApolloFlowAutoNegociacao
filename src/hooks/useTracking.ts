import { useRef } from 'react';
import { getSessionId } from '../tracking/session';
import { trackEvent, activateTracking, setTrackingCpf } from '../tracking/tracker';
import axios from 'axios';

const TRACKS_BASE = '/tracks';
const INTEGRATION_TOKEN = import.meta.env.VITE_TRACKS_INTEGRATION_TOKEN as string | undefined;

export function useTracking() {
  const sessionId = useRef(getSessionId());
  const initialized = useRef(false);

  async function init(opts?: { clienteId?: string; clienteCpf?: string }) {
    if (initialized.current) return;
    try {
      const token = await getTracksToken();
      await axios.post(
        `${TRACKS_BASE}/api/sessoes`,
        {
          sessionId: sessionId.current,
          clienteId: opts?.clienteId,
          clienteCpf: opts?.clienteCpf,
          negociacaoId: import.meta.env.VITE_NEGOCIACAO_ID,
          themeId: import.meta.env.VITE_THEME_ID,
          userAgent: navigator.userAgent,
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setTrackingCpf(opts?.clienteCpf);
      activateTracking();
      initialized.current = true;
    } catch {
      // silent
    }
  }

  async function track(
    tipo: string,
    opts?: { pagina?: string; referencia?: string; dados?: Record<string, unknown> }
  ) {
    if (!initialized.current) await init();
    trackEvent({
      tipo,
      pagina: opts?.pagina ?? window.location.pathname,
      referencia: opts?.referencia,
      dados: opts?.dados,
    });
  }

  return { sessionId: sessionId.current, init, track };
}

// Token getter reutilizado pelo hook
async function getTracksToken(): Promise<string> {
  if (INTEGRATION_TOKEN) return INTEGRATION_TOKEN;

  const token = sessionStorage.getItem('tracks_token');
  const expiry = sessionStorage.getItem('tracks_token_expiry');
  if (token && expiry && Date.now() < Number(expiry)) return token;

  const res = await axios.post<{ accessToken: string; expiresIn: number }>(
    `${TRACKS_BASE}/api/auth/token`,
    { apiKey: import.meta.env.VITE_TRACKS_API_KEY }
  );
  const { accessToken, expiresIn } = res.data;
  sessionStorage.setItem('tracks_token', accessToken);
  sessionStorage.setItem('tracks_token_expiry', String(Date.now() + expiresIn * 1000 - 60_000));
  return accessToken;
}
