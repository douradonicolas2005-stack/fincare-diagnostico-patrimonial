import type { CheckupResult, CheckupStatus } from "@/lib/checkup"

const ICONE: Record<CheckupStatus, string> = {
  bom: "✓",
  atencao: "◆",
  alerta: "↑"
}

const COR: Record<CheckupStatus, string> = {
  bom: "#2B7E7E",
  atencao: "#C9A34E",
  alerta: "#E06666"
}

const ROTULO: Record<CheckupStatus, string> = {
  bom: "Bom",
  atencao: "Atenção",
  alerta: "Alerta"
}

type CheckupScorecardProps = {
  checkup: CheckupResult
}

// Card de fechamento estilo "Investment Checkup": um eixo por linha, com
// status (bom/atencao/alerta), titulo curto e explicacao educacional.
export function CheckupScorecard({ checkup }: CheckupScorecardProps) {
  return (
    <div className="checkup-scorecard">
      <div className="insights">
        {checkup.eixos.map(eixo => (
          <div className="insight-card" key={eixo.eixo}>
            <span className="ico" style={{ color: COR[eixo.status] }}>
              {ICONE[eixo.status]}
            </span>
            <span>
              <b>{eixo.eixo}: {eixo.titulo}</b>
              <span
                className="checkup-pill"
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  color: COR[eixo.status]
                }}
              >
                {ROTULO[eixo.status]}
              </span>
              <br />
              <span className="hint">{eixo.detalhe}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 8 }}>
        {checkup.resumo}
      </p>
    </div>
  )
}
