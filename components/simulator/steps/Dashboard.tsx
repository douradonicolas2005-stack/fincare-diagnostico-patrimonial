import { formatCurrency } from "@/lib/calculator"
import { AllocationDonut } from "../charts/AllocationDonut"
import type { DashboardProps } from "../simulator.types"
import { Button } from "../ui/Button"
import { Wizard } from "../ui/Wizard"

export function Dashboard({
  calc,
  allocation,
  summary,
  onBack,
  onFinalize,
  sending
}: DashboardProps) {
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
  const international = percentageFor(["internacional"])
  const relevantClasses = allocation.filter(item => item.pct >= 5).length
  const diversification = relevantClasses >= 5 ? "Alta" : relevantClasses >= 3 ? "Moderada" : "Baixa"
  const largest = allocation[0]
  const liquidityText = summary.liquid >= 60
    ? "Boa liquidez — grande parte do patrimônio pode ser acessada rapidamente, se necessário."
    : summary.liquid >= 35
      ? "Liquidez moderada — parte relevante do patrimônio está em ativos menos líquidos, como imóveis ou previdência."
      : "Liquidez baixa — considere reforçar uma reserva de curto prazo."
  const cards = [
    ["Patrimônio líquido", formatCurrency(summary.total)],
    [
      "Renda passiva estimada",
      `${formatCurrency((summary.total * calc.retirada) / 12)}/mês`
    ],
    ["Renda variável", `${summary.rv}%`],
    ["Renda fixa", `${fixedIncome}%`],
    ["Exposição internacional", `${international}%`],
    ["Diversificação", diversification]
  ]
  return (
    <Wizard
      eyebrow="Dashboard patrimonial"
      title="Sua visão consolidada"
      sub="Distribuição, concentração e liquidez a partir dos dados informados."
    >
      <div className="dashboard-grid">
        {cards.map(([label, value]) => (
          <div key={label} className="dashboard-metric">
            <div className="dashboard-metric-label">{label}</div>
            <div className="dashboard-metric-value">{value}</div>
          </div>
        ))}
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
      <div className="btn-row">
        <Button variant="gold" className="flex-1" onClick={onFinalize} disabled={sending}>
          {sending ? "Enviando..." : "Ver diagnóstico executivo completo"}
        </Button>
      </div>
    </Wizard>
  )
}
