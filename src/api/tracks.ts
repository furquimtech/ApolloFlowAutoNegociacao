import axios from 'axios';

const BASE = '/tracks';
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
    `${BASE}/api/auth/token`,
    { apiKey: import.meta.env.VITE_TRACKS_API_KEY }
  );
  const { accessToken, expiresIn } = res.data;
  const expiryMs = Date.now() + expiresIn * 1000 - 60_000;
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs));
  return accessToken;
}

async function authed<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const token = await getToken();
  return fn(token);
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ── Sessão ──────────────────────────────────────────────────────────────────

export interface IniciarSessaoPayload {
  sessionId: string;
  clienteId?: string;
  clienteCpf?: string;
  negociacaoId?: string;
  themeId?: string;
  origemUtm?: string;
  userAgent?: string;
}

async function iniciarSessao(payload: IniciarSessaoPayload): Promise<void> {
  await authed((t) =>
    axios.post(`${BASE}/api/sessoes`, payload, { headers: headers(t) })
  );
}

// ── Evento ───────────────────────────────────────────────────────────────────

export interface EventoPayload {
  sessionId: string;
  tipo: string;
  pagina?: string;
  referencia?: string;
  dados?: Record<string, unknown>;
}

async function registrarEvento(payload: EventoPayload): Promise<void> {
  const body = {
    ...payload,
    dados: payload.dados ? JSON.stringify(payload.dados) : undefined,
  };
  await authed((t) =>
    axios.post(`${BASE}/api/eventos`, body, { headers: headers(t) })
  );
}

export const tracksApi = { iniciarSessao, registrarEvento };
