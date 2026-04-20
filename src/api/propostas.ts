import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { EfetivarRequest, AcordoEfetivado, ResponseAPI } from '../types';

export const propostasApi = {
  async efetivar(request: EfetivarRequest): Promise<ResponseAPI<AcordoEfetivado>> {
    try {
      const url = API_ENDPOINTS.PROPOSTAS.EFETIVAR();
      const data = await apiClient.post<AcordoEfetivado>(url, request);
      return { data, sucesso: true, mensagem: 'Proposta enviada com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Não foi possível enviar a proposta.',
      };
    }
  },
};
