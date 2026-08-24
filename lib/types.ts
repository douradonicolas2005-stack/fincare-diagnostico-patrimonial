export type Step =
  | 1
  | 2
  | 3
  | 4
  | "teaser"
  | "loading"
  | "result"
  | "manual"
  | "alocacao"
  | 5
  | 6
  | "final"

// Classes de risco usadas tanto na captura da carteira investida quanto na
// alocacao de referencia por perfil (PROFILES em calculator.ts). Os nomes
// precisam bater EXATAMENTE com os de PROFILES[*].alocacao para o
// comparativo "atual x ideal" casar por classe.
export const ASSET_CLASSES = [
  "Renda Fixa",
  "Multimercado",
  "Renda Variável Local",
  "Internacional",
  "Alternativos"
] as const

export type AssetClass = (typeof ASSET_CLASSES)[number]

// Quanto (em R$) o usuario tem investido em cada classe. Base do Investment
// Checkup (atual x ideal) e, depois, do Fee Analyzer.
export type InvestmentAllocation = Record<AssetClass, number>

export type Allocation = {
  nome: string
  pct: number
  cor: string
  valor?: number
}

export type Lead = {
  nome: string
  telefone: string
  email: string
  cidade: string
  estado: string
  faixa_patrimonio: string
  faixa_renda: string
  instituicao_financeira_atual: string
  possui_assessor: string
  possui_gerente_banco: string
  objetivo_financeiro: string
  consentimento_contato: boolean
  consentimento_data_hora: string
  honeypot: string
}

export type Calculation = {
  idade: number
  patrimonio0: number
  aporte: number
  rent: number
  renda: number
  retirada: number
  necessario: number
  anos: number | null
  trajetoria: number[]
  anosCenarioAporte: number | null
  anosCenarioRent: number | null
  perfilInvestidor?: InvestorProfile
}

export type InvestorProfile = {
  nome: string
  descricao: string
  alocacao: Allocation[]
  pontuacao: number
}

export type AdvancedState = {
  source: "manual" | "portfolio" | null
  extraLiquido: number
  allocation: Allocation[] | null
  // Carteira investida dividida por classe de risco (captura opcional na
  // Etapa 2 do diagnostico avancado). Separada de `allocation` (que e a
  // composicao patrimonial: imoveis, previdencia, empresas, caixa...).
  carteiraClasses: InvestmentAllocation | null
}
