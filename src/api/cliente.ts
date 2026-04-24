import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Cliente, ResponseAPI } from '../types';

function parsePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) return null;

  return {
    ddd: Number(digits.slice(0, 2)),
    telefone: Number(digits.slice(2)),
  };
}

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

  async adicionarTelefone(clienteId: string, telefone: string): Promise<ResponseAPI<null>> {
    const parsed = parsePhone(telefone);
    if (!parsed) {
      return { data: null, sucesso: false, mensagem: 'Telefone invalido.' };
    }

    try {
      const url = API_ENDPOINTS.CLIENTES.TELEFONES(clienteId);
      await apiClient.post(url, {
        ddd: parsed.ddd,
        telefone: parsed.telefone,
        tipo: 'CELULAR',
      });
      return { data: null, sucesso: true, mensagem: 'Telefone cadastrado com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Nao foi possivel cadastrar o telefone.',
      };
    }
  },

  async adicionarEmail(clienteId: string, email: string): Promise<ResponseAPI<null>> {
    try {
      const url = API_ENDPOINTS.CLIENTES.EMAILS(clienteId);
      await apiClient.post(url, {
        email,
        principal: false,
      });
      return { data: null, sucesso: true, mensagem: 'E-mail cadastrado com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Nao foi possivel cadastrar o e-mail.',
      };
    }
  },

  async adicionarEndereco(
    clienteId: string,
    endereco: {
      cep: string;
      complemento: string;
      logradouro: string;
      bairro: string;
      cidade: string;
      numero: string;
      tipoLogradouro: string;
      uf: string;
    }
  ): Promise<ResponseAPI<null>> {
    try {
      const url = API_ENDPOINTS.CLIENTES.ENDERECOS(clienteId);
      await apiClient.post(url, {
        cep: endereco.cep.replace(/\D/g, ''),
        complemento: endereco.complemento,
        logradouro: endereco.logradouro,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        numero: endereco.numero,
        tipo: 'RESIDENCIAL',
        tipoLogradouro: endereco.tipoLogradouro,
        uf: endereco.uf,
        principal: false,
      });
      return { data: null, sucesso: true, mensagem: 'Endereco cadastrado com sucesso.' };
    } catch (error) {
      return {
        data: null,
        sucesso: false,
        mensagem: (error as Error).message ?? 'Nao foi possivel cadastrar o endereco.',
      };
    }
  },
};
