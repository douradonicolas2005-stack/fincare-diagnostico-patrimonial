import { formatCurrency } from "@/lib/calculator"
import type { AdvancedState, Calculation } from "@/lib/types"

type FinalReportProps = {
  calc: Calculation
  advanced: AdvancedState
  sendError: boolean
}

export function FinalReport({ calc, advanced, sendError }: FinalReportProps) {
  const profile = calc.perfilInvestidor!
  const age = calc.anos === null ? null : calc.idade + calc.anos
  const recommendations = [
    calc.anosCenarioAporte !== null &&
    calc.anos !== null &&
    calc.anos - calc.anosCenarioAporte > 0
      ? `Aumentar o aporte mensal em R$ 2.000 pode antecipar sua independência em cerca de ${calc.anos - calc.anosCenarioAporte} ${calc.anos - calc.anosCenarioAporte === 1 ? "ano" : "anos"}.`
      : null,
    calc.anosCenarioRent !== null &&
    calc.anos !== null &&
    calc.anos - calc.anosCenarioRent > 0
      ? `Uma rentabilidade 1 ponto percentual maior pode antecipar sua meta em cerca de ${calc.anos - calc.anosCenarioRent} ${calc.anos - calc.anosCenarioRent === 1 ? "ano" : "anos"}.`
      : null,
    advanced.source
      ? "Aprofundar a análise de alocação com um especialista pode revelar oportunidades de eficiência tributária e sucessória."
      : "Complementar o diagnóstico com seus dados patrimoniais completos torna a recomendação mais precisa.",
    "Revisar a taxa de retirada sustentável periodicamente ajuda a manter o patrimônio protegido."
  ].filter((recommendation): recommendation is string =>
    Boolean(recommendation)
  )
  const metrics = [
    [
      "Patrimônio atual",
      formatCurrency(calc.patrimonio0 + advanced.extraLiquido)
    ],
    [
      "Projetado em 10 anos",
      formatCurrency(calc.trajetoria[Math.min(10, calc.trajetoria.length - 1)])
    ],
    [
      "Score patrimonial",
      `${Math.round(Math.min(100, (calc.patrimonio0 / calc.necessario) * 100))}%`
    ],
    ["Meta patrimonial", formatCurrency(calc.necessario)],
    ["Renda desejada", `${formatCurrency(calc.renda)}/mês`],
    ["Idade da independência", age ? `${age} anos` : "A ajustar"]
  ]
  return (
    <div>
      <div className="rounded-lg bg-[#eaf2f1] p-3 text-sm font-semibold text-[#2b7e7e]">
        Relatório liberado. Confira seu diagnóstico executivo.
      </div>
      {sendError && (
        <div className="mt-3 rounded-lg bg-[#fff8e8] p-3 text-sm text-[#6b5a1f]">
          O relatório foi gerado, mas não conseguimos confirmar o registro no
          sistema.
        </div>
      )}
      <h2 className="display mt-7 text-3xl text-[#003b49]">
        Seu diagnóstico patrimonial completo
      </h2>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[#f4f9fc] p-4">
            <div className="text-xs text-[#5c7278]">{label}</div>
            <div className="mt-2 font-bold text-[#003b49]">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-[#dce8e9] p-5">
        <h3 className="display text-xl text-[#003b49]">
          Perfil de investidor: {profile.nome}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#5c7278]">
          {profile.descricao}
        </p>
        <div className="mt-5 space-y-2">
          {profile.alocacao
            .filter(item => item.pct > 0)
            .map(item => (
              <div className="flex items-center gap-3 text-sm" key={item.nome}>
                <i
                  className="h-3 w-3 rounded-sm"
                  style={{ background: item.cor }}
                />
                <span className="flex-1">{item.nome}</span>
                <b>{item.pct}%</b>
              </div>
            ))}
        </div>
      </div>
      <div className="mt-8">
        <h3 className="display text-xl text-[#003b49]">Principais insights</h3>
        <div className="mt-4 space-y-3">
          {recommendations.map((recommendation, index) => (
            <div
              className="flex gap-3 rounded-lg bg-[#f4f9fc] p-3 text-sm leading-6"
              key={recommendation}
            >
              <span className="mono text-[#2b7e7e]">0{index + 1}</span>
              <span>{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
      <a
        className="btn btn-gold mt-8 inline-block w-full py-4 text-center"
        href={`https://wa.me/5511941819794?text=${encodeURIComponent("Olá, acabei de realizar meu Diagnóstico Patrimonial da Fincare Investimentos.")}`}
        target="_blank"
        rel="noreferrer"
      >
        Quero alcançar meu objetivo
      </a>
    </div>
  )
}
