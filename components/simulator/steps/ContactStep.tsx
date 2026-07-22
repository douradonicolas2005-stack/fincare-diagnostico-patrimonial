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
  return (
    <Wizard
      eyebrow="Quase lá"
      title="Antes de gerar seu diagnóstico, para onde enviamos o resultado?"
      sub="Preencha seus dados para liberar seu Diagnóstico Patrimonial. Um especialista da Fincare também poderá comentar os resultados com você, se fizer sentido."
      topContent={
        <div className="mini-progress" aria-label="Etapa 1 de 2">
          <span className="done" />
          <span />
        </div>
      }
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
