"use client"

import { useMemo, useState } from "react"

const VERDE_ESCURO = "#003b49"
const VERDE_MEDIO = "#2b7e7e"
const VERDE_CLARO = "#9fc4c7"
const BG = "#f4f9fc"

type Field = {
  key: string
  label: string
  placeholder: string
  hint?: string
}

const FIELDS: Field[] = [
  { key: "nome", label: "Nome (opcional)", placeholder: "Carlos" },
  { key: "idade", label: "Idade", placeholder: "45" },
  { key: "patrimonio", label: "Patrimônio atual (R$)", placeholder: "500000" },
  { key: "aporte", label: "Aporte mensal (R$)", placeholder: "3000" },
  { key: "renda", label: "Renda desejada / mês (R$)", placeholder: "15000" }
]

const ADVANCED: Field[] = [
  { key: "rent", label: "Rentabilidade a.a. (%)", placeholder: "6", hint: "default 6" },
  { key: "ret", label: "Taxa de retirada a.a. (%)", placeholder: "4", hint: "default 4" }
]

export function CardGenerator() {
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {}
    const sp = new URLSearchParams(window.location.search)
    const init: Record<string, string> = {}
    for (const f of [...FIELDS, ...ADVANCED]) {
      const v = sp.get(f.key)
      if (v) init[f.key] = v
    }
    return init
  })
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(() => {
    if (typeof window === "undefined") return false
    const sp = new URLSearchParams(window.location.search)
    return Boolean(sp.get("rent") || sp.get("ret"))
  })
  const [variant, setVariant] = useState<"completo" | "gancho">(() => {
    if (typeof window === "undefined") return "completo"
    const v = new URLSearchParams(window.location.search).get("v")
    return v === "gancho" || v === "b" ? "gancho" : "completo"
  })

  const url = useMemo(() => {
    if (typeof window === "undefined") return ""
    const params = new URLSearchParams()
    for (const f of [...FIELDS, ...ADVANCED]) {
      const v = (values[f.key] || "").trim()
      if (v) params.set(f.key, v)
    }
    if (variant === "gancho") params.set("v", "gancho")
    return `${window.location.origin}/api/og/diagnostico?${params.toString()}`
  }, [values, variant])

  const hasData = Boolean(values.renda && values.patrimonio)

  const set = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard indisponível — usuário copia manualmente */
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${VERDE_CLARO}`,
    fontSize: 16,
    outline: "none",
    background: "#fff",
    color: VERDE_ESCURO
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: VERDE_ESCURO,
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 20px"
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, fontSize: 13, letterSpacing: "0.14em", fontWeight: 700, color: VERDE_MEDIO }}>
          FINCARE — USO INTERNO
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: 28 }}>Gerar card de diagnóstico</h1>
        <p style={{ margin: "0 0 20px", color: "#5c7278", fontSize: 15 }}>
          Preencha os dados que a pessoa te passar no WhatsApp. A prévia atualiza sozinha —
          copie o link ou baixe a imagem e mande na conversa.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Modelo do card:</span>
          <div
            style={{
              display: "inline-flex",
              border: `1px solid ${VERDE_CLARO}`,
              borderRadius: 999,
              overflow: "hidden"
            }}
          >
            {(["completo", "gancho"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                style={{
                  padding: "8px 18px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  background: variant === v ? VERDE_ESCURO : "#fff",
                  color: variant === v ? "#fff" : VERDE_ESCURO
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#5c7278" }}>
            {variant === "completo"
              ? "com insights de aceleração"
              : "só o gancho — mais enxuto p/ testar conversão"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          {/* Formulário */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FIELDS.map((f) => (
              <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</span>
                <input
                  style={inputStyle}
                  inputMode={f.key === "nome" ? "text" : "numeric"}
                  placeholder={f.placeholder}
                  value={values[f.key] || ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              </label>
            ))}

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                color: VERDE_MEDIO,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                padding: 0
              }}
            >
              {showAdvanced ? "− Ocultar premissas avançadas" : "+ Premissas avançadas (rentabilidade / retirada)"}
            </button>

            {showAdvanced &&
              ADVANCED.map((f) => (
                <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {f.label} <span style={{ color: "#5c7278", fontWeight: 400 }}>· {f.hint}</span>
                  </span>
                  <input
                    style={inputStyle}
                    inputMode="numeric"
                    placeholder={f.placeholder}
                    value={values[f.key] || ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                </label>
              ))}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={copy}
                disabled={!hasData}
                style={{
                  flex: 1,
                  padding: "13px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: hasData ? VERDE_ESCURO : "#c3d3d3",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: hasData ? "pointer" : "not-allowed"
                }}
              >
                {copied ? "✓ Copiado!" : "Copiar link"}
              </button>
              <a
                href={hasData ? url : undefined}
                download="diagnostico-fincare.png"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "13px 16px",
                  borderRadius: 10,
                  border: `1px solid ${VERDE_ESCURO}`,
                  background: "#fff",
                  color: VERDE_ESCURO,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  pointerEvents: hasData ? "auto" : "none",
                  opacity: hasData ? 1 : 0.5
                }}
              >
                Baixar imagem
              </a>
            </div>

            {hasData && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "#5c7278",
                  wordBreak: "break-all",
                  lineHeight: 1.4
                }}
              >
                {url}
              </div>
            )}
          </div>

          {/* Prévia */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#5c7278" }}>Prévia</div>
            <div
              style={{
                width: "100%",
                aspectRatio: "1080 / 1350",
                borderRadius: 16,
                overflow: "hidden",
                border: `1px solid ${VERDE_CLARO}`,
                background: VERDE_ESCURO,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {hasData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="Prévia do card de diagnóstico" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ color: VERDE_CLARO, fontSize: 15, padding: 24, textAlign: "center" }}>
                  Preencha ao menos patrimônio e renda para ver a prévia.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
