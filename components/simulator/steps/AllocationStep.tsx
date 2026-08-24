import type { Dispatch, SetStateAction } from "react"
import type { AssetClass, InvestmentAllocation } from "@/lib/types"
import { ASSET_CLASSES } from "@/lib/types"
import { FEE_OPTIONS } from "@/lib/fees"
import { Button } from "../ui/Button"
import { Select } from "../ui/Select"
import { Wizard } from "../ui/Wizard"
import { MoneyInput } from "./MoneyInput"

type AllocationStepProps = {
  values: InvestmentAllocation
  setValues: Dispatch<SetStateAction<InvestmentAllocation>>
  taxaBand: string
  setTaxaBand: (value: string) => void
  onBack: () => void
  onDone: () => void
  onSkip: () => void
  sending: boolean
}

// Rotulos amigaveis por classe. As chaves batem com ASSET_CLASSES (e com
// PROFILES[*].alocacao), o que permite o comparativo atual x ideal.
const LABELS: Record<AssetClass, string> = {
  "Renda Fixa": "Renda Fixa (CDB, Tesouro, LCI/LCA, debêntures...)",
  Multimercado: "Fundos Multimercado",
  "Renda Variável Local": "Renda Variável Brasil (ações, FIIs, ETFs)",
  Internacional: "Investimentos Internacionais",
  Alternativos: "Alternativos (private equity, cripto, outros)"
}

export function AllocationStep({
  values,
  setValues,
  taxaBand,
  setTaxaBand,
  onBack,
  onDone,
  onSkip,
  sending
}: AllocationStepProps) {
  const update = (key: AssetClass, value: string) =>
    setValues(current => ({ ...current, [key]: Number(value) || 0 }))

  return (
    <Wizard
      eyebrow="Diagnóstico avançado Fincare"
      title="Como sua carteira investida está dividida hoje?"
      sub="Informe, em cada classe, quanto você tem investido aproximadamente. Assim conseguimos comparar sua alocação atual com a alocação de referência para o seu perfil. Preencha o que se aplicar — campos em branco são considerados zero."
      topContent={
        <div className="mini-progress">
          <div className="mini-progress-label">
            <span>Diagnóstico avançado</span>
            <span>Etapa 2 de 2</span>
          </div>
          <div className="mini-progress-track">
            <div className="mini-progress-fill" style={{ width: "100%" }} />
          </div>
        </div>
      }
    >
      <div className="grid gap-0 md:grid-cols-2 md:gap-x-4">
        {ASSET_CLASSES.map(classe => (
          <MoneyInput
            key={classe}
            label={LABELS[classe]}
            value={values[classe]}
            emptyWhenZero
            onChange={value => update(classe, value)}
          />
        ))}
      </div>
      <Select
        label="Quanto você paga de taxa por ano hoje? (taxa de administração, gestão, custódia)"
        value={taxaBand}
        onChange={setTaxaBand}
      >
        {FEE_OPTIONS.map(option => (
          <option key={option.label} value={option.label}>
            {option.label}
          </option>
        ))}
      </Select>
      <div className="btn-row">
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button
          className="btn-primary flex-1"
          onClick={onDone}
          disabled={sending}
        >
          {sending ? "Gerando..." : "Ver diagnóstico completo"}
        </Button>
      </div>
      <div className="skip-line">
        <button type="button" onClick={onSkip} disabled={sending}>
          Prefiro não detalhar minha alocação agora
        </button>
      </div>
    </Wizard>
  )
}
