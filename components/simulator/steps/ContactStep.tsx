import { useState } from "react"
import { isValidPhoneBR } from "@/lib/security"
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactStep({
  lead,
  setLeadValue,
  onBack,
  onNext
}: ContactStepProps) {
  const [showOptional, setShowOptional] = useState(
    Boolean(lead.cidade || lead.estado)
  )
  const [touched, setTouched] = useState({ nome: false, email: false, telefone: false })
  const touch = (campo: keyof typeof touched) => setTouched(current => ({ ...current, [campo]: true }))

  const nomeValido = lead.nome.trim().length >= 2
  const emailValido = EMAIL_REGEX.test(lead.email.trim())
  const telefoneValido = isValidPhoneBR(lead.telefone)

  const handleNext = () => {
    // Se a pessoa clicar "Continuar" sem nunca ter saído de um campo
    // inválido (ex: colou os 3 dados e clicou direto), garante que os
    // erros específicos apareçam mesmo assim, não só o diálogo genérico
    // que o passo pai ainda mostra como reforço.
    setTouched({ nome: true, email: true, telefone: true })
    onNext()
  }

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
        onBlur={() => touch("nome")}
        error={touched.nome && !nomeValido ? "Informe seu nome completo" : undefined}
        valid={touched.nome && nomeValido}
      />
      <Input
        label="E-mail"
        type="email"
        placeholder="voce@email.com"
        value={lead.email}
        onChange={value => setLeadValue("email", value)}
        onBlur={() => touch("email")}
        error={
          touched.email && !emailValido
            ? lead.email.trim()
              ? "Confira o e-mail — parece incompleto"
              : "Informe seu e-mail"
            : undefined
        }
        valid={touched.email && emailValido}
      />
      <PhoneInput
        label="WhatsApp"
        placeholder="(11) 90000-0000"
        value={lead.telefone}
        onChange={value => setLeadValue("telefone", value)}
        onBlur={() => touch("telefone")}
        error={
          touched.telefone && !telefoneValido
            ? lead.telefone.trim()
              ? "Confira o número — parece incompleto"
              : "Informe seu WhatsApp com DDD"
            : undefined
        }
        valid={touched.telefone && telefoneValido}
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
        <Button className="flex-1" onClick={handleNext}>
          Continuar
        </Button>
      </div>
    </Wizard>
  )
}
