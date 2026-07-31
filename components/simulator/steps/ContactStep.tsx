import { useState } from "react"
import type { Lead } from "@/lib/types"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { PhoneInput } from "../ui/PhoneInput"
import { StateSelect } from "../ui/StateSelect"
import { Wizard } from "../ui/Wizard"

type ContactStepProps = {
  lead: Lead
  setLeadValue: (key: keyof Lead, value: string) => void
  onBack: () => void
  onNext: () => void
}

export function ContactStep({
  lead,
  setLeadValue,
  onBack,
  onNext
}: ContactStepProps) {
  const [showOptional, setShowOptional] = useState(
    Boolean(lead.cidade || lead.estado)
  )

  return (
    <Wizard
      eyebrow="Quase lá"
      title="Antes de gerar seu diagnóstico, para onde enviamos o resultado?"
      sub="Preencha seus dados para liberar seu Diagnóstico Patrimonial. Um especialista da Fincare também poderá comentar os resultados com você, se fizer sentido."
    >
      <Input
        label="Nome completo"
        placeholder="Como podemos te chamar"
        value={lead.nome}
        onChange={value => setLeadValue("nome", value)}
      />
      <Input
        label="E-mail"
        type="email"
        placeholder="voce@email.com"
        value={lead.email}
        onChange={value => setLeadValue("email", value)}
      />
      <PhoneInput
        label="WhatsApp"
        placeholder="(11) 90000-0000"
        value={lead.telefone}
        onChange={value => setLeadValue("telefone", value)}
      />
      <input
        type="text"
        name="website"
        value={lead.honeypot}
        onChange={event => setLeadValue("honeypot", event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          opacity: 0
        }}
      />

      <button
        type="button"
        className="optional-toggle"
        onClick={() => setShowOptional(current => !current)}
        aria-expanded={showOptional}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: showOptional ? "rotate(180deg)" : "none",
            transition: "transform .15s"
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Cidade e estado (opcional)
      </button>
      {showOptional && (
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Cidade"
            placeholder="Sua cidade"
            value={lead.cidade}
            onChange={value => setLeadValue("cidade", value)}
          />
          <StateSelect
            value={lead.estado}
            onChange={value => setLeadValue("estado", value)}
          />
        </div>
      )}

      <div className="btn-row">
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={onNext}>
          Continuar
        </Button>
      </div>
    </Wizard>
  )
}
