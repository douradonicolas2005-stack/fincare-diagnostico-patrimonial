import { ImageResponse } from "next/og"
import { project, formatCurrency } from "@/lib/calculator"

export const runtime = "nodejs"

// Card compartilhável do diagnóstico patrimonial, para envio no WhatsApp.
// Recebe os inputs por query params, roda a MESMA lógica de cálculo do
// simulador (necessario = renda*12/retirada + project()) e renderiza um
// teaser — espelhando o funil: mostra o gancho (independência em X anos,
// % da meta, patrimônio atual) e deixa os números "premium" para a conversa.
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

  const title =
    anos === null
      ? "Vamos ajustar sua estratégia"
      : anos === 0
        ? "Você já atingiu sua independência financeira"
        : `Independência financeira em ${anos} ${anos === 1 ? "ano" : "anos"}`

  const subtitle =
    anos === null
      ? "Com as premissas atuais, a trajetória não converge em 45 anos — dá para reequilibrar aportes e alocação."
      : independenceAge !== null
        ? `Mantendo a estratégia atual, por volta dos ${independenceAge} anos.`
        : "Seu patrimônio atual já suporta a renda desejada."

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
          padding: "72px 72px 56px"
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              letterSpacing: "0.18em",
              fontWeight: 700,
              color: VERDE_CLARO
            }}
          >
            FINCARE INVESTIMENTOS
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#cfe0dc" }}>
            {nome ? `Diagnóstico patrimonial de ${nome}` : "Diagnóstico patrimonial"}
          </div>
        </div>

        {/* Título */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "54px",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", fontSize: "72px", fontWeight: 800, lineHeight: 1.05 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: "32px", color: "#b9cdc9", lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>

        {/* Medidor da meta */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "56px",
            gap: "18px"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: "30px", color: "#cfe0dc" }}>
              da meta já atingida
            </div>
            <div style={{ display: "flex", fontSize: "96px", fontWeight: 800, color: VERDE_CLARO, lineHeight: 1 }}>
              {Math.round(percentage)}%
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "34px",
              borderRadius: "17px",
              background: "rgba(255,255,255,0.12)"
            }}
          >
            <div
              style={{
                display: "flex",
                width: `${Math.max(2, percentage)}%`,
                height: "34px",
                borderRadius: "17px",
                background: `linear-gradient(90deg, ${VERDE_MEDIO}, ${VERDE_CLARO})`
              }}
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div style={{ display: "flex", gap: "28px", marginTop: "56px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(159,196,199,0.35)",
              borderRadius: "22px",
              padding: "30px 34px"
            }}
          >
            <div style={{ display: "flex", fontSize: "26px", color: "#a9c2be" }}>
              Patrimônio atual
            </div>
            <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: CLARO }}>
              {formatCurrency(patrimonio0)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(159,196,199,0.35)",
              borderRadius: "22px",
              padding: "30px 34px"
            }}
          >
            <div style={{ display: "flex", fontSize: "26px", color: "#a9c2be" }}>
              Patrimônio necessário
            </div>
            <div style={{ display: "flex", fontSize: "44px", fontWeight: 800, color: VERDE_CLARO }}>
              🔒 na conversa
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "48px",
            background: VERDE_CLARO,
            borderRadius: "22px",
            padding: "34px 40px",
            gap: "6px"
          }}
        >
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, color: "#04252c" }}>
            Quer o detalhamento completo?
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: "#0b3b3b", lineHeight: 1.3 }}>
            Patrimônio necessário, projeção ano a ano e o que acelera sua meta — numa conversa de 15 min, sem compromisso.
          </div>
        </div>

        {/* Rodapé / disclaimer */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            paddingTop: "36px",
            fontSize: "22px",
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
