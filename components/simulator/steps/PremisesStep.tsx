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
        <div className="stepper">
          <button
            type="button"
            className="stepper-btn"
            aria-label="Diminuir rentabilidade"
            disabled={rentabilidade <= 2}
            onClick={() =>
              setValue("rentabilidade", String(Math.max(2, rentabilidade - 0.5)))
            }
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="stepper-track-wrap">
            <div className="slider-value">{rentabilidade}% a.a.</div>
            <div
              className="stepper-track"
              role="progressbar"
              aria-valuemin={2}
              aria-valuemax={12}
              aria-valuenow={rentabilidade}
            >
              <div
                className="stepper-track-fill"
                style={{ width: `${((rentabilidade - 2) / 10) * 100}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            className="stepper-btn"
            aria-label="Aumentar rentabilidade"
            disabled={rentabilidade >= 12}
            onClick={() =>
              setValue("rentabilidade", String(Math.min(12, rentabilidade + 0.5)))
            }
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
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
