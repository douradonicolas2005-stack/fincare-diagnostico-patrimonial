import type { Allocation, Calculation, InvestorProfile, Lead } from "./types"

export const COLORS = [
  "#2B7E7E",
  "#9FC4C7",
  "#003B49",
  "#5C7278",
  "#B7D8CE",
  "#0B2A32",
  "#7FA7A6",
  "#C9DCD4"
]

export const PROFILES: Record<string, Omit<InvestorProfile, "pontuacao">> = {
  ultraconservador: {
    nome: "Ultraconservador",
    descricao:
      "Baixíssima tolerância a oscilações. Prioriza estabilidade e previsibilidade, com carteira concentrada em Renda Fixa.",
    alocacao: [
      { nome: "Renda Fixa", pct: 100, cor: "#003B49" },
      { nome: "Multimercado", pct: 0, cor: "#2B7E7E" },
      { nome: "Renda Variável Local", pct: 0, cor: "#2B7E7E" },
      { nome: "Internacional", pct: 0, cor: "#9FC4C7" },
      { nome: "Alternativos", pct: 0, cor: "#5C7278" }
    ]
  },
  conservador: {
    nome: "Conservador",
    descricao:
      "Baixa aceitação a oscilações, com espaço para diversificar além da Renda Fixa, somando Multimercado, Renda Variável Local e ativos internacionais.",
    alocacao: [
      { nome: "Renda Fixa", pct: 77, cor: "#003B49" },
      { nome: "Multimercado", pct: 8, cor: "#2B7E7E" },
      { nome: "Renda Variável Local", pct: 5, cor: "#2B7E7E" },
      { nome: "Internacional", pct: 6, cor: "#9FC4C7" },
      { nome: "Alternativos", pct: 4, cor: "#5C7278" }
    ]
  },
  moderado: {
    nome: "Moderado",
    descricao:
      "Aceita oscilações em prol de maior potencial de retorno. Fundos Multimercado ganham peso relevante, com visão de longo prazo.",
    alocacao: [
      { nome: "Renda Fixa", pct: 54, cor: "#003B49" },
      { nome: "Multimercado", pct: 16, cor: "#2B7E7E" },
      { nome: "Renda Variável Local", pct: 10, cor: "#2B7E7E" },
      { nome: "Internacional", pct: 13, cor: "#9FC4C7" },
      { nome: "Alternativos", pct: 7, cor: "#5C7278" }
    ]
  },
  dinamico: {
    nome: "Dinâmico",
    descricao:
      "Aceita oscilações significativas em busca de maiores retornos, com maior exposição a Renda Variável, Fundos Imobiliários e Internacional. Foco em longo prazo.",
    alocacao: [
      { nome: "Renda Fixa", pct: 36, cor: "#003B49" },
      { nome: "Multimercado", pct: 16, cor: "#2B7E7E" },
      { nome: "Renda Variável Local", pct: 17, cor: "#2B7E7E" },
      { nome: "Internacional", pct: 21, cor: "#9FC4C7" },
      { nome: "Alternativos", pct: 10, cor: "#5C7278" }
    ]
  }
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  })
}

export function project(
  initial: number,
  monthly: number,
  annualRate: number,
  target: number,
  maxYears = 45
) {
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1

  let patrimony = initial
  const trajectory = [patrimony]
  let months: number | null = initial >= target ? 0 : null

  for (let month = 1; month <= maxYears * 12; month++) {
    patrimony = patrimony * (1 + monthlyRate) + monthly

    if (month % 12 === 0) trajectory.push(patrimony)
    if (months === null && patrimony >= target) months = month
    if (months !== null && month % 12 === 0) break
  }

  return {
    anos: months === null ? null : Math.ceil(months / 12),
    trajectory,
    final: patrimony
  }
}

export function classifyProfile(
  lead: Lead,
  calc: Pick<Calculation, "rent" | "retirada">
): InvestorProfile {
  const patrimonio: Record<string, number> = {
    ate_500k: 0,
    "500k_1m": 1,
    "1m_5m": 2,
    "5m_mais": 3
  }
  const renda: Record<string, number> = {
    ate_15k: 0,
    "15k_40k": 1,
    "40k_100k": 2,
    "100k_mais": 3
  }
  let tolerance = 0
  if (calc.rent > 0.04) tolerance++
  if (calc.rent > 0.06) tolerance++
  if (calc.rent > 0.09) tolerance++
  if (calc.retirada >= 0.05) tolerance += 0.5
  if (calc.retirada <= 0.03) tolerance -= 0.5
  const capacity =
    ((patrimonio[lead.faixa_patrimonio] || 0) +
      (renda[lead.faixa_renda] || 0)) /
    2
  const knowledge =
    (lead.possui_assessor === "sim" ? 2 : 0) +
    (lead.possui_gerente_banco === "sim" ? 1 : 0)
  const score = tolerance + capacity + knowledge
  const key =
    score <= 2
      ? "ultraconservador"
      : score <= 4
        ? "conservador"
        : score <= 6
          ? "moderado"
          : "dinamico"
  return { ...PROFILES[key], pontuacao: score }
}

export function calculate(
  input: {
    idade: number
    patrimonio0: number
    aporte: number
    rent: number
    renda: number
    retirada: number
  },
  lead: Lead
): Calculation {
  const necessario = (input.renda * 12) / input.retirada
  const base = project(input.patrimonio0, input.aporte, input.rent, necessario)
  const aporte = project(
    input.patrimonio0,
    input.aporte + 2000,
    input.rent,
    necessario
  )
  const rent = project(
    input.patrimonio0,
    input.aporte,
    input.rent + 0.01,
    necessario
  )
  const result: Calculation = {
    ...input,
    necessario,
    anos: base.anos,
    trajetoria: base.trajectory,
    anosCenarioAporte: aporte.anos,
    anosCenarioRent: rent.anos
  }
  result.perfilInvestidor = classifyProfile(lead, result)
  return result
}

export function allocationFromCategories(
  categories: Record<string, number>
): Allocation[] {
  const total =
    Object.values(categories).reduce(
      (sum, value) => sum + Math.max(0, value),
      0
    ) || 1
  return Object.entries(categories)
    .map(([nome, valor], index) => ({
      nome,
      valor: Math.max(0, valor),
      pct: (Math.max(0, valor) / total) * 100,
      cor: COLORS[index % COLORS.length]
    }))
    .filter(item => item.valor! > 0)
    .sort((a, b) => (b.valor || 0) - (a.valor || 0))
}
