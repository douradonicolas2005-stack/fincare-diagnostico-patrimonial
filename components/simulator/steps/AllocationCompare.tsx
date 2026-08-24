import type { AllocationCompareRow } from "@/lib/allocation"
import { maiorDesvio } from "@/lib/allocation"

type AllocationCompareProps = {
  rows: AllocationCompareRow[]
}

// Investment Checkup: sua alocacao atual x alocacao de referencia do perfil,
// classe a classe. Enquadramento EDUCACIONAL — "referencia para o seu perfil",
// nunca recomendacao de ativo especifico (evita configurar consultoria).
export function AllocationCompare({ rows }: AllocationCompareProps) {
  const desvio = maiorDesvio(rows)

  return (
    <div className="allocation-compare">
      <div className="allocation-compare-legend">
        <span>
          <i className="dot" style={{ background: "#C9A34E" }} /> Sua
          alocação
        </span>
        <span>
          <i
            className="dot"
            style={{ background: "#2B7E7E" }}
          />{" "}
          Referência do perfil
        </span>
      </div>

      {rows.map(row => (
        <div key={row.classe} className="allocation-compare-row">
          <div className="allocation-compare-head">
            <span className="allocation-name">{row.classe}</span>
            <span className="allocation-compare-values">
              <b style={{ color: "#C9A34E" }}>{row.atualPct}%</b>
              <span style={{ opacity: 0.5 }}> · </span>
              <b style={{ color: "#2B7E7E" }}>
                {row.idealPct}%
              </b>
            </span>
          </div>
          <div className="allocation-compare-bars">
            <div className="allocation-compare-track">
              <div
                className="allocation-compare-fill atual"
                style={{
                  width: `${Math.min(100, row.atualPct)}%`,
                  background: "#C9A34E"
                }}
              />
            </div>
            <div className="allocation-compare-track">
              <div
                className="allocation-compare-fill ideal"
                style={{
                  width: `${Math.min(100, row.idealPct)}%`,
                  background: "#2B7E7E"
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {desvio && Math.abs(desvio.gap) >= 10 && (
        <div className="insights" style={{ marginTop: 10 }}>
          <div className="insight-card">
            <span className="ico">◆</span>
            <span>
              {desvio.gap > 0 ? (
                <>
                  Sua carteira está com <b>{desvio.gap} p.p. acima</b> da
                  referência em <b>{desvio.classe}</b>. Vale conversar com um
                  especialista sobre reequilíbrio.
                </>
              ) : (
                <>
                  Sua carteira está com <b>{Math.abs(desvio.gap)} p.p. abaixo</b>{" "}
                  da referência em <b>{desvio.classe}</b>. Um especialista pode
                  avaliar se faz sentido reforçar essa classe.
                </>
              )}
            </span>
          </div>
        </div>
      )}

      <p className="final-note" style={{ marginTop: 8 }}>
        Alocação de referência estimada a partir do seu perfil declarado nesta
        simulação, com fins educacionais. Não constitui recomendação de
        investimento; a alocação definitiva deve ser validada com um assessor
        Fincare Investimentos.
      </p>
    </div>
  )
}
