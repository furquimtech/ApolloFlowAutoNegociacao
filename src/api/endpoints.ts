const BASE = () => '';

export const API_ENDPOINTS = {
  AUTH: {
    TOKEN: () => `${BASE()}/oauth/token`,
  },
  CLIENTES: {
    BUSCAR_CPF: (cpf: string) =>
      `${BASE()}/api/assessorias/clientes?mode=CONTINUABLE&page=0&size=2&cic=${cpf}`,
  },
  CONTRATOS: {
    LISTAR: (clienteId: string) =>
      `${BASE()}/api/assessorias/contratos?mode=CONTINUABLE&cliente=${clienteId}&selector=parcelas,garantias,participantes,liquidacoes,informacoesAdicionais,marcadores,parcelamentos,notasFiscais`,
  },
  ACORDOS: {
    LISTAR: (clienteId: string) =>
      `${BASE()}/api/assessorias/acordos?mode=CONTINUABLE&cliente=${clienteId}&selector=parcelas,pagamentos,origens,pendencias,informacoesAdicionais`,
    SIMULAR: () => `${BASE()}/api/assessorias/acordos/simular`,
    EFETIVAR: () => `${BASE()}/api/assessorias/acordos/efetivar`,
    BOLETO: (parcelaId: string) =>
      `${BASE()}/api/assessorias/acordos/boletos/${parcelaId}`,
  },
  PROPOSTAS: {
    EFETIVAR: () => `${BASE()}/api/assessorias/propostas/efetivar`,
  },
};
