"use client"

export function LandingPage() {
  const startDiagnosis = () => {
    const query = window.location.search
    window.location.assign(`/diagnostico${query}`)
  }

  return (
    <main className="landing-page">
      <section className="landing-card">
        <span className="landing-eyebrow">Fincare Investimentos · Safra Invest</span>
        <h1>
          Descubra em <span>1 minuto</span> quanto falta para sua independência financeira.
        </h1>
        <p>
          Um diagnóstico patrimonial gratuito, com metodologia de Wealth Management,
          para você entender sua trajetória até a liberdade financeira.
        </p>
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
