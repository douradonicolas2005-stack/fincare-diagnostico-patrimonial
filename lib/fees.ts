// Fee Analyzer — inspirado no Fee Analyzer da Empower/Personal Capital. Mostra,
// de forma EDUCACIONAL, quanto a taxa que a pessoa paga hoje pode custar no
// longo prazo em relacao a uma referencia mais eficiente. Nao promete que a
// Fincare cobra menos; e uma estimativa ilustrativa. Funcao pura/testavel,
// mesmo padrao de lib/fit.ts, lib/checkup.ts e lib/allocation.ts.

export type FeeBand = {
  label: string
  taxa: number // fracao ao ano (ex.: 0.015 = 1,5% a.a.)
  estimado: boolean // true quando o usuario nao sabe e usamos media de mercado
}

// Bandas de taxa oferecidas na captura. "Nao sei" cai numa estimativa
// conservadora de mercado (fundos/produtos de balcao bancario costumam somar
// bem mais que isso, entao 1,2% e propositalmente moderado).
export const FEE_OPTIONS: FeeBand[] = [
  { label: "Não sei / não acompanho", taxa: 0.012, estimado: true },
  { label: "Menos de 0,5% ao ano", taxa: 0.004, estimado: false },
  { label: "Entre 0,5% e 1% ao ano", taxa: 0.0075, estimado: false },
  { label: "Entre 1% e 2% ao ano", taxa: 0.015, estimado: false },
  { label: "Mais de 2% ao ano", taxa: 0.025, estimado: false }
]

export function feeBandPorLabel(label: string): FeeBand | null {
  return FEE_OPTIONS.find(option => option.label === label) || null
}

export type FeeImpact = {
  taxaAtual: number
  taxaEficiente: number
  estimado: boolean
  custoPrimeiroAno: number
  patrimonioComAtual: number
  patrimonioComEficiente: number
  drag: number // quanto o patrimonio final pode ser MAIOR com taxa eficiente
  anos: number
}

export function computeFeeImpact(input: {
  investido: number
  taxaAtual: number
  estimado: boolean
  anos: number
  rentabilidadeBruta: number
  taxaEficiente?: number
}): FeeImpact {
  const taxaEficiente = input.taxaEficiente ?? 0.005
  const anos = Math.max(1, Math.min(45, Math.round(input.anos)))
  // Retorno liquido de taxa em cada cenario (piso em 0 pra nao gerar valores
  // negativos absurdos se a taxa informada for maior que a rentabilidade).
  const liquidoAtual = Math.max(0, input.rentabilidadeBruta - input.taxaAtual)
  const liquidoEficiente = Math.max(0, input.rentabilidadeBruta - taxaEficiente)
  const fvAtual = input.investido * Math.pow(1 + liquidoAtual, anos)
  const fvEficiente = input.investido * Math.pow(1 + liquidoEficiente, anos)

  return {
    taxaAtual: input.taxaAtual,
    taxaEficiente,
    estimado: input.estimado,
    custoPrimeiroAno: input.investido * input.taxaAtual,
    patrimonioComAtual: fvAtual,
    patrimonioComEficiente: fvEficiente,
    drag: Math.max(0, fvEficiente - fvAtual),
    anos
  }
}
