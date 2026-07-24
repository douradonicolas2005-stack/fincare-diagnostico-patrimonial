import type { Lead } from "@/lib/types"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Select } from "../ui/Select"
import { Wizard } from "../ui/Wizard"

type QualificationStepProps = {
  lead: Lead
  setLeadValue: (key: keyof Lead, value: string) => void
  consent: boolean
  setConsent: (value: boolean) => void
  onBack: () => void
  onSubmit: () => void
  sending: boolean
}

const objectives = [
  "Viver de renda",
  "Aposentadoria",
  "Sucessão patrimonial",
  "Proteção patrimonial",
  "Eficiência tributária"
]

export function QualificationStep({
  lead,
  setLeadValue,
  consent,
  setConsent,
  onBack,
  onSubmit,
  sending
}: QualificationStepProps) {
  return (
    <Wizard
      eyebrow="Últimos detalhes"
      title="Isso ajuda a personalizar sua análise."
      topContent={
        <div className="mini-progress" aria-label="Etapa 2 de 2">
          <span className="done" />
          <span className="done" />
        </div>
      }
    >
      <div className="qualification-grid grid gap-4 md:grid-cols-2">
        <Select
          label="Faixa de patrimônio atual"
          placeholder="Selecione"
          value={lead.faixa_patrimonio}
          onChange={value => setLeadValue("faixa_patrimonio", value)}
        >
          <option value="ate_500k">Até R$ 500 mil</option>
          <option value="500k_1m">R$ 500 mil – R$ 1 milhão</option>
          <option value="1m_5m">R$ 1 milhão – R$ 5 milhões</option>
          <option value="5m_mais">Acima de R$ 5 milhões</option>
        </Select>
        <Select
          label="Faixa de renda mensal"
          placeholder="Selecione"
          value={lead.faixa_renda}
          onChange={value => setLeadValue("faixa_renda", value)}
        >
          <option value="ate_15k">Até R$ 15 mil</option>
          <option value="15k_40k">R$ 15 mil – R$ 40 mil</option>
          <option value="40k_100k">R$ 40 mil – R$ 100 mil</option>
          <option value="100k_mais">Acima de R$ 100 mil</option>
        </Select>
      </div>
      <Input
        label="Onde você investe atualmente?"
        placeholder="Ex: banco, corretora ou assessoria"
        value={lead.instituicao_financeira_atual}
        onChange={value => setLeadValue("instituicao_financeira_atual", value)}
      />
      <div className="qualification-grid qualification-grid-secondary grid gap-4 md:grid-cols-2">
        <Select
          label="Possui assessor de investimentos?"
          placeholder="Selecione"
          value={lead.possui_assessor}
          onChange={value => setLeadValue("possui_assessor", value)}
        >
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </Select>
        <Select
          label="Possui gerente bancário?"
          placeholder="Selecione"
          value={lead.possui_gerente_banco}
          onChange={value => setLeadValue("possui_gerente_banco", value)}
        >
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </Select>
      </div>
      <fieldset className="field-block">
        <legend className="field-label">Qual seu objetivo principal?</legend>
        <div className="radio-group">
          {objectives.map(objective => (
            <label
              className={`radio-opt ${lead.objetivo_financeiro === objective ? "selected" : ""}`}
              key={objective}
            >
              <input
                type="radio"
                name="objetivo"
                checked={lead.objetivo_financeiro === objective}
                onChange={() => setLeadValue("objetivo_financeiro", objective)}
              />
              <span className="radio-preview" aria-hidden="true" />
              <span className="radio-label">{objective}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field-block">
        <p className="consent-copy">
          Ao autorizar, você receberá por e-mail o seu Diagnóstico Patrimonial
          completo em PDF assim que a simulação for concluída, e a Fincare
          Investimentos poderá te contatar por e-mail e WhatsApp para uma
          análise personalizada, em conformidade com a LGPD. Veja nossa{" "}
          <a href="/privacidade" className="underline">
            Política de Privacidade
          </a>
          .
        </p>
        <button
          type="button"
          className={`btn ${consent ? "btn-primary" : "btn-ghost"} consent-button w-full`}
          onClick={() => setConsent(!consent)}
        >
          {consent && <span aria-hidden="true">✓</span>}
          <span>{consent ? "Contato autorizado" : "Autorizar contato"}</span>
        </button>
      </div>
      <div className="btn-row">
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button className="flex-1" onClick={onSubmit} disabled={sending}>
          {sending ? "Enviando..." : "Gerar meu diagnóstico"}
        </Button>
      </div>
    </Wizard>
  )
}
