"use client"

export function LandingPage() {
  const startDiagnosis = () => {
    const query = window.location.search
    window.location.assign(`/diagnostico${query}`)
  }

  return (
    <main className="landing-page">
      <section className="landing-card">
        <img
          className="landing-logo"
          src="/logo-fincare-transparent.png"
          alt="Fincare Investimentos · Safra Invest"
        />

        <h1>
          Descubra em <span>1 minuto</span> quanto falta para sua independência financeira.
        </h1>

        <div className="methodology methodology-top">
          <div className="methodology-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"
                stroke="#9fc4c7"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="methodology-text">
            Metodologia Wealth Management da Fincare Investimentos
          </div>
        </div>

        <div className="preview-card">
          <div className="preview-main">
            <div className="preview-gauge">
              <div className="preview-gauge-inner">73%</div>
            </div>
            <div className="preview-text">
              <div className="preview-label">Seu Score Patrimonial</div>
              <div className="preview-title">É assim que você vai ver o seu</div>
            </div>
          </div>
          <div className="preview-stats">
            <div className="preview-stat">
              <div className="preview-stat-value">~12 anos</div>
              <div className="preview-stat-label">até a independência</div>
            </div>
            <div className="preview-stat">
              <div className="preview-stat-value">Moderado</div>
              <div className="preview-stat-label">seu perfil de investidor</div>
            </div>
          </div>
        </div>

        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-num">1</div>
            <div className="landing-step-label">
              Responda 5
              <br />
              perguntas rápidas
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">2</div>
            <div className="landing-step-label">
              Veja seu Score
              <br />
              na hora
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">3</div>
            <div className="landing-step-label">
              Receba seu plano
              <br />
              em PDF
            </div>
          </div>
        </div>

        <button type="button" className="landing-cta" onClick={startDiagnosis}>
          Iniciar meu diagnóstico gratuito →
        </button>
        <div className="landing-foot">Sem compromisso · Leva menos de 1 minuto</div>
        <div className="landing-foot">
          <a href="/privacidade">Política de Privacidade</a>
        </div>
      </section>
    </main>
  )
}
