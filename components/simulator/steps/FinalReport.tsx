import { formatCurrency } from "@/lib/calculator"
import type { AdvancedState, Calculation } from "@/lib/types"
import { ExecutiveChart } from "../charts/ExecutiveChart"
import { ExecutiveMetric } from "./ExecutiveMetric"

type FinalReportProps = {
  calc: Calculation
  advanced: AdvancedState
  sendError: boolean
}

export function FinalReport({ calc, advanced, sendError }: FinalReportProps) {
  const profile = calc.perfilInvestidor!
  const independenceAge = calc.anos === null ? null : calc.idade + calc.anos
  const score = Math.round(
    Math.max(0, Math.min(100, (calc.patrimonio0 / calc.necessario) * 100))
  )
  const currentPatrimony = calc.patrimonio0 + advanced.extraLiquido
  const projectedPatrimony = calc.trajetoria[Math.min(10, calc.trajetoria.length - 1)]
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
  const details = [
    ["Idade estimada da independência", independenceAge ? `${independenceAge} anos` : "A ajustar com um especialista"],
    ["Patrimônio necessário", formatCurrency(calc.necessario)],
    ["Anos até o Ponto de Virada", calc.anos !== null ? `${calc.anos} ${calc.anos === 1 ? "ano" : "anos"}` : "Fora do horizonte de 45 anos"],
    ["Patrimônio projetado em 10 anos", formatCurrency(projectedPatrimony)],
    ["Rentabilidade real utilizada", `${(calc.rent * 100).toFixed(1)}% a.a.`],
    ["Taxa de retirada utilizada", `${(calc.retirada * 100).toFixed(0)}% a.a.`]
  ]

  return (
    <div className="final-report">
      <div className="success-banner">Relatório liberado. Confira o detalhamento completo abaixo.</div>
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
        <ExecutiveMetric label="Patrimônio atual" value={formatCurrency(currentPatrimony)} />
        <ExecutiveMetric label="Patrimônio projetado (10 anos)" value={formatCurrency(projectedPatrimony)} />
        <ExecutiveMetric label="Meta patrimonial" value={formatCurrency(calc.necessario)} />
        <ExecutiveMetric label="Renda passiva desejada" value={`${formatCurrency(calc.renda)}/mês`} />
        <ExecutiveMetric label="Idade da independência" value={independenceAge ? `${independenceAge} anos` : "A ajustar com especialista"} />
        <ExecutiveMetric label="Score patrimonial" value={`${score}%`} />
        <div className="exec-card wide">
          <div className="e-label">Trajetória patrimonial</div>
          <ExecutiveChart trajectory={calc.trajetoria} target={calc.necessario} turningPoint={calc.anos} />
        </div>
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
