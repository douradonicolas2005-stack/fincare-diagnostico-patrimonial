import { Wizard } from "../ui/Wizard"

type AdvancedStepProps = {
  onManual: () => void
  onPortfolio: () => void
  onQuick: () => void
}

export function AdvancedStep({
  onManual,
  onPortfolio,
  onQuick
}: AdvancedStepProps) {
  return (
    <Wizard
      eyebrow="Diagnóstico avançado Fincare"
      title="Vamos deixar sua análise ainda mais precisa."
      sub="Escolha como prefere complementar seus dados. Cada opção aprofunda o cálculo com mais informações sobre o seu patrimônio."
    >
      <div className="advanced-step">
        <div className="advanced-options">
          <div className="advanced-option">
            <span className="advanced-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />
              </svg>
            </span>
            <span className="advanced-option-body">
              <span className="option-eyebrow">Opção 1</span>
              <b>Informar manualmente</b>
              <p>
                Adicione imóveis, aplicações, previdência, empresas, caixa,
                financiamentos e empréstimos para um cálculo de patrimônio líquido
                mais completo.
              </p>
              <button type="button" onClick={onManual} className="btn btn-primary option-button">Informar meus dados</button>
            </span>
          </div>
          <div className="advanced-option">
            <span className="advanced-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </span>
            <span className="advanced-option-body">
              <span className="option-eyebrow">Opção 2</span>
              <span className="advanced-option-title-row">
                <b>Importar minha carteira</b>
                <small className="advanced-option-file-tag">PDF · Excel · CSV</small>
              </span>
              <p>
                Envie o extrato ou a posição consolidada da sua corretora para
                reconhecermos sua carteira automaticamente.
              </p>
              <button type="button" onClick={onPortfolio} className="btn btn-primary option-button">Importar minha carteira</button>
            </span>
          </div>
        </div>
        <div className="skip-line">
          <button type="button" onClick={onQuick}>Prefiro continuar apenas com o diagnóstico rápido</button>
        </div>
      </div>
    </Wizard>
  )
}
