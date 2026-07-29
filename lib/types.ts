export type Step =
  | 1
  | 2
  | 3
  | 4
  | "teaser"
  | "loading"
  | "result"
  | "advanced"
  | "manual"
  | "portfolio"
  | "dashboard"
  | 5
  | 6
  | "final"

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
}
