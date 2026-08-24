import type { LeadPayload } from "./security"

// Score de "fit" comercial: o quanto o lead bate com o cliente ideal da
// assessoria, independente de quao avancada esta a conversa. Calculado no
// server e enviado ao cockpit para priorizar quem vale a ligacao.
//
//   fit = 45% * min(patrimonio / 5M, 1)
//       + 35% * min(aporte_mensal / 20k, 1)
//       + 20  se o lead ainda nao tem assessor (maior oportunidade)
//       + 10  se paga taxa >= 1% a.a. (paga caro hoje = oportunidade clara)
//   (teto de 100)
//
// Formula herdada da priorizacao do Apps Script legado, formalizada aqui.

export type FitTier = "A" | "B" | "C"

export type FitResult = {
  fit_score: number
  fit_tier: FitTier
}

export type FitInput = Pick<
  LeadPayload,
  | "patrimonio_atual"
  | "aporte_mensal"
  | "faixa_patrimonio"
  | "faixa_renda"
  | "possui_assessor"
  | "taxa_atual"
>

const PATRIMONIO_TETO = 5_000_000
const APORTE_TETO = 20_000

const PESO_PATRIMONIO = 45
const PESO_APORTE = 35
const BONUS_SEM_ASSESSOR = 20
const BONUS_TAXA_ALTA = 10
const TAXA_ALTA_LIMIAR = 0.01 // 1% a.a.

// Fallback quando o lead veio pelo diagnostico rapido e nao informou valores
// numericos: usa uma estimativa conservadora a partir da faixa declarada.
const PATRIMONIO_POR_FAIXA: Record<LeadPayload["faixa_patrimonio"], number> = {
  ate_500k: 250_000,
  "500k_1m": 750_000,
  "1m_5m": 3_000_000,
  "5m_mais": 5_000_000
}

const APORTE_POR_FAIXA_RENDA: Record<LeadPayload["faixa_renda"], number> = {
  ate_15k: 2_000,
  "15k_40k": 6_000,
  "40k_100k": 15_000,
  "100k_mais": 20_000
}

function tierPara(score: number): FitTier {
  if (score >= 70) return "A"
  if (score >= 40) return "B"
  return "C"
}

export function computeFit(lead: FitInput): FitResult {
  const patrimonio =
    typeof lead.patrimonio_atual === "number" && lead.patrimonio_atual > 0
      ? lead.patrimonio_atual
      : PATRIMONIO_POR_FAIXA[lead.faixa_patrimonio]

  const aporte =
    typeof lead.aporte_mensal === "number" && lead.aporte_mensal > 0
      ? lead.aporte_mensal
      : APORTE_POR_FAIXA_RENDA[lead.faixa_renda]

  const componentePatrimonio = PESO_PATRIMONIO * Math.min(patrimonio / PATRIMONIO_TETO, 1)
  const componenteAporte = PESO_APORTE * Math.min(aporte / APORTE_TETO, 1)
  const bonusSemAssessor = lead.possui_assessor === "nao" ? BONUS_SEM_ASSESSOR : 0
  const bonusTaxaAlta =
    typeof lead.taxa_atual === "number" && lead.taxa_atual >= TAXA_ALTA_LIMIAR
      ? BONUS_TAXA_ALTA
      : 0

  const fit_score = Math.min(
    100,
    Math.round(componentePatrimonio + componenteAporte + bonusSemAssessor + bonusTaxaAlta)
  )

  return { fit_score, fit_tier: tierPara(fit_score) }
}
