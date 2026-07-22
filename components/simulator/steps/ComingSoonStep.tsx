import { Button } from "../ui/Button"
import { Wizard } from "../ui/Wizard"

type ComingSoonStepProps = {
  title: string
  sub: string
  onBack: () => void
}

export function ComingSoonStep({ title, sub, onBack }: ComingSoonStepProps) {
  return (
    <Wizard eyebrow="Diagnóstico avançado Fincare" title={title} sub={sub}>
      <div className="coming-soon-step">
        <span className="coming-soon-badge">Em andamento</span>
        <p>
          Esta funcionalidade está sendo preparada e estará disponível em uma
          próxima versão.
        </p>
        <Button variant="ghost" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </Wizard>
  )
}
