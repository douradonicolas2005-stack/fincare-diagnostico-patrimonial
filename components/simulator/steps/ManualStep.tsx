import type { Dispatch, SetStateAction } from "react"
import type { ManualValues } from "../simulator.types"
import { Button } from "../ui/Button"
import { Wizard } from "../ui/Wizard"
import { MoneyInput } from "./MoneyInput"

type ManualStepProps = {
  values: ManualValues
  setValues: Dispatch<SetStateAction<ManualValues>>
  onBack: () => void
  onDone: () => void
  onSkip: () => void
  sending: boolean
}
const fields: Array<[keyof ManualValues, string]> = [
  ["imoveis", "Imóveis (valor de mercado)"],
  ["aplicacoes", "Outras aplicações"],
  ["previdencia", "Previdência privada"],
  ["empresas", "Participação em empresas"],
  ["caixa", "Caixa e reserva de liquidez"],
  ["financiamentos", "Financiamentos em aberto"]
]

export function ManualStep({
  values,
  setValues,
  onBack,
  onDone,
  onSkip,
  sending
}: ManualStepProps) {
  const update = (key: keyof ManualValues, value: string) =>
    setValues(current => ({ ...current, [key]: Number(value) || 0 }))
  return (
    <Wizard
      eyebrow="Diagnóstico avançado Fincare"
      title="Vamos deixar sua análise ainda mais precisa."
      sub="Adicione imóveis, aplicações, previdência, empresas, caixa e dívidas para um cálculo de patrimônio líquido mais completo. Preencha o que se aplicar — campos em branco são considerados zero, você pode ajustar depois com um especialista."
      topContent={
        <div className="mini-progress">
          <div className="mini-progress-label">
            <span>Diagnóstico avançado</span>
            <span>Etapa 1 de 2</span>
          </div>
          <div className="mini-progress-track">
            <div className="mini-progress-fill" style={{ width: "50%" }} />
          </div>
        </div>
      }
    >
      <div className="grid gap-0 md:grid-cols-2 md:gap-x-4">
        {fields.slice(0, 6).map(([key, label]) => (
          <MoneyInput
            key={key}
            label={label}
            value={values[key]}
            emptyWhenZero
            onChange={value => update(key, value)}
          />
        ))}
      </div>
      <MoneyInput
        label="Empréstimos em aberto"
        value={values.emprestimos}
        emptyWhenZero
        onChange={value => update("emprestimos", value)}
      />
      <div className="btn-row">
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button className="btn-primary flex-1" onClick={onDone} disabled={sending}>
          {sending ? "Gerando..." : "Ver diagnóstico completo"}
        </Button>
      </div>
      <div className="skip-line">
        <button type="button" onClick={onSkip} disabled={sending}>
          Prefiro continuar apenas com o diagnóstico rápido
        </button>
      </div>
    </Wizard>
  )
}
