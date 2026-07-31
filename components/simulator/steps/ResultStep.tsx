import { formatCurrency } from "@/lib/calculator"
import type { Calculation } from "@/lib/types"
import { Gauge } from "../charts/Gauge"
import { ProjectionChart } from "../charts/ProjectionChart"
import { Button } from "../ui/Button"

type ResultStepProps = {
  calc: Calculation
  onAdvanced: () => void
}

export function ResultStep({ calc, onAdvanced }: ResultStepProps) {
  const percentage = Math.max(
    0,
    Math.min(100, (calc.patrimonio0 / calc.necessario) * 100)
  )
  const independenceAge = calc.anos === null ? null : calc.idade + calc.anos
  const title =
    calc.anos === null
      ? "Vamos ajustar sua estratégia"
      : calc.anos === 0
        ? "Você já atingiu sua independência financeira"
        : `Você atinge a independência em ${calc.anos} ${calc.anos === 1 ? "ano" : "anos"}`
  const message =
    calc.anos === null ? (
      "Com as premissas atuais, sua trajetória não converge dentro de 45 anos. Um especialista da Fincare pode ajudar a reequilibrar aportes e alocação."
    ) : calc.anos === 0 ? (
      "Seu patrimônio atual já suporta a renda desejada, mantendo a taxa de retirada informada."
    ) : (
      <>
        Você já percorreu uma parte importante do caminho. Mantendo sua
        estratégia atual, poderá conquistar sua independência financeira aos{" "}
        <strong>{independenceAge} anos</strong>.
      </>
    )
  const projectedPatrimony10 = calc.trajetoria[Math.min(10, calc.trajetoria.length - 1)]
  const insights = [
    calc.anos !== null &&
    calc.anosCenarioAporte !== null &&
    calc.anos - calc.anosCenarioAporte > 0 ? (
      <>
        Aumentando seus aportes em <b>R$ 2.000/mês</b>, sua independência pode
        ser antecipada em aproximadamente{" "}
        <b>
          {calc.anos - calc.anosCenarioAporte}{" "}
          {calc.anos - calc.anosCenarioAporte === 1 ? "ano" : "anos"}
        </b>
        .
      </>
    ) : null,
    calc.anos !== null &&
    calc.anosCenarioRent !== null &&
    calc.anos - calc.anosCenarioRent > 0 ? (
      <>
        Uma diferença de apenas <b>1 ponto percentual</b> na rentabilidade pode
        antecipar sua meta em cerca de{" "}
        <b>
          {calc.anos - calc.anosCenarioRent}{" "}
          {calc.anos - calc.anosCenarioRent === 1 ? "ano" : "anos"}
        </b>{" "}
        — o efeito dos juros compostos se acumula ao longo das décadas.
      </>
    ) : null,
    <>
      Mantendo sua trajetória atual, em 10 anos seu patrimônio pode chegar a{" "}
      <b className="blurred-value">{formatCurrency(projectedPatrimony10)}</b> —
      veja a projeção completa ano a ano aprofundando seu diagnóstico.
    </>
  ].filter(Boolean)

  return (
    <div>
      <section className="result-card">
        <div className="result-head">
          <div className="result-eyebrow">Seu diagnóstico patrimonial</div>

          <h2 className="result-title">{title}</h2>
          <p className="result-msg">{message}</p>
        </div>

        <div className="gauge-wrap">
          <Gauge percentage={percentage} />

          <div className="gauge-num">
            <b>{Math.round(percentage)}%</b> da meta atingida
          </div>
        </div>

        <div className="score-legend">
          <span>
            Patrimônio atual
            <br />
            <span className="text-[13px]">
              {formatCurrency(calc.patrimonio0)}
            </span>
          </span>

          <span className="l2">
            Patrimônio necessário
            <br />
            <span className="text-[13px] blurred-value">
              {formatCurrency(calc.necessario)}
            </span>
          </span>
        </div>
      </section>

      <div className="chart-card">
        <div className="legend">
          <span>
            <i className="dot bg-(--gold)" />
            Sua trajetória
          </span>

          <span>
            <i className="dot bg-(--verde-claro)" />
            Após o Ponto de Virada
          </span>

          <span>
            <i className="dot bg-(--text-muted)" />
            Patrimônio necessário
          </span>
        </div>

        <ProjectionChart
          trajectory={calc.trajetoria}
          target={calc.necessario}
          turningPoint={calc.anos}
        />
      </div>

      <div className="insights result-insights">
        {insights.map((insight, index) => (
          <div className="insight-card" key={index}>
            <span className="ico">
              {index === 0 ? "↑" : index === 1 ? "◆" : "✓"}
            </span>
            <span>{insight}</span>
          </div>
        ))}
      </div>

      <div className="report-card">
        <div className="report-head">
          <span className="badge">Relatório Premium</span>
          <h3>Detalhamento completo do seu diagnóstico</h3>
        </div>

        <ul className="report-list">
          <li>
            <span className="check">✔</span>
            <span className="lbl">Idade estimada da independência</span>
            <span className="val">
              {independenceAge ? `~${independenceAge} anos` : "████"}
            </span>
          </li>

          <li>
            <span className="check">✔</span>
            <span className="lbl">Patrimônio necessário</span>
            <span className="val locked">00000000</span>
          </li>

          <li>
            <span className="check">✔</span>
            <span className="lbl">Evolução ano a ano da carteira</span>
            <span className="val locked">00000000</span>
          </li>

          <li>
            <span className="check">✔</span>
            <span className="lbl">Projeção patrimonial completa</span>
            <span className="val locked">00000000</span>
          </li>

          <li>
            <span className="check">✔</span>
            <span className="lbl">
              Fatores que aceleram ou atrasam sua meta
            </span>
            <span className="val locked">00000000</span>
          </li>
        </ul>

        <div className="report-cta">
          <Button variant="gold" className="w-full" onClick={onAdvanced}>
            Aprofundar meu diagnóstico
          </Button>
        </div>
      </div>

      <div className="authority-strip">
        Ferramenta desenvolvida pela Fincare Investimentos, baseada em
        metodologias utilizadas em planejamento patrimonial.
        <br />
        Resultados calculados a partir das premissas informadas por você.
      </div>
    </div>
  )
}
