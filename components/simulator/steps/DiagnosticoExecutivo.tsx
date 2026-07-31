import { formatCurrency } from "@/lib/calculator"
import type { AdvancedState, Allocation, Calculation } from "@/lib/types"
import type { DiagnosticoSummary } from "../simulator.types"
import { AllocationDonut } from "../charts/AllocationDonut"
import { ExecutiveChart } from "../charts/ExecutiveChart"
import { ExecutiveMetric } from "./ExecutiveMetric"

type DiagnosticoExecutivoProps = {
  calc: Calculation
  advanced: AdvancedState
  allocation: Allocation[]
  summary: DiagnosticoSummary
  sendError: boolean
}

// Página única de fechamento do diagnóstico: junta o que antes eram duas
// telas separadas (Dashboard.tsx + FinalReport.tsx) — mesmos dados, sem
// navegação no meio. Métricas que apareciam duplicadas nas duas telas
// antigas (patrimônio líquido/atual, patrimônio necessário, patrimônio
// projetado) aparecem uma única vez aqui.
export function DiagnosticoExecutivo({
  calc,
  advanced,
  allocation,
  summary,
  sendError
}: DiagnosticoExecutivoProps) {
  const profile = calc.perfilInvestidor!
  const independenceAge = calc.anos === null ? null : calc.idade + calc.anos
  const score = Math.round(
    Math.max(0, Math.min(100, (calc.patrimonio0 / calc.necessario) * 100))
  )
  const projectedPatrimony = calc.trajetoria[Math.min(10, calc.trajetoria.length - 1)]

  const totalAllocated = allocation.reduce((sum, item) => sum + (item.valor || 0), 0) || 1
  const percentageFor = (terms: string[]) =>
    Math.round(
      (allocation
        .filter(item => terms.some(term => item.nome.toLowerCase().includes(term)))
        .reduce((sum, item) => sum + (item.valor || 0), 0) /
        totalAllocated) *
        100
    )
  const fixedIncome = percentageFor(["renda fixa", "previdência", "fundos"])
  const relevantClasses = allocation.filter(item => item.pct >= 5).length
  const diversification = relevantClasses >= 5 ? "Alta" : relevantClasses >= 3 ? "Moderada" : "Baixa"
  const largest = allocation[0]
  const liquidityText = summary.liquid >= 60
    ? "Boa liquidez — grande parte do patrimônio pode ser acessada rapidamente, se necessário."
    : summary.liquid >= 35
      ? "Liquidez moderada — parte relevante do patrimônio está em ativos menos líquidos, como imóveis ou previdência."
      : "Liquidez baixa — considere reforçar uma reserva de curto prazo."

  const metricCards: Array<[string, string]> = [
    ["Patrimônio atual", formatCurrency(summary.total)],
    ["Patrimônio projetado (10 anos)", formatCurrency(projectedPatrimony)],
    ["Meta patrimonial", formatCurrency(calc.necessario)],
    ["Renda passiva estimada hoje", `${formatCurrency((summary.total * calc.retirada) / 12)}/mês`],
    ["Renda passiva desejada", `${formatCurrency(calc.renda)}/mês`],
    ["Idade da independência", independenceAge ? `${independenceAge} anos` : "A ajustar com especialista"],
    ["Score patrimonial", `${score}%`],
    ["Diversificação", diversification]
  ]

  const details: Array<[string, string]> = [
    ["Anos até o Ponto de Virada", calc.anos !== null ? `${calc.anos} ${calc.anos === 1 ? "ano" : "anos"}` : "Fora do horizonte de 45 anos"],
    ["Rentabilidade real utilizada", `${(calc.rent * 100).toFixed(1)}% a.a.`],
    ["Taxa de retirada utilizada", `${(calc.retirada * 100).toFixed(0)}% a.a.`]
  ]

  const recommendations = [
    calc.anosCenarioAporte !== null && calc.anos !== null
      ? `Aumentar o aporte mensal em R$ 2.000 pode antecipar sua independência em cerca de ${calc.anos - calc.anosCenarioAporte} anos.`
      : null,
    calc.anosCenarioRent !== null && calc.anos !== null
      ? `Uma rentabilidade 1 ponto percentual maior pode antecipar sua meta em cerca de ${calc.anos - calc.anosCenarioRent} anos.`
      : null,
    advanced.source
      ? "Aprofundar a análise de alocação com um especialista da Fincare pode revelar oportunidades de eficiência tributária e sucessória."
      : "Complementar o diagnóstico com seus dados patrimoniais completos torna a recomendação de um especialista muito mais precisa.",
    "Revisar a taxa de retirada sustentável periodicamente ajuda a manter o patrimônio protegido ao longo da aposentadoria."
  ].filter((value): value is string => Boolean(value))

  return (
    <div className="final-report">
      <div className="success-banner">Diagnóstico completo gerado. Confira o detalhamento abaixo.</div>
      {sendError && (
        <div className="warning-banner">
          Seu relatório foi gerado normalmente, mas não conseguimos confirmar o registro dele em nosso sistema agora. Se quiser garantir que um especialista receba seus dados, chame no WhatsApp ao final desta página.
        </div>
      )}

      <div className="exec-header">
        <span className="badge">Dashboard Executivo · Fincare Investimentos</span>
        <h3>Seu diagnóstico patrimonial completo</h3>
        <p>Visão consolidada, pronta para ser discutida com um especialista.</p>
      </div>

      <div className="exec-grid">
        {metricCards.map(([label, value]) => (
          <ExecutiveMetric key={label} label={label} value={value} />
        ))}
        <div className="exec-card wide">
          <div className="e-label">Trajetória patrimonial</div>
          <ExecutiveChart trajectory={calc.trajetoria} target={calc.necessario} turningPoint={calc.anos} />
        </div>
      </div>

      <div className="dashboard-section-title">Distribuição por classe de ativos</div>
      <div className="allocation-wrap">
        <AllocationDonut allocation={allocation} />
        <div className="allocation-legend">
          {allocation.map(item => (
            <div key={item.nome} className="allocation-row">
              <i className="allocation-swatch" style={{ background: item.cor }} />
              <span className="allocation-name">{item.nome}</span>
              <b>{item.pct.toFixed(0)}%</b>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section-title">Liquidez da carteira</div>
      <div className="liquidity-bar">
        <div className="liquidity-fill" style={{ width: `${summary.liquid}%` }} />
      </div>
      <p className="hint">{liquidityText}</p>

      <div className="dashboard-section-title">Concentração</div>
      <div className="insights">
        <div className="insight-card">
          <span className="ico">{largest && largest.pct >= 45 ? "◆" : "✓"}</span>
          <span>{largest && largest.pct >= 45
            ? <>Grande parte do seu patrimônio está concentrada em <b>{largest.nome}</b> ({largest.pct.toFixed(0)}%). Diversificar pode reduzir riscos específicos.</>
            : "Sua carteira apresenta boa diversificação entre classes de ativos."}</span>
        </div>
        {fixedIncome > 70 && (
          <div className="insight-card">
            <span className="ico">↑</span>
            <span>Sua alocação é fortemente concentrada em renda fixa. Uma parcela maior em renda variável pode acelerar sua trajetória no longo prazo.</span>
          </div>
        )}
      </div>

      <div className="report-head final-report-head">
        <span className="badge">Relatório Premium</span>
        <h3>Detalhamento completo</h3>
      </div>
      <ul className="report-list">
        {details.map(([label, value]) => (
          <li key={label}>
            <span className="check">✔</span>
            <span className="lbl">{label}</span>
            <span className="val">{value}</span>
          </li>
        ))}
      </ul>

      <section className="final-subcard">
        <span className="badge-simulado">Classificação de referência</span>
        <div className="q-eyebrow">Perfil de investidor</div>
        <h2 className="q-title final-subtitle">{profile.nome}</h2>
        <p className="q-sub">{profile.descricao}</p>
        <div className="final-allocation">
          {profile.alocacao.filter(item => item.pct > 0).map(item => (
            <div className="allocation-row" key={item.nome}>
              <i className="allocation-swatch" style={{ background: item.cor }} />
              <span className="allocation-name">{item.nome}</span>
              <b>{item.pct}%</b>
            </div>
          ))}
        </div>
        <p className="final-note">Classificação estimada com base na metodologia de perfis do Safra Report, considerando capacidade financeira, tolerância a oscilações e conhecimento/experiência declarados nesta simulação. O enquadramento oficial do seu perfil e a alocação definitiva devem ser validados com um assessor Fincare Investimentos.</p>
      </section>

      <section className="final-subcard">
        <div className="q-eyebrow">Recomendações preliminares</div>
        <h2 className="q-title final-subtitle">Principais insights e recomendações</h2>
        <div className="reco-list">
          {recommendations.map((recommendation, index) => (
            <div className="reco-item" key={recommendation}>
              <span className="n">0{index + 1}</span>
              <span>{recommendation}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="final-subcard final-box">
        <div className="q-eyebrow">Considerações finais</div>
        <h2 className="q-title">O que seu diagnóstico revela</h2>
        <p className="final-note">Seu diagnóstico indica oportunidades relevantes para otimizar sua estratégia patrimonial. Uma análise personalizada com um especialista da Fincare Investimentos pode identificar alternativas para antecipar sua independência financeira e aumentar a eficiência da sua carteira.</p>
        <a className="btn btn-gold schedule-btn" href={`https://wa.me/5511941819794?text=${encodeURIComponent("Olá, acabei de realizar meu Diagnóstico Patrimonial da Fincare Investimentos.")}`} target="_blank" rel="noreferrer">Quero alcançar meu objetivo</a>
      </section>
    </div>
  )
}
