import type { Metadata } from "next"
import Link from "next/link"
import { ContentLayout } from "@/components/content/ContentLayout"
import { FAQSchema, FAQSection } from "@/components/content/FAQ"

export const metadata: Metadata = {
  title: "Quanto Preciso para Me Aposentar",
  description:
    "Calculadora de aposentadoria: descubra quanto precisa investir para se aposentar com tranquilidade. Simulador gratuito com projeção personalizada.",
  keywords: [
    "quanto preciso para me aposentar",
    "calculadora de aposentadoria",
    "quanto investir para aposentar",
    "simulador de aposentadoria",
    "quando posso me aposentar"
  ],
  alternates: {
    canonical: "https://fincarescorepatrimonial.com.br/quanto-preciso-para-aposentar"
  },
  openGraph: {
    title: "Quanto Preciso para Me Aposentar | Calculadora Gratuita",
    description:
      "Use nossa calculadora de aposentadoria para descobrir quanto precisa investir e quando poderá se aposentar.",
    url: "https://fincarescorepatrimonial.com.br/quanto-preciso-para-aposentar",
    type: "article"
  }
}

const faqItems = [
  {
    question: "Como calcular quanto preciso para me aposentar?",
    answer:
      "Multiplique seus gastos mensais por 300 (regra dos 4%). Se você gasta R$ 6.000/mês, precisará de aproximadamente R$ 1.800.000 investidos. Use o simulador da Fincare para um cálculo personalizado considerando sua idade, patrimônio atual e aportes mensais."
  },
  {
    question: "A partir de que idade posso me aposentar?",
    answer:
      "Depende do seu patrimônio acumulado e da taxa de retirada sustentável. Com aportes consistentes e boa rentabilidade, é possível atingir a independência financeira entre 45 e 65 anos. O simulador calcula a idade estimada com base nos seus dados."
  },
  {
    question: "Qual a melhor taxa de retirada para aposentadoria?",
    answer:
      "A referência clássica é 4% ao ano. Para perfis mais conservadores, 3% é mais seguro. Para perfis mais arrojados, 5% pode ser considerado, porém com maior risco de o patrimônio se esgotar. O ideal é testar diferentes cenários no simulador."
  },
  {
    question: "Preciso de um assessor de investimentos para me aposentar?",
    answer:
      "Não é obrigatório, mas ajuda muito. Um assessor pode montar uma carteira personalizada, otimizar impostos e acompanhar sua evolução. O importante é ter um plano claro e seguir com disciplina."
  }
]

export default function QuantoAposentarPage() {
  return (
    <ContentLayout
      breadcrumbs={[{ label: "Quanto Preciso para Me Aposentar" }]}
    >
      <FAQSchema items={faqItems} />

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 500,
          color: "var(--verde-escuro)",
          lineHeight: 1.3,
          marginBottom: 16
        }}
      >
        Quanto Preciso para Me Aposentar?
      </h1>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 24
        }}
      >
        Essa é uma das perguntas mais importantes — e mais evitadas — na vida
        financeira. Saber quanto precisa acumular para se aposentar com
        tranquilidade permite que você tome decisões melhores hoje, em vez de
        descobrir tarde demais que não economizou o suficiente.
      </p>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 500,
          color: "var(--verde-escuro)",
          marginBottom: 12
        }}
      >
        A regra prática: 25 vezes seus gastos anuais
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 16
        }}
      >
        Se você sabe que seus gastos mensais são de R$ 7.000, seus gastos anuais
        são de R$ 84.000. Multiplicando por 25, o patrimônio necessário é de
        aproximadamente <strong>R$ 2.100.000</strong>.
      </p>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 8,
          background: "var(--surface)",
          padding: 20,
          marginBottom: 24
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--verde-medio)",
            letterSpacing: "0.05em"
          }}
        >
          EXEMPLO PRÁTICO
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12
          }}
        >
          {[
            { label: "Gastos mensais", value: "R$ 7.000" },
            { label: "Gastos anuais", value: "R$ 84.000" },
            { label: "Patrimônio necessário", value: "R$ 2.100.000" },
            { label: "Renda mensal estimada", value: "~R$ 7.000" }
          ].map((item) => (
            <div key={item.label}>
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                  letterSpacing: "0.04em"
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--verde-escuro)",
                  fontFamily: "var(--font-mono)"
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 500,
          color: "var(--verde-escuro)",
          marginBottom: 12
        }}
      >
        Fatores que aceleram ou atrasam sua aposentadoria
      </h2>

      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            border: "1px solid #d6e6dc",
            borderRadius: 8,
            background: "var(--verde-claro-bg)",
            padding: 14
          }}
        >
          <span style={{ fontSize: 18 }}>↑</span>
          <div>
            <strong style={{ fontSize: 14, color: "var(--verde-escuro)" }}>
              Aumentar aportes mensais
            </strong>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5
              }}
            >
              Aumentar o aporte mensal em R$ 2.000 pode antecipar a
              aposentadoria em 2 a 5 anos, dependendo do ponto de partida.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            border: "1px solid #d6e6dc",
            borderRadius: 8,
            background: "var(--verde-claro-bg)",
            padding: 14
          }}
        >
          <span style={{ fontSize: 18 }}>↑</span>
          <div>
            <strong style={{ fontSize: 14, color: "var(--verde-escuro)" }}>
              Melhorar a rentabilidade
            </strong>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5
              }}
            >
              Uma diferença de apenas 1% ao ano na rentabilidade real pode
              antecipar sua aposentadoria em cerca de 2 anos, graças aos juros
              compostos.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            border: "1px solid #d6e6dc",
            borderRadius: 8,
            background: "var(--verde-claro-bg)",
            padding: 14
          }}
        >
          <span style={{ fontSize: 18 }}>↓</span>
          <div>
            <strong style={{ fontSize: 14, color: "var(--verde-escuro)" }}>
              Reduzir gastos mensais
            </strong>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5
              }}
            >
              Reduzir seus gastos mensais diminui o patrimônio necessário. Se
              seus gastos caem de R$ 7.000 para R$ 5.000, o patrimônio necessário
              cai de R$ 2.1M para R$ 1.5M.
            </p>
          </div>
        </div>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 500,
          color: "var(--verde-escuro)",
          marginBottom: 12
        }}
      >
        Teste agora com o simulador gratuito
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 16
        }}
      >
        Em vez de fazer contas na cabeça, use o simulador da Fincare para
        descobrir em menos de 1 minuto: quanto falta para sua aposentadoria,
        qual seu Score Patrimonial e qual o plano ideal para sua situação.
      </p>

      <Link
        href="/diagnostico"
        style={{
          display: "inline-block",
          background: "var(--verde-medio)",
          color: "#fff",
          padding: "14px 28px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14.5,
          textDecoration: "none",
          marginBottom: 32
        }}
      >
        Calcular quanto falta para minha aposentadoria →
      </Link>

      <FAQSection items={faqItems} />
    </ContentLayout>
  )
}
