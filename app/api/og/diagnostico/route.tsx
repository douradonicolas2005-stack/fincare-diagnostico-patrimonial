import { ImageResponse } from "next/og"
import { project } from "@/lib/calculator"

export const runtime = "nodejs"

// Card compartilhável do diagnóstico patrimonial, para envio no WhatsApp.
// Recebe os inputs por query params, roda a MESMA lógica de cálculo do
// simulador (necessario = renda*12/retirada + project()) e renderiza um
// teaser.
//
// Dupla função do cadeado:
//  1. Funil — os números "premium" ficam para a conversa.
//  2. Privacidade — nenhum valor absoluto em R$ do lead aparece, então
//     reencaminhar o card não expõe o patrimônio dele a terceiros.
//
// Exemplo:
//   /api/og/diagnostico?nome=Carlos&idade=45&patrimonio=500000&aporte=3000&renda=15000
//   params opcionais: rent (default 6, em %), ret (default 4, em %)

const VERDE_ESCURO = "#003b49"
const VERDE_ESCURO_2 = "#012730"
const VERDE_MEDIO = "#2b7e7e"
const VERDE_CLARO = "#9fc4c7"
const CLARO = "#f4f9fc"

function num(v: string | null, fallback: number): number {
  if (v === null) return fallback
  const n = Number(v.replace(/[^\d.-]/g, ""))
  return Number.isFinite(n) ? n : fallback
}

function anosLabel(n: number): string {
  return n === 1 ? "ano" : "anos"
}

export function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const nome = (searchParams.get("nome") || "").trim().slice(0, 40)
  const idade = num(searchParams.get("idade"), 42)
  const patrimonio0 = Math.max(0, num(searchParams.get("patrimonio"), 0))
  const aporte = Math.max(0, num(searchParams.get("aporte"), 0))
  const renda = Math.max(0, num(searchParams.get("renda"), 0))
  const rent = num(searchParams.get("rent"), 6) / 100
  const retirada = num(searchParams.get("ret"), 4) / 100

  const necessario = renda > 0 && retirada > 0 ? (renda * 12) / retirada : 0
  const base =
    necessario > 0
      ? project(patrimonio0, aporte, rent, necessario)
      : { anos: null as number | null, trajectory: [patrimonio0] }
  const anos = base.anos
  const percentage =
    necessario > 0
      ? Math.max(0, Math.min(100, (patrimonio0 / necessario) * 100))
      : 0
  const independenceAge = anos === null ? null : idade + anos

  // Cenários de aceleração (mesma lógica do calculate()): +R$2.000/mês de
  // aporte e +1 ponto de rentabilidade. São deltas em anos — não expõem R$.
  const aporteScenario =
    necessario > 0 ? project(patrimonio0, aporte + 2000, rent, necessario).anos : null
  const rentScenario =
    necessario > 0 ? project(patrimonio0, aporte, rent + 0.01, necessario).anos : null
  const deltaAporte =
    anos !== null && aporteScenario !== null ? anos - aporteScenario : 0
  const deltaRent =
    anos !== null && rentScenario !== null ? anos - rentScenario : 0

  const insights: { ico: string; text: string }[] = []
  if (deltaAporte > 0)
    insights.push({
      ico: "↑",
      text: `Aportar R$ 2.000/mês a mais pode antecipar sua meta em ~${deltaAporte} ${anosLabel(deltaAporte)}.`
    })
  if (deltaRent > 0)
    insights.push({
      ico: "%",
      text: `Ganhar 1 ponto percentual de rentabilidade ao ano pode antecipá-la em ~${deltaRent} ${anosLabel(deltaRent)}.`
    })
  if (insights.length === 0)
    insights.push({
      ico: "+",
      text: "Há espaço para acelerar sua meta ajustando aportes e alocação da carteira."
    })

  const title =
    anos === null
      ? "Vamos ajustar sua estratégia"
      : anos === 0
        ? "Você já atingiu sua independência financeira"
        : `Independência financeira em ${anos} ${anosLabel(anos)}`

  const subtitle =
    anos === null
      ? "Com as premissas atuais, a trajetória não converge em 45 anos — dá para reequilibrar aportes e alocação."
      : independenceAge !== null
        ? `Mantendo a estratégia atual, por volta dos ${independenceAge} anos.`
        : "Seu patrimônio atual já suporta a renda desejada."

  const lockedItems = [
    "Patrimônio atual",
    "Patrimônio necessário",
    "Projeção em 10 anos"
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          background: `radial-gradient(circle at 50% 0%, ${VERDE_ESCURO_2}, ${VERDE_ESCURO} 65%)`,
          color: CLARO,
          fontFamily: "sans-serif",
          padding: "52px 60px 44px"
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              letterSpacing: "0.18em",
              fontWeight: 700,
              color: VERDE_CLARO
            }}
          >
            FINCARE INVESTIMENTOS
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: "#cfe0dc" }}>
            {nome ? `Diagnóstico patrimonial de ${nome}` : "Diagnóstico patrimonial"}
          </div>
        </div>

        {/* Título */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "26px", gap: "10px" }}>
          <div style={{ display: "flex", fontSize: "56px", fontWeight: 800, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: "#b9cdc9", lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>

        {/* Medidor da meta */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "26px", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: "27px", color: "#cfe0dc" }}>
              da meta já atingida
            </div>
            <div style={{ display: "flex", fontSize: "70px", fontWeight: 800, color: VERDE_CLARO, lineHeight: 1 }}>
              {Math.round(percentage)}%
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "28px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.12)"
            }}
          >
            <div
              style={{
                display: "flex",
                width: `${Math.max(2, percentage)}%`,
                height: "28px",
                borderRadius: "14px",
                background: `linear-gradient(90deg, ${VERDE_MEDIO}, ${VERDE_CLARO})`
              }}
            />
          </div>
        </div>

        {/* Insights de aceleração (sem expor R$) */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "24px", gap: "12px" }}>
          {insights.slice(0, 2).map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(159,196,199,0.30)",
                borderRadius: "16px",
                padding: "16px 22px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  width: "48px",
                  height: "48px",
                  borderRadius: "24px",
                  background: VERDE_MEDIO,
                  color: "#fff",
                  fontSize: "28px",
                  fontWeight: 800
                }}
              >
                {it.ico}
              </div>
              <div style={{ display: "flex", flex: 1, fontSize: "26px", color: "#dce8e5", lineHeight: 1.3 }}>
                {it.text}
              </div>
            </div>
          ))}
        </div>

        {/* Valores trancados (privacidade + funil) */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "24px", gap: "12px" }}>
          <div style={{ display: "flex", gap: "18px" }}>
            {lockedItems.map((label, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(159,196,199,0.30)",
                  borderRadius: "16px",
                  padding: "18px 14px"
                }}
              >
                <div style={{ display: "flex", fontSize: "40px" }}>🔒</div>
                <div style={{ display: "flex", fontSize: "21px", color: "#a9c2be", textAlign: "center", lineHeight: 1.25 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: "20px", color: "#8fb0ac" }}>
            🔒 Valores em R$ ocultos — protegem seus dados caso o card seja compartilhado.
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "24px",
            background: VERDE_CLARO,
            borderRadius: "20px",
            padding: "22px 34px",
            gap: "4px"
          }}
        >
          <div style={{ display: "flex", fontSize: "31px", fontWeight: 800, color: "#04252c" }}>
            Quer o detalhamento completo?
          </div>
          <div style={{ display: "flex", fontSize: "25px", color: "#0b3b3b", lineHeight: 1.3 }}>
            Patrimônio necessário, projeção ano a ano e o que acelera sua meta — numa conversa de 15 min, sem compromisso.
          </div>
        </div>

        {/* Rodapé / disclaimer */}
        <div
          style={{
            display: "flex",
            marginTop: "22px",
            fontSize: "20px",
            color: "#8fb0ac",
            lineHeight: 1.35
          }}
        >
          Projeção calculada a partir das premissas informadas. Não constitui promessa de rentabilidade. Fincare Investimentos.
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  )
}
