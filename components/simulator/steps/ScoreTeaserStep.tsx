import { Gauge } from "../charts/Gauge"
import { Button } from "../ui/Button"
import { Wizard } from "../ui/Wizard"

type ScoreTeaserStepProps = {
  percentage: number
  onBack: () => void
  onNext: () => void
}

export function ScoreTeaserStep({
  percentage,
  onBack,
  onNext
}: ScoreTeaserStepProps) {
  return (
    <Wizard
      eyebrow="Prévia do seu diagnóstico"
      title="Encontramos seu Score Patrimonial"
      sub="Com base no que você respondeu, calculamos o quanto falta para sua independência financeira."
    >
      <div className="teaser-step">
        <Gauge percentage={percentage} />
        <div className="teaser-score-num">{Math.round(percentage)}%</div>
        <div className="teaser-score-caption">Score Patrimonial</div>

        <div className="lock-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="16" height="10" rx="2" stroke="var(--verde-medio)" strokeWidth="2" />
            <path d="M8 10V7a4 4 0 018 0v3" stroke="var(--verde-medio)" strokeWidth="2" />
          </svg>
          <div className="lock-text">
            <b>Faltam só 2 passos rápidos</b>
            Informe seus dados para liberar o relatório completo — anos até a
            independência, alocação recomendada e plano em PDF.
          </div>
        </div>

        <div className="btn-row">
          <Button variant="ghost" onClick={onBack}>
            Voltar
          </Button>
          <Button className="btn-primary flex-1" onClick={onNext}>
            Quero ver meu diagnóstico completo →
          </Button>
        </div>
      </div>
    </Wizard>
  )
}
