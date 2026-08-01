"use client"

import { sendFunnelEvent, sendLead } from "@/lib/api"
import { allocationFromCategories, calculate } from "@/lib/calculator"
import { trackAnalyticsEvent } from "@/lib/analytics"
import { trackMetaPixelEvent } from "@/lib/meta-pixel"
import { isValidPhoneBR, leadSchema, type FunnelPayload, type LeadPayload } from "@/lib/security"
import type { AdvancedState, Calculation, Lead, Step } from "@/lib/types"
import { useEffect, useMemo, useRef, useState } from "react"
import { BrandHeader } from "../layout/BrandHeader"
import { ContactStep } from "./steps/ContactStep"
import { DiagnosticoExecutivo } from "./steps/DiagnosticoExecutivo"
import { LoadingStep } from "./steps/LoadingStep"
import { ManualStep } from "./steps/ManualStep"
import { MoneyInput } from "./steps/MoneyInput"
import { PremisesStep } from "./steps/PremisesStep"
import { QualificationStep } from "./steps/QualificationStep"
import { Question } from "./steps/Question"
import { ResultStep } from "./steps/ResultStep"
import { ScoreTeaserStep } from "./steps/ScoreTeaserStep"
import { Button } from "./ui/Button"
import { Dialog } from "./ui/Dialog"

const stepNames: Record<number, string> = {
  1: "Patrimônio atual",
  2: "Aporte mensal",
  3: "Renda desejada",
  4: "Premissas avançadas",
  5: "Dados de contato",
  6: "Qualificação"
}
const TOTAL_STEPS = 6
const emptyUtm = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: ""
}
const readUtmParams = () => {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(
    Object.keys(emptyUtm).map(key => [key, params.get(key) || ""])
  ) as typeof emptyUtm
}
const etapaFunil: Record<string, FunnelPayload["etapa"]> = {
  "1": "1_patrimonio",
  "2": "2_aporte",
  "3": "3_renda",
  "4": "4_premissas",
  "5": "5_qualificacao",
  "6": "6_contato",
  result: "result",
  final: "final"
}
const initialLead: Lead = {
  nome: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
  faixa_patrimonio: "",
  faixa_renda: "",
  instituicao_financeira_atual: "",
  possui_assessor: "",
  possui_gerente_banco: "",
  objetivo_financeiro: "",
  consentimento_contato: false,
  consentimento_data_hora: "",
  honeypot: ""
}
const initialAdvanced: AdvancedState = {
  source: null,
  extraLiquido: 0,
  allocation: null
}
const initialManual = {
  imoveis: 0,
  aplicacoes: 0,
  previdencia: 0,
  empresas: 0,
  caixa: 0,
  financiamentos: 0,
  emprestimos: 0
}

export default function Simulator() {
  const [step, setStep] = useState<Step>(1)
  const [values, setValues] = useState({
    patrimonio: 0,
    aporte: 0,
    renda: 0,
    idade: 42,
    rentabilidade: 6,
    retirada: 4
  })
  const [lead, setLead] = useState<Lead>(initialLead)
  const [advanced, setAdvanced] = useState<AdvancedState>(initialAdvanced)
  const [calc, setCalc] = useState<Calculation | null>(null)
  const [manual, setManual] = useState(initialManual)
  const [utm, setUtm] = useState(emptyUtm)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const [consent, setConsent] = useState(false)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const trackedSteps = useRef(new Set<string>())

  useEffect(() => {
    setUtm(readUtmParams())
  }, [])

  // Funil de etapas do simulador (Vercel Analytics + aba "Funil" no Sheets).
  // So dispara uma vez por etapa por sessao, mesmo se a pessoa voltar/avancar
  // entre telas - o objetivo e ver onde a maioria abandona, nao contar cliques.
  useEffect(() => {
    const etapa = etapaFunil[String(step)]
    if (!etapa || trackedSteps.current.has(etapa)) return
    trackedSteps.current.add(etapa)
    trackAnalyticsEvent("funil_etapa", {
      etapa,
      tela: String(step)
    })
    trackAnalyticsEvent("wizard_screen_view", {
      tela: String(step),
      nome:
        typeof step === "number"
          ? stepNames[step]
          : String(step)
    })
    sendFunnelEvent({ etapa, ...readUtmParams() })
  }, [step])

  const setValue = (key: keyof typeof values, value: string) =>
    setValues(current => ({ ...current, [key]: Number(value) || 0 }))
  const setLeadValue = (key: keyof Lead, value: string) =>
    setLead(current => ({ ...current, [key]: value }))
  const goTo = (next: Step) => {
    trackAnalyticsEvent("wizard_step_action", {
      origem: String(step),
      destino: String(next)
    })
    setStep(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const goToPremises = () => {
    if (values.renda <= 0) {
      setDialogMessage("Informe a renda passiva mensal desejada para continuar.")
      trackAnalyticsEvent("wizard_step_validation_error", {
        tela: "3_renda",
        campo: "renda",
        motivo: "valor_invalido"
      })
      return
    }
    goTo(4)
  }
  const calculateCurrent = (currentLead: Lead) =>
    calculate(
      {
        idade: values.idade,
        patrimonio0: values.patrimonio,
        aporte: values.aporte,
        rent: values.rentabilidade / 100,
        renda: values.renda,
        retirada: values.retirada / 100
      },
      currentLead
    )
  const buildPayload = (
    complete: "sim" | "nao",
    currentLead: Lead,
    currentCalc: Calculation
  ): LeadPayload =>
    leadSchema.parse({
      ...currentLead,
      consentimento_contato: true,
      consentimento_data_hora:
        currentLead.consentimento_data_hora || new Date().toISOString(),
      diagnostico_completo: complete,
      patrimonio_atual: currentCalc.patrimonio0,
      aporte_mensal: currentCalc.aporte,
      renda_desejada: currentCalc.renda,
      rentabilidade_esperada: currentCalc.rent,
      taxa_retirada: currentCalc.retirada,
      patrimonio_necessario: currentCalc.necessario,
      anos_ate_independencia: currentCalc.anos,
      idade_atual: currentCalc.idade,
      patrimonio_projetado_10anos:
        currentCalc.trajetoria[Math.min(10, currentCalc.trajetoria.length - 1)],
      anos_cenario_aporte: currentCalc.anosCenarioAporte,
      anos_cenario_rentabilidade: currentCalc.anosCenarioRent,
      diagnostico_avancado_fonte:
        advanced.source || "nenhuma (apenas diagnostico rapido)",
      diagnostico_avancado_patrimonio_liquido_adicional: advanced.extraLiquido,
      diagnostico_avancado_alocacao_por_classe: advanced.allocation
        ? JSON.stringify(advanced.allocation)
        : "",
      score_patrimonial: Math.round(
        Math.max(
          0,
          Math.min(
            100,
            (currentCalc.patrimonio0 / currentCalc.necessario) * 100
          )
        )
      ),
      perfil_investidor: currentCalc.perfilInvestidor?.nome || "",
      perfil_investidor_descricao:
        currentCalc.perfilInvestidor?.descricao || "",
      perfil_investidor_alocacao: JSON.stringify(
        currentCalc.perfilInvestidor?.alocacao || []
      ),
      data: new Date().toISOString(),
      origem_lead: "calculadora-fincare-instagram",
      ...emptyUtm,
      ...utm
    })
  const send = async (
    complete: "sim" | "nao",
    currentLead: Lead,
    currentCalc: Calculation,
    metaEventId?: string
  ): Promise<boolean> => {
    trackAnalyticsEvent("wizard_lead_submit_attempt", {
      diagnostico_completo: complete
    })
    setSending(true)
    setSendError(false)
    try {
      const payload = buildPayload(complete, currentLead, currentCalc)
      const ok = await sendLead(metaEventId ? { ...payload, meta_event_id: metaEventId } : payload)
      trackAnalyticsEvent("wizard_lead_submit_result", {
        diagnostico_completo: complete,
        success: ok
      })
      setSendError(!ok)
      return ok
    } catch {
      trackAnalyticsEvent("wizard_lead_submit_result", {
        diagnostico_completo: complete,
        success: false
      })
      setSendError(true)
      setDialogMessage(
        "Confira seus dados de contato antes de gerar o diagnóstico."
      )
      return false
    } finally {
      setSending(false)
    }
  }
  const submitLead = async () => {
    trackAnalyticsEvent("wizard_contact_submit_attempt")
    if (sending) return
    if (
      !lead.faixa_patrimonio ||
      !lead.faixa_renda ||
      !lead.possui_assessor ||
      !lead.possui_gerente_banco ||
      !lead.objetivo_financeiro
    ) {
      setDialogMessage("Preencha todos os campos para continuar.")
      trackAnalyticsEvent("wizard_qualification_validation_error", {
        motivo: "campos_obrigatorios"
      })
      return
    }
    if (!consent) {
      setDialogMessage("É necessário autorizar o contato para continuar.")
      trackAnalyticsEvent("wizard_qualification_validation_error", {
        motivo: "consentimento_ausente"
      })
      return
    }
    const currentLead = {
      ...lead,
      consentimento_contato: true,
      consentimento_data_hora: new Date().toISOString()
    }
    const currentCalc = calculateCurrent(currentLead)
    try {
      buildPayload("nao", currentLead, currentCalc)
    } catch {
      setDialogMessage("Confira nome, e-mail e WhatsApp antes de continuar.")
      return
    }
    setLead(currentLead)
    setStep("loading")
    await new Promise(resolve => setTimeout(resolve, 700))
    setCalc(currentCalc)
    // Fire-and-forget: o webhook do Apps Script pode demorar vários segundos
    // pra responder, e nao ha motivo pra travar a tela de carregamento
    // (que ja mostra o essencial) esperando por isso - goTo("result") ja
    // acontecia incondicionalmente mesmo quando o envio falhava.
    // metaEventId compartilhado entre o disparo do Pixel aqui e a Conversions
    // API server-side (app/api/leads/route.ts) para o Meta deduplicar os dois
    // como um único evento "Lead".
    const metaEventId = crypto.randomUUID()
    send("nao", currentLead, currentCalc, metaEventId).then(ok => {
      if (ok) trackMetaPixelEvent("Lead", metaEventId)
    })
    goTo("result")
  }
  const finalize = async () => {
    if (sending) return
    trackAnalyticsEvent("wizard_finalize_attempt")
    if (calc) void send("sim", lead, calc)
    goTo("final")
  }
  const allocation = useMemo(
    () =>
      advanced.allocation ||
      allocationFromCategories({
        "Carteira informada": calc?.patrimonio0 || 0
      }),
    [advanced.allocation, calc?.patrimonio0]
  )
  const summary = calc
    ? {
        total: calc.patrimonio0 + advanced.extraLiquido,
        liquid: Math.round(
          allocation
            .filter(item =>
              ["caixa", "renda fixa", "fundos", "ações", "etfs"].some(key =>
                item.nome.toLowerCase().includes(key)
              )
            )
            .reduce((sum, item) => sum + item.pct, 0)
        ),
        rv: Math.round(
          (allocation
            .filter(item =>
              [
                "ações",
                "fiis",
                "etfs",
                "ativos internacionais",
                "participação em empresas"
              ].some(key => item.nome.toLowerCase().includes(key))
            )
            .reduce((sum, item) => sum + (item.valor || 0), 0) /
            Math.max(
              1,
              allocation.reduce((sum, item) => sum + (item.valor || 0), 0)
            )) *
            100
        )
      }
    : null
  const doneManual = () => {
    trackAnalyticsEvent("wizard_manual_complete")
    const extraLiquido =
      manual.imoveis +
      manual.aplicacoes +
      manual.previdencia +
      manual.empresas +
      manual.caixa -
      manual.financiamentos -
      manual.emprestimos
    setAdvanced({
      source: "manual",
      extraLiquido,
      allocation: allocationFromCategories({
        "Carteira de investimentos": calc?.patrimonio0 || 0,
        Imóveis: manual.imoveis,
        "Previdência privada": manual.previdencia,
        "Participação em empresas": manual.empresas,
        "Caixa / liquidez": manual.caixa,
        "Outras aplicações": manual.aplicacoes
      })
    })
    finalize()
  }
  const validateContact = () => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())
    if (lead.nome.trim().length >= 2 && validEmail && isValidPhoneBR(lead.telefone)) {
      trackAnalyticsEvent("wizard_contact_validated")
      return goTo(6)
    }
    setDialogMessage(
      "Preencha nome, e-mail e um WhatsApp válido com DDD para continuar."
    )
    trackAnalyticsEvent("wizard_contact_validation_error")
  }

  return (
    <div className="page-bg min-h-screen">
      <BrandHeader />
      <main className="mx-auto max-w-[600px] px-5 py-9">
        {(() => {
          const progressStep =
            step === "teaser" ? 4 : typeof step === "number" && step <= 6 ? step : null
          if (progressStep === null) return null
          const label =
            step === "teaser" ? "Prévia do resultado" : stepNames[progressStep]
          return (
            <div className="progress-wrap">
              <div className="progress-label">
                <span>
                  Passo {progressStep} de {TOTAL_STEPS}
                </span>
                <span>{label}</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-value"
                  style={{ width: `${(progressStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>
          )
        })()}
        <section
          className={
            step === "result" ? "result-flow step-enter" : "card step-enter"
          }
        >
          {step === 1 && (
            <Question
              title="Para começar, quanto você já possui investido hoje?"
              sub="Considere o total investido em renda fixa, renda variável, fundos e previdência — sem incluir imóveis de uso próprio."
            >
              <MoneyInput
                label="Patrimônio investido atualmente"
                value={values.patrimonio}
                onChange={value => setValue("patrimonio", value)}
              />
              <div className="btn-row">
                <Button className="btn-primary flex-1" onClick={() => goTo(2)}>
                  Continuar
                </Button>
              </div>
            </Question>
          )}

          {step === 2 && (
            <Question
              eyebrow="Passo 2"
              title="Quanto você consegue investir por mês, em média?"
              sub="Um número realista — pode ser ajustado depois. É a partir dele que traçamos sua trajetória."
            >
              <MoneyInput
                label="Aporte mensal médio"
                value={values.aporte}
                onChange={value => setValue("aporte", value)}
              />
              <div className="btn-row">
                <Button variant="ghost" onClick={() => goTo(1)}>
                  Voltar
                </Button>
                <Button className="btn-primary flex-1" onClick={() => goTo(3)}>
                  Continuar
                </Button>
              </div>
            </Question>
          )}

          {step === 3 && (
            <Question
              eyebrow="Passo 3"
              title="Qual renda mensal você gostaria que seus investimentos gerassem?"
              sub="Pense no valor que sustentaria seu padrão de vida sem depender de salário ou renda do negócio."
            >
              <MoneyInput
                label="Renda passiva mensal desejada"
                value={values.renda}
                onChange={value => setValue("renda", value)}
              />
              <div className="btn-row">
                <Button variant="ghost" onClick={() => goTo(2)}>
                  Voltar
                </Button>
                <Button className="btn-primary flex-1" onClick={goToPremises}>
                  Continuar
                </Button>
              </div>
            </Question>
          )}

          {step === 4 && (
            <PremisesStep
              idade={values.idade}
              rentabilidade={values.rentabilidade}
              retirada={values.retirada}
              setValue={setValue}
              onBack={() => goTo(3)}
              onNext={() => goTo("teaser")}
            />
          )}

          {step === "teaser" && (
            <ScoreTeaserStep
              percentage={Math.max(
                0,
                Math.min(
                  100,
                  (values.patrimonio /
                    ((values.renda * 12) / (values.retirada / 100))) *
                    100
                )
              )}
              onBack={() => goTo(4)}
              onNext={() => goTo(5)}
            />
          )}

          {step === 5 && (
            <ContactStep
              lead={lead}
              setLeadValue={setLeadValue}
              onBack={() => goTo(4)}
              onNext={validateContact}
            />
          )}

          {step === 6 && (
            <QualificationStep
              lead={lead}
              setLeadValue={setLeadValue}
              consent={consent}
              setConsent={setConsent}
              onBack={() => goTo(5)}
              onSubmit={submitLead}
              sending={sending}
            />
          )}

          {step === "loading" && <LoadingStep />}

          {step === "result" && calc && (
            <ResultStep calc={calc} onAdvanced={() => goTo("manual")} />
          )}

          {step === "manual" && (
            <ManualStep
              values={manual}
              setValues={setManual}
              onBack={() => goTo("result")}
              onDone={doneManual}
              onSkip={finalize}
              sending={sending}
            />
          )}

          {step === "final" && calc && summary && (
            <DiagnosticoExecutivo
              calc={calc}
              advanced={advanced}
              allocation={allocation}
              summary={summary}
              sendError={sendError}
            />
          )}
        </section>

        <p className="disclaimer">
          Simulação com fins ilustrativos e educacionais, elaborada pela Fincare
          Investimentos | Safra Invest. Não constitui recomendação de
          investimento nem garantia de rentabilidade futura. Os resultados
          dependem das premissas informadas pelo usuário e de condições reais de
          mercado. Consulte um assessor de investimentos para uma análise
          personalizada.
        </p>
      </main>

      <Dialog message={dialogMessage} onClose={() => setDialogMessage(null)} />
    </div>
  )
}
