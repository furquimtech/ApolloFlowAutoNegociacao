import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';
import { trackApiCall } from '../tracking/tracker';
import type { TokenResult } from '../types';

const TOKEN_KEY = 'cobransaas_token';
const TOKEN_EXPIRY_KEY = 'cobransaas_token_expiry';

function getCachedToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  if (token && expiry && Date.now() < Number(expiry)) return token;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  return null;
}

function setCachedToken(token: string, expiresInSeconds: number): void {
  const expiryMs = Date.now() + expiresInSeconds * 1000 - 60_000;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryMs));
}

async function fetchToken(): Promise<string> {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post<TokenResult>(
      API_ENDPOINTS.AUTH.TOKEN(),
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${import.meta.env.VITE_API_SECRET}`,
        },
      }
    );

    const { access_token, expires_in } = response.data;
    setCachedToken(access_token, expires_in);
    return access_token;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('[Auth] Status:', err.response?.status);
      console.error('[Auth] Response body:', JSON.stringify(err.response?.data));
      console.error('[Auth] URL:', err.config?.url);
    }
    throw err;
  }
}

async function getToken(): Promise<string> {
  const cached = getCachedToken();
  if (cached) return cached;
  return fetchToken();
}

// ── Instância axios dedicada para a API Cobransaas ───────────────────────────
// Usar instância separada evita que os interceptors capturem chamadas do próprio
// tracksApi (que usa o axios global), prevenindo loop infinito.
const cobransaasAxios = axios.create();

// Marca o momento do request para calcular duração na resposta
cobransaasAxios.interceptors.request.use((config) => {
  (config as Record<string, unknown>)._startMs = Date.now();
  return config;
});

// Captura resposta bem-sucedida
cobransaasAxios.interceptors.response.use(
  (response) => {
    const durationMs = Date.now() - ((response.config as Record<string, unknown>)._startMs as number ?? Date.now());
    trackApiCall({
      method: response.config.method ?? 'get',
      url: response.config.url ?? '',
      requestBody: response.config.data ? tryParse(response.config.data) : undefined,
      responseStatus: response.status,
      responseData: response.data,
      durationMs,
    });
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const durationMs = Date.now() - ((error.config as Record<string, unknown>)?._startMs as number ?? Date.now());
      trackApiCall({
        method: error.config?.method ?? 'get',
        url: error.config?.url ?? '',
        requestBody: error.config?.data ? tryParse(error.config.data) : undefined,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        errorMessage: error.message,
        durationMs,
      });
    }
    return Promise.reject(error);
  }
);

function tryParse(data: unknown): unknown {
  if (typeof data !== 'string') return data;
  try { return JSON.parse(data); } catch { return data; }
}

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const token = await getToken();
    const response = await cobransaasAxios.get<T>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async post<T>(url: string, data: unknown): Promise<T> {
    const token = await getToken();
    const response = await cobransaasAxios.post<T>(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  async getBlob(url: string): Promise<Blob> {
    const token = await getToken();
    const response = await cobransaasAxios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    return response.data;
  },
};
