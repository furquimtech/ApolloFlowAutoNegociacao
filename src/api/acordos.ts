import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  SimulacaoRequest,
  SimulacaoResponse,
  EfetivarRequest,
  AcordoEfetivado,
  AcordoHistorico,
  ResponseAPI,
} from '../types';

export const acordosApi = {
  async simular(request: SimulacaoRequest): Promise<ResponseAPI<SimulacaoResponse>> {
    try {
      const url = API_ENDPOINTS.ACORDOS.SIMULAR();
      const data = await apiClient.post<SimulacaoResponse>(url, request);
      return { data, sucesso: true, mensagem: 'Operação realizada com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Não foi possível simular o acordo.',
      };
    }
  },

  async efetivar(request: EfetivarRequest): Promise<ResponseAPI<AcordoEfetivado>> {
    try {
      const url = API_ENDPOINTS.ACORDOS.EFETIVAR();
      const data = await apiClient.post<AcordoEfetivado>(url, request);
      return { data, sucesso: true, mensagem: 'Acordo efetivado com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Não foi possível efetivar o acordo.',
      };
    }
  },

  async listarPorCliente(clienteId: string): Promise<ResponseAPI<AcordoHistorico[]>> {
    try {
      const url = API_ENDPOINTS.ACORDOS.LISTAR(clienteId);
      const data = await apiClient.get<AcordoHistorico[]>(url);
      const acordos = Array.isArray(data) ? data : [];
      return { data: acordos, sucesso: true, mensagem: 'Operação realizada com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Não foi possível buscar os acordos.',
      };
    }
  },

  async baixarBoleto(parcelaId: string): Promise<void> {
    const url = API_ENDPOINTS.ACORDOS.BOLETO(parcelaId);
    const blob = await apiClient.getBlob(url);
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  },
};
