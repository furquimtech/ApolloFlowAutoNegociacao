import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Cliente, ResponseAPI } from '../types';

export const clienteApi = {
  async buscarPorCpf(cpf: string): Promise<ResponseAPI<Cliente>> {
    try {
      const url = API_ENDPOINTS.CLIENTES.BUSCAR_CPF(cpf);
      const data = await apiClient.get<Cliente[]>(url);
      const cliente = Array.isArray(data) ? data[0] : null;
      if (!cliente) {
        return { data: null, sucesso: false, mensagem: 'CPF não encontrado.' };
      }
      return { data: cliente, sucesso: true, mensagem: 'Operação realizada com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Não foi possível validar o CPF.',
      };
    }
  },
};
