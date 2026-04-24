import { acordosApi } from '../api/acordos';
import type { Contrato, Parcelamento, SimulacaoRequest, SimulacaoResponse } from '../types';

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDecimalString(value: number): string {
  return value.toFixed(2);
}

function normalizarParcelamento(parcelamento: Parcelamento, valorDivida: string): Parcelamento {
  const descontoCalculado = Math.max(toNumber(valorDivida) - toNumber(parcelamento.valorTotal), 0);
  const percentualDesconto = toNumber(valorDivida) > 0
    ? Math.round((descontoCalculado / toNumber(valorDivida)) * 100)
    : 0;

  return {
    ...parcelamento,
    descontoTotal: toDecimalString(descontoCalculado),
    percentualDesconto,
  };
}

function normalizarSimulacao(simulacao: SimulacaoResponse): SimulacaoResponse {
  return {
    ...simulacao,
    parcelamentos: simulacao.parcelamentos.map((parcelamento) =>
      normalizarParcelamento(parcelamento, simulacao.valorDivida)
    ),
  };
}

export async function simularPorContratos(clienteId: string, contratos: Contrato[]): Promise<SimulacaoResponse | null> {
  const todasParcelas = contratos.flatMap((contrato) =>
    contrato.parcelas.map((parcela) => ({
      parcela: parcela.id,
    }))
  );

  const simRequest: SimulacaoRequest = {
    cliente: clienteId,
    negociacao: import.meta.env.VITE_NEGOCIACAO_ID,
    meioPagamento: import.meta.env.VITE_MEIO_PAGAMENTO,
    calcularDescontoParcelamento: true,
    parcelas: todasParcelas,
  };

  const simResult = await acordosApi.simular(simRequest);
  if (!simResult.sucesso || !simResult.data) return null;
  return normalizarSimulacao(simResult.data);
}
