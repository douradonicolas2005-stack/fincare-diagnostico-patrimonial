import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Select } from "../ui/Select"
import { Wizard } from "../ui/Wizard"

type PremisesStepProps = {
  idade: number
  rentabilidade: number
  retirada: number
  setValue: (key: "idade" | "rentabilidade" | "retirada", value: string) => void
  onBack: () => void
  onNext: () => void
}

export function PremisesStep({
  idade,
  rentabilidade,
  retirada,
  setValue,
  onBack,
  onNext
}: PremisesStepProps) {
  return (
    <Wizard
      eyebrow="Passo 4 · Premissas avançadas"
      title="Só mais alguns ajustes finos."
      sub="Essas premissas tornam a simulação mais próxima da sua realidade."
    >
      <Input
        label="Sua idade atual"
        type="number"
        value={idade}
        onChange={value => setValue("idade", value)}
      />
      <label className="field-block">
        <span className="field-label">
          Rentabilidade real esperada (acima da inflação, % ao ano)
        </span>
        <div className="slider-value">{rentabilidade}% a.a.</div>
        <input
          className="range-input"
          type="range"
          min="2"
          max="12"
          step=".5"
          value={rentabilidade}
          onChange={event => setValue("rentabilidade", event.target.value)}
        />
        <div className="range-labels">
          <span>Conservador</span>
          <span>Arrojado</span>
        </div>
      </label>
      <Select
        label="Taxa de retirada sustentável"
        value={String(retirada)}
        placeholder={null}
        onChange={value => setValue("retirada", value)}
      >
        <option value="3">3% a.a. — perfil mais conservador</option>
        <option value="4">4% a.a. — referência clássica</option>
        <option value="5">5% a.a. — perfil mais arrojado</option>
      </Select>
      <p className="hint">
        Define quanto do patrimônio pode ser retirado por ano sem consumi-lo ao
        longo do tempo.
      </p>
      <div className="mt-7 flex gap-3">
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
