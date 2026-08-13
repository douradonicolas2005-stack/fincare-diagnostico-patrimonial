import { formatCurrency } from "@/lib/calculator"
import type { Calculation } from "@/lib/types"
import { Gauge } from "../charts/Gauge"
import { ProjectionChart } from "../charts/ProjectionChart"
import { Button } from "../ui/Button"
import { track } from "@vercel/analytics"
import { trackMetaPixelEvent } from "@/lib/meta-pixel"

type ResultStepProps = {
  calc: Calculation
  onAdvanced: () => void
  sendError?: boolean
  onRetry?: () => void
  retrying?: boolean
}

export function ResultStep({
  calc,
  onAdvanced,
  sendError,
  onRetry,
  retrying
}: ResultStepProps) {
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
  const cardHref = `/gerar-card?${new URLSearchParams({
    idade: String(Math.round(calc.idade)),
    patrimonio: String(Math.round(calc.patrimonio0)),
    aporte: String(Math.round(calc.aporte)),
    renda: String(Math.round(calc.renda)),
    rent: String(Number((calc.rent * 100).toFixed(2))),
    ret: String(Number((calc.retirada * 100).toFixed(2)))
  }).toString()}`
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
      <b className="blurred-value" aria-hidden="true">
        {formatCurrency(projectedPatrimony10)}
      </b>
      <span className="sr-only">um valor disponível ao aprofundar seu diagnóstico</span> —
      veja a projeção completa ano a ano aprofundando seu diagnóstico.
    </>
  ].filter(Boolean)

  return (
    <div>
      {sendError && (
        <div className="send-error-banner" role="alert">
          <p>
            <strong>Não conseguimos confirmar o recebimento dos seus dados.</strong>{" "}
            Seu diagnóstico abaixo continua valendo, mas um especialista da
            Fincare só consegue entrar em contato se o envio for concluído.
          </p>
          <div className="btn-row">
            <Button variant="ghost" onClick={onRetry} disabled={retrying}>
              {retrying ? "Tentando..." : "Tentar novamente"}
            </Button>
            <a
              className="btn btn-gold flex-1"
              href={`https://wa.me/5511941819794?text=${encodeURIComponent("Olá, tentei preencher o Diagnóstico Patrimonial da Fincare mas recebi um aviso de erro no envio.")}`}
              target="_blank"
              rel="noreferrer"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
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
            <span className="text-[13px] blurred-value" aria-hidden="true">
              {formatCurrency(calc.necessario)}
            </span>
            <span className="sr-only">
              valor disponível ao aprofundar seu diagnóstico
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

        <div style={{ padding: "0 20px" }}>
          <a
            href="/ebook-fundos-imobiliarios-independencia-financeira.pdf"
            download
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              try {
                track("ebook_download", { local: "resultado" })
                trackMetaPixelEvent("EbookDownload")
              } catch {}
            }}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              textDecoration: "none",
              background: "var(--gold-bg)",
              border: "1px solid var(--verde-claro)",
              borderRadius: 12,
              padding: 14,
              marginBottom: 14
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 56,
                height: 74,
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,59,73,.25)"
              }}
            >
              <svg
                viewBox="0 0 56 74"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block", width: "100%", height: "100%" }}
              >
                <rect width="56" height="74" fill="#003b49" />
                <g fill="#9fc4c7">
                  <rect x="10" y="30" width="9" height="20" />
                  <rect x="21" y="24" width="7" height="26" />
                  <rect x="30" y="34" width="8" height="16" />
                  <rect x="40" y="28" width="7" height="22" />
                </g>
                <rect x="10" y="12" width="26" height="3" rx="1.5" fill="#fff" />
                <rect x="10" y="18" width="18" height="2" rx="1" fill="#9fc4c7" />
              </svg>
            </span>
            <span style={{ flex: 1 }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9.5,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: "var(--verde-medio)",
                  fontWeight: 700
                }}
              >
                🎁 Guia bônus incluso
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: 14.5,
                  color: "var(--verde-escuro)",
                  fontWeight: 600,
                  lineHeight: 1.25,
                  margin: "2px 0 8px"
                }}
              >
                Fundos Imobiliários &amp; Independência Financeira
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: "var(--verde-escuro)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: "8px 14px",
                  borderRadius: 10
                }}
              >
                📥 Baixar o guia (PDF)
              </span>
            </span>
          </a>
        </div>

        <div className="report-cta">
          <Button variant="gold" className="w-full" onClick={onAdvanced}>
            Aprofundar meu diagnóstico
          </Button>
        </div>
      </div>

      <a
        href={cardHref}
        target="_blank"
        rel="noreferrer"
        className="internal-card-link"
      >
        📲 Gerar card para WhatsApp
        <span className="internal-card-link-tag">interno</span>
      </a>

      <div className="authority-strip">
        Ferramenta desenvolvida pela Fincare Investimentos, baseada em
        metodologias utilizadas em planejamento patrimonial.
        <br />
        Resultados calculados a partir das premissas informadas por você.
      </div>
    </div>
  )
}
