import type { Allocation, Calculation } from "@/lib/types"

export type ManualValues = {
  imoveis: number
  aplicacoes: number
  previdencia: number
  empresas: number
  caixa: number
  financiamentos: number
  emprestimos: number
}

export type DashboardSummary = {
  total: number
  liquid: number
  rv: number
}

export type DashboardProps = {
  calc: Calculation
  allocation: Allocation[]
  summary: DashboardSummary
  onBack: () => void
  onFinalize: () => void
  sending: boolean
}
