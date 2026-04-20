import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Contrato, ResponseAPI } from '../types';

export const contratosApi = {
  async listar(clienteId: string): Promise<ResponseAPI<Contrato[]>> {
    try {
      const url = API_ENDPOINTS.CONTRATOS.LISTAR(clienteId);
      const data = await apiClient.get<Contrato[]>(url);
      const contratos = Array.isArray(data) ? data : [];
      return { data: contratos, sucesso: true, mensagem: 'Operação realizada com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Não foi possível buscar os contratos.',
      };
    }
  },
};
