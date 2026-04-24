import type { Parcelamento } from '../types';

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getNumeroParcelas(parcelamento: Parcelamento): number {
  return Math.max(0, parseInt(parcelamento.numeroParcelas || '0', 10) || 0);
}

export function isParcelamentoAvista(parcelamento: Parcelamento): boolean {
  return getNumeroParcelas(parcelamento) === 0;
}

export function temEntradaDiferente(parcelamento: Parcelamento): boolean {
  return toNumber(parcelamento.valorEntrada) > 0 && toNumber(parcelamento.valorEntrada) !== toNumber(parcelamento.valorParcela);
}

export function getResumoPagamento(parcelamento: Parcelamento): string {
  const numeroParcelas = getNumeroParcelas(parcelamento);

  if (numeroParcelas === 0) {
    return `a vista por ${formatCurrency(parcelamento.valorParcela)}`;
  }

  if (temEntradaDiferente(parcelamento)) {
    return `entrada de ${formatCurrency(parcelamento.valorEntrada)} + ${numeroParcelas}x de ${formatCurrency(parcelamento.valorParcela)}`;
  }

  return `${numeroParcelas}x de ${formatCurrency(parcelamento.valorParcela)}`;
}

export function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
