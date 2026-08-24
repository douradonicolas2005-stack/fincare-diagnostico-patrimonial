import type { Allocation } from "./types"

// Checkup patrimonial: consolida em um "scorecard" os eixos de saude da
// carteira que antes ficavam espalhados no diagnostico (diversificacao,
// concentracao, liquidez). Inspirado no "Investment Checkup" (Empower) e no
// "Checkup" da Magnetis - mostra, por eixo, se esta bom ou merece atencao,
// em linguagem EDUCACIONAL/generica (nunca recomendacao de ativo especifico,
// pra nao escorregar em consultoria de valores mobiliarios).
//
// Funcao pura pra ser testavel isolada, mesmo padrao de lib/fit.ts.

export type CheckupStatus = "bom" | "atencao" | "alerta"

export type CheckupAxis = {
  eixo: string
  status: CheckupStatus
  titulo: string
  detalhe: string
}

export type CheckupResult = {
  eixos: CheckupAxis[]
  resumo: string
}

export type CheckupInput = {
  allocation: Allocation[]
  // summary.liquid do Simulator: % do patrimonio em ativos liquidos.
  liquidezPct: number
}

function diversificacao(allocation: Allocation[]): CheckupAxis {
  const classesRelevantes = allocation.filter(item => item.pct >= 5).length
  if (classesRelevantes >= 5) {
    return {
      eixo: "Diversificação",
      status: "bom",
      titulo: "Alta",
      detalhe:
        "Seu patrimônio está distribuído em várias classes, o que ajuda a diluir riscos específicos."
    }
  }
  if (classesRelevantes >= 3) {
    return {
      eixo: "Diversificação",
      status: "atencao",
      titulo: "Moderada",
      detalhe:
        "Há espaço para distribuir melhor o patrimônio entre classes de ativos."
    }
  }
  return {
    eixo: "Diversificação",
    status: "alerta",
    titulo: "Baixa",
    detalhe:
      "Seu patrimônio está concentrado em poucas classes — diversificar tende a reduzir riscos."
  }
}

function concentracao(allocation: Allocation[]): CheckupAxis {
  const maior = [...allocation].sort((a, b) => b.pct - a.pct)[0]
  if (maior && maior.pct >= 45) {
    return {
      eixo: "Concentração",
      status: "alerta",
      titulo: `${Math.round(maior.pct)}% em ${maior.nome}`,
      detalhe:
        "Uma fatia grande em um único bloco aumenta a exposição a riscos específicos daquele ativo."
    }
  }
  return {
    eixo: "Concentração",
    status: "bom",
    titulo: "Equilibrada",
    detalhe:
      "Nenhuma classe domina o patrimônio de forma que concentre risco em excesso."
  }
}

function liquidez(liquidezPct: number): CheckupAxis {
  if (liquidezPct >= 60) {
    return {
      eixo: "Liquidez",
      status: "bom",
      titulo: "Boa",
      detalhe:
        "Grande parte do patrimônio pode ser acessada rapidamente, se necessário."
    }
  }
  if (liquidezPct >= 35) {
    return {
      eixo: "Liquidez",
      status: "atencao",
      titulo: "Moderada",
      detalhe:
        "Parte relevante do patrimônio está em ativos menos líquidos, como imóveis ou previdência."
    }
  }
  return {
    eixo: "Liquidez",
    status: "alerta",
    titulo: "Baixa",
    detalhe: "Considere reforçar uma reserva de curto prazo mais acessível."
  }
}

export function computeCheckup(input: CheckupInput): CheckupResult {
  const eixos = [
    diversificacao(input.allocation),
    concentracao(input.allocation),
    liquidez(input.liquidezPct)
  ]

  const temAlerta = eixos.some(e => e.status === "alerta")
  const temAtencao = eixos.some(e => e.status === "atencao")

  const resumo = temAlerta
    ? "Seu diagnóstico aponta pontos de atenção relevantes — vale uma conversa com um especialista da Fincare para reequilibrar a estratégia."
    : temAtencao
      ? "Sua carteira está razoável, com alguns ajustes possíveis que um especialista pode ajudar a priorizar."
      : "Sua carteira está equilibrada nos principais eixos. Um especialista pode ajudar a manter e otimizar essa estrutura."

  return { eixos, resumo }
}
