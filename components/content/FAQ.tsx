export interface FAQItem {
  question: string
  answer: string
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSection({ items }: { items: FAQItem[] }) {
  return (
    <section style={{ marginTop: 40 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 500,
          color: "var(--verde-escuro)",
          marginBottom: 16
        }}
      >
        Perguntas Frequentes
      </h2>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item, i) => (
          <details
            key={i}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 8,
              background: "var(--surface)",
              padding: "14px 16px"
            }}
          >
            <summary
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--verde-escuro)",
                cursor: "pointer",
                lineHeight: 1.4
              }}
            >
              {item.question}
            </summary>
            <p
              style={{
                margin: "10px 0 0",
                color: "var(--text-muted)",
                fontSize: 13.5,
                lineHeight: 1.6
              }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
