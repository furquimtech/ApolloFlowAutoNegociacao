import axios from 'axios';
import { getSessionId } from './session';

const TRACKS_BASE = '/tracks';

// Tracking só fica ativo após login — nada é gravado antes da autenticação
let trackingActive = false;
export function activateTracking(): void { trackingActive = true; }
const TOKEN_KEY = 'tracks_token';
const TOKEN_EXPIRY_KEY = 'tracks_token_expiry';

function getCachedToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  if (token && expiry && Date.now() < Number(expiry)) return token;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  return null;
}

async function getToken(): Promise<string> {
  const cached = getCachedToken();
  if (cached) return cached;

  const res = await axios.post<{ accessToken: string; expiresIn: number }>(
    `${TRACKS_BASE}/api/auth/token`,
    { apiKey: import.meta.env.VITE_TRACKS_API_KEY }
  );
  const { accessToken, expiresIn } = res.data;
  const expiryMs = Date.now() + expiresIn * 1000 - 60_000;
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs));
  return accessToken;
}

function truncate(obj: unknown, maxLen = 50_000): string {
  if (obj === undefined || obj === null) return '';
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return str.length > maxLen ? str.slice(0, maxLen) + '…[truncated]' : str;
}

export interface TrackEventOpts {
  tipo: string;
  pagina?: string;
  referencia?: string;
  dados?: Record<string, unknown>;
}

// Fire-and-forget — never throws; ignorado antes do login
export function trackEvent(opts: TrackEventOpts): void {
  if (!trackingActive) return;
  const sessionId = getSessionId();
  getToken()
    .then((token) =>
      axios.post(
        `${TRACKS_BASE}/api/eventos`,
        {
          sessionId,
          tipo: opts.tipo,
          pagina: opts.pagina ?? window.location.pathname,
          referencia: opts.referencia,
          dados: opts.dados ? truncate(opts.dados) : undefined,
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
    )
    .catch(() => {});
}

export interface ApiCallData {
  method: string;
  url: string;
  requestBody?: unknown;
  responseStatus?: number;
  responseData?: unknown;
  errorMessage?: string;
  durationMs?: number;
}

export function trackApiCall(data: ApiCallData): void {
  trackEvent({
    tipo: 'API_CALL',
    pagina: window.location.pathname,
    referencia: `${data.method.toUpperCase()} ${data.url}`,
    dados: {
      method: data.method,
      url: data.url,
      requestBody: data.requestBody ? truncate(data.requestBody) : undefined,
      responseStatus: data.responseStatus,
      responseData: data.responseData ? truncate(data.responseData) : undefined,
      errorMessage: data.errorMessage,
      durationMs: data.durationMs,
    },
  });
}
