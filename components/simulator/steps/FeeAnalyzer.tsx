import { formatCurrency } from "@/lib/calculator"
import type { FeeImpact } from "@/lib/fees"

type FeeAnalyzerProps = {
  impact: FeeImpact
}

const pct = (fracao: number) =>
  `${(fracao * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`

// Fee Analyzer (Empower): traduz a taxa atual em custo de hoje e em quanto
// ela pode "comer" do patrimonio no longo prazo vs. uma referencia mais
// eficiente. Enquadramento educacional/ilustrativo — sem promessa de retorno.
export function FeeAnalyzer({ impact }: FeeAnalyzerProps) {
  return (
    <div className="fee-analyzer">
      <div className="exec-grid">
        <div className="exec-card">
          <div className="e-label">Sua taxa estimada</div>
          <div className="e-value">
            {pct(impact.taxaAtual)} a.a.
            {impact.estimado && (
              <span className="hint" style={{ display: "block", fontSize: 11 }}>
                estimativa de mercado
              </span>
            )}
          </div>
        </div>
        <div className="exec-card">
          <div className="e-label">Custo no primeiro ano</div>
          <div className="e-value">{formatCurrency(impact.custoPrimeiroAno)}</div>
        </div>
      </div>

      <div className="insights" style={{ marginTop: 10 }}>
        <div className="insight-card">
          <span className="ico">◆</span>
          <span>
            Ao longo de <b>{impact.anos} anos</b>, a diferença entre a sua taxa
            atual e uma taxa de referência mais eficiente (
            {pct(impact.taxaEficiente)} a.a.) pode representar cerca de{" "}
            <b>{formatCurrency(impact.drag)}</b> a mais no seu patrimônio, sobre
            o valor investido hoje.
          </span>
        </div>
      </div>

      <p className="final-note" style={{ marginTop: 8 }}>
        Estimativa ilustrativa e educacional, calculada sobre o valor investido
        informado e as premissas desta simulação. Não representa promessa de
        rentabilidade nem garantia de redução de custos. Os custos reais e as
        alternativas devem ser avaliados com um assessor Fincare Investimentos.
      </p>
    </div>
  )
}
