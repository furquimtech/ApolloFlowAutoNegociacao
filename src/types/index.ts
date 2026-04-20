/* ─── API generic wrapper ─────────────────────────────── */
export interface ResponseAPI<T> {
  data: T | null;
  sucesso: boolean;
  mensagem: string;
}

/* ─── OAuth token ─────────────────────────────────────── */
export interface TokenResult {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/* ─── Cliente Cobransaas ──────────────────────────────── */
export interface Cliente {
  id: string;
  idExterno: string;
  tipoPessoa: string;
  situacao: string;
  nome: string;
  cic: string;
  codigo: string;
  dataNascimento: string;
  dataConta: string;
  diasAtraso: string;
  supervisor: string | null;
}

/* ─── Contratos ───────────────────────────────────────── */
export interface ParcelaContrato {
  id: string;
  numeroContrato: string;
  numeroParcela: string;
  dataVencimento: string;
  diasAtraso: string;
  saldoPrincipal: string;
  saldoTotal: string;
  saldoAtual: string;
  saldoContabil: string;
  valorPrincipal: string;
  valorTotal: string;
  valorMulta: string;
  valorPermanencia: string;
  valorMora: string;
  valorOutros: string;
  valorDesconto: string;
  valorDespesa: string | null;
  valorBoleto: string | null;
  situacao: string;
  agencia: string | null;
  banco: string | null;
  conta: string | null;
  nossoNumero: string | null;
  faturamento: boolean;
}

export interface Contrato {
  id: string;
  idExterno: string;
  numeroContrato: string;
  nomeProduto: string;
  dataEmissao: string;
  dataOperacao: string;
  situacao: string;
  tipo: string;
  empresa: string;
  numeroParcelas: string;
  saldoVencido: string;
  saldoTotal: string;
  saldoAtraso: string;
  saldoAtual: string;
  saldoContabil: string;
  diasAtraso: string;
  parcelas: ParcelaContrato[];
}

/* ─── Simulação ───────────────────────────────────────── */
export interface ParcelaSimulacao {
  numeroParcela: string;
  dataVencimento: string;
  valorPrincipal: string;
  valorJuros: string;
  valorTarifa: string;
  valorTarifaParcela: string;
  valorSeguro: string;
  valorTotal: string;
  permiteAlterarMeioPagamento: boolean;
  meioPagamento: string | null;
}

export interface DescontoSimulacao {
  contrato: string;
  numeroContrato: string;
  tipoContrato: string;
  nomeProduto: string;
  parcela: string;
  numeroParcela: string;
  dataVencimento: string;
  diasAtraso: string;
  valorPrincipal: string;
  valorJuros: string;
  valorTotal: string;
  valorPermanencia: string;
  valorMora: string;
  valorMulta: string;
  valorOutros: string;
  valorDesconto: string;
  valorAtual: string;
  descontoPrincipal: string;
  descontoJuros: string;
  descontoPermanencia: string;
  descontoMora: string;
  descontoMulta: string;
  descontoOutros: string;
  descontoPrincipalMax: string;
  descontoJurosMax: string;
  descontoPermanenciaMax: string;
  descontoMoraMax: string;
  descontoMultaMax: string;
  descontoOutrosMax: string;
  valorDescontoMin: string;
  valorDescontoMax: string;
  valorParcial: string | null;
  valorParcialMin: string;
  valorParcialMax: string;
  obrigatorio: boolean;
  selecionado: boolean;
}

export interface Parcelamento {
  habilitado: boolean;
  numeroParcelas: string;
  dataOperacao: string;
  dataEmissao: string;
  dataVencimento: string;
  dataUltimoVencimento: string;
  valorParcela: string;
  taxaOperacao: string;
  valorDivida: string;
  valorEntrada: string;
  valorPrincipal: string;
  valorJuros: string;
  valorTarifa: string;
  valorTarifaParcela: string;
  valorTotal: string;
  valorTributo: string;
  descontoDivida: string;
  descontoDividaMax: string;
  descontoTarifa: string;
  descontoTarifaMax: string;
  descontoTarifaParcela: string;
  descontoTarifaParcelaMax: string;
  descontoTotal: string;
  valorParcelaMin: string;
  valorParcelaMax: string;
  valorEntradaMin: string;
  valorEntradaMax: string;
  dataEmissaoMin: string;
  dataEmissaoMax: string;
  dataVencimentoMin: string;
  dataVencimentoMax: string;
  taxaOperacaoMin: string;
  taxaOperacaoMax: string;
  parcelas: ParcelaSimulacao[];
  descontos: DescontoSimulacao[];
}

export interface SimulacaoResponse {
  valorDivida: string;
  dataOperacao: string;
  multiplosContratos: boolean;
  permiteValoresForaMinimoMaximo: boolean;
  permiteProposta: boolean;
  dataVigenciaMin: string | null;
  dataVigenciaMax: string | null;
  parcelas: DescontoSimulacao[];
  parcelamentos: Parcelamento[];
}

export interface SimulacaoParcelaInput {
  parcela: string;
  descontoPrincipal: string;
  descontoJuros: string;
  descontoMora: string;
  descontoMulta: string;
  valorDesconto: string;
}

export interface SimulacaoRequest {
  cliente: string;
  negociacao: string;
  meioPagamento: string;
  calcularDescontoParcelamento: boolean;
  parcelas: SimulacaoParcelaInput[];
}

/* ─── Efetivar Acordo ─────────────────────────────────── */
export interface EfetivarParcelaInput {
  parcela: string;
  descontoPrincipal: string;
  descontoJuros: string;
  descontoPermanencia: string;
  descontoMora: string;
  descontoMulta: string;
  descontoOutros: string;
  valorDesconto: string;
}

export interface EfetivarParcelamentoInput {
  numeroParcelas: string;
  valorEntrada: string;
  dataEmissao: string;
  dataVencimento: string;
  descontoDivida: string;
  taxaOperacao: string;
  descontoTarifa: string;
}

export interface EfetivarRequest {
  cliente: string;
  negociacao: string;
  meioPagamento: string;
  observacao: string;
  parcelas: EfetivarParcelaInput[];
  parcelamento: EfetivarParcelamentoInput;
}

export interface AcordoEfetivado {
  id: string;
  numeroAcordo: string;
  situacao: string;
  valorTotal: string;
  numeroParcelas: string;
  parcelas: ParcelaAcordo[];
}

/* ─── Acordos histórico (Meus Acordos) ───────────────── */
export interface ParcelaAcordo {
  id: string;
  acordo: string;
  numeroParcela: string;
  dataVencimento: string;
  diasAtraso: string;
  situacao: string;
  nossoNumero: string | null;
  valorPrincipal: string;
  valorTributo: string;
  valorTotal: string;
  saldoPrincipal: string;
  saldoTotal: string;
  registrado: boolean;
}

export interface AcordoHistorico {
  id: string;
  numeroAcordo: string;
  dataOperacao: string;
  dataEmissao: string;
  situacao: string;
  valorDesconto: string;
  numeroParcelas: string;
  valorEntrada: string;
  valorPrincipal: string;
  valorTotal: string;
  saldoPrincipal: string;
  saldoTotal: string;
  cliente: {
    id: string;
    nome: string;
    cic: string;
  };
  negociacao: {
    id: string;
    nome: string;
    situacao: string;
  };
  parcelas: ParcelaAcordo[];
  pagamentos: unknown[];
  origens: unknown[];
}

/* ─── Theme types ─────────────────────────────────────── */
export type ThemeId = string;

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  companyName: string;
  logoUrl: string;
  faviconUrl?: string;
}
