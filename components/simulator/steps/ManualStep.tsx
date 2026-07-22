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
  onDone
}: ManualStepProps) {
  const update = (key: keyof ManualValues, value: string) =>
    setValues(current => ({ ...current, [key]: Number(value) || 0 }))
  return (
    <Wizard
      eyebrow="Opção 1"
      title="Complemente seu patrimônio atual."
      sub="Preencha o que se aplicar. Campos em branco são considerados zero — você pode ajustar depois com um especialista."
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
        <Button className="btn-primary flex-1" onClick={onDone}>
          Atualizar diagnóstico
        </Button>
      </div>
    </Wizard>
  )
}
