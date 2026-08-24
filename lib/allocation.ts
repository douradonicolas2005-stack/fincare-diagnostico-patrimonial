import type { Allocation, AssetClass, InvestmentAllocation } from "./types"
import { ASSET_CLASSES } from "./types"

// Comparativo "sua alocacao x alocacao de referencia do seu perfil" — o
// Investment Checkup (Empower). Funcoes puras/testaveis, mesmo padrao de
// lib/fit.ts e lib/checkup.ts.

export type AllocationCompareRow = {
  classe: AssetClass
  atualPct: number
  idealPct: number
  gap: number // atual - ideal, em pontos percentuais
}

export function totalCarteira(carteira: InvestmentAllocation): number {
  return ASSET_CLASSES.reduce(
    (sum, classe) => sum + Math.max(0, carteira[classe] || 0),
    0
  )
}

export function carteiraEmPercent(
  carteira: InvestmentAllocation
): Record<AssetClass, number> {
  const total = totalCarteira(carteira) || 1
  return Object.fromEntries(
    ASSET_CLASSES.map(classe => [
      classe,
      (Math.max(0, carteira[classe] || 0) / total) * 100
    ])
  ) as Record<AssetClass, number>
}

// Compara a carteira informada com a alocacao de referencia do perfil
// (PROFILES[*].alocacao, casada por nome de classe).
export function compareToIdeal(
  carteira: InvestmentAllocation,
  ideal: Allocation[]
): AllocationCompareRow[] {
  const atual = carteiraEmPercent(carteira)
  const idealPorNome = new Map(ideal.map(item => [item.nome, item.pct]))
  return ASSET_CLASSES.map(classe => {
    const atualPct = Math.round(atual[classe])
    const idealPct = Math.round(idealPorNome.get(classe) ?? 0)
    return { classe, atualPct, idealPct, gap: atualPct - idealPct }
  })
}

// Maior desvio (em pontos) entre atual e referencia — usado para um insight
// educacional de destaque, sem virar recomendacao de ativo especifico.
export function maiorDesvio(
  rows: AllocationCompareRow[]
): AllocationCompareRow | null {
  if (rows.length === 0) return null
  return rows.reduce((maior, row) =>
    Math.abs(row.gap) > Math.abs(maior.gap) ? row : maior
  )
}
