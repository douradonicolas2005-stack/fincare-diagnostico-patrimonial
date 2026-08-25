import Link from "next/link"

export function ContentLayout({
  children,
  breadcrumbs
}: {
  children: React.ReactNode
  breadcrumbs?: { label: string; href?: string }[]
}) {
  return (
    <main className="page-bg">
      <header className="brand-header">
        <Link href="/">
          <img
            className="brand-logo-img"
            src="/logo-fincare.png"
            alt="Fincare Investimentos"
          />
        </Link>
        <div className="brand-text">
          <span className="brand-name">Fincare Investimentos</span>
          <span className="brand-tag">Safra Invest</span>
        </div>
      </header>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "16px 20px 0",
            fontSize: 12,
            color: "var(--text-muted)"
          }}
        >
          <Link
            href="/"
            style={{ color: "var(--verde-medio)", textDecoration: "none" }}
          >
            Início
          </Link>
          {breadcrumbs.map((bc, i) => (
            <span key={i}>
              {" / "}
              {bc.href ? (
                <Link
                  href={bc.href}
                  style={{
                    color: "var(--verde-medio)",
                    textDecoration: "none"
                  }}
                >
                  {bc.label}
                </Link>
              ) : (
                <span>{bc.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "24px 20px 60px"
        }}
      >
        {children}
      </article>

      <footer
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "24px 20px 40px",
          borderTop: "1px solid var(--line)",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 12
        }}
      >
        <p style={{ margin: "0 0 8px" }}>
          Ferramenta desenvolvida pela Fincare Investimentos, baseada em
          metodologias utilizadas em planejamento patrimonial.
        </p>
        <p style={{ margin: 0 }}>
          <Link
            href="/"
            style={{ color: "var(--verde-medio)", textDecoration: "none" }}
          >
            Acessar o Simulador Gratuito
          </Link>
        </p>
      </footer>
    </main>
  )
}
