import type { Metadata } from "next"
import Link from "next/link"
import { ContentLayout } from "@/components/content/ContentLayout"
import { FAQSchema, FAQSection } from "@/components/content/FAQ"

export const metadata: Metadata = {
  title: "Renda Passiva: Como Calcular e Construir",
  description:
    "Aprenda como calcular renda passiva, quais os melhores investimentos para gerar renda mensal e quanto você precisa investir para viver de renda.",
  keywords: [
    "renda passiva",
    "como calcular renda passiva",
    "investimentos para renda passiva",
    "viver de renda",
    "renda mensal com investimentos"
  ],
  alternates: {
    canonical: "https://fincarescorepatrimonial.com.br/renda-passiva-como-calcular"
  },
  openGraph: {
    title: "Renda Passiva: Como Calcular e Construir | Guia Completo",
    description:
      "Guia completo sobre renda passiva: como calcular, investimentos recomendados e estratégias para viver de renda.",
    url: "https://fincarescorepatrimonial.com.br/renda-passiva-como-calcular",
    type: "article"
  }
}

const faqItems = [
  {
    question: "Quanto preciso investir para ganhar R$ 5.000 por mês de renda passiva?",
    answer:
      "Considerando uma taxa de retorno real de 6% ao ano (acima da inflação), você precisaria de aproximadamente R$ 1.000.000 investidos para gerar R$ 5.000/mês. Com a regra dos 4%, o valor seria de R$ 1.500.000."
  },
  {
    question: "Quais são os melhores investimentos para renda passiva?",
    answer:
      "Fundos Imobiliários (FIIs), CDBs de bancos grandes, LCI/LCA, Tesouro IPCA+ com juros semestrais, ações de empresas pagadoras de dividendos e aluguel de imóveis são as opções mais populares. O ideal é diversificar entre diferentes classes."
  },
  {
    question: "Renda passiva é a mesma coisa que não trabalhar?",
    answer:
      "Não necessariamente. Renda passiva é um complemento de renda que exige pouco ou nenhum trabalho manutenção após o investimento inicial. Muitas pessoas mantêm atividades profissionais mesmo tendo renda passiva significativa."
  },
  {
    question: "É seguro depender apenas de renda passiva?",
    answer:
      "Depende da diversificação e do patrimônio acumulado. Manter reserva de emergência, diversificar entre classes de ativos e ter uma taxa de retirada conservadora (3-4% ao ano) reduz significativamente os riscos."
  }
]

export default function RendaPassivaPage() {
  return (
    <ContentLayout
      breadcrumbs={[{ label: "Renda Passiva: Como Calcular e Construir" }]}
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
        Renda Passiva: Como Calcular e Construir
      </h1>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 24
        }}
      >
        Renda passiva é o rendimento que seus investimentos geram
        mensalmente, sem que você precise trabalhar ativamente para recebê-la.
        É o sonho de muitos investidores: acumular patrimônio suficiente para
        que os rendimentos cubram todos os gastos do dia a dia.
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
        Como calcular a renda passiva mensal
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 16
        }}
      >
        O cálculo é direto. Multiplicando o patrimônio investido pela taxa de
        retorno mensal:
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
            margin: "0 0 8px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--verde-medio)",
            letterSpacing: "0.05em"
          }}
        >
          FÓRMULA
        </p>
        <p
          style={{
            margin: "0 0 16px",
            fontFamily: "var(--font-display)",
            fontSize: 18,
            color: "var(--verde-escuro)",
            fontWeight: 500
          }}
        >
          Renda Passiva = Patrimônio × (Taxa Anual ÷ 12)
        </p>

        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--verde-medio)",
            letterSpacing: "0.05em"
          }}
        >
          EXEMPLO COM R$ 1.000.000 INVESTIDOS
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12
          }}
        >
          {[
            { taxa: "6% a.a.", renda: "R$ 5.000/mês" },
            { taxa: "8% a.a.", renda: "R$ 6.667/mês" },
            { taxa: "10% a.a.", renda: "R$ 8.333/mês" }
          ].map((item) => (
            <div key={item.taxa} style={{ textAlign: "center" }}>
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)"
                }}
              >
                {item.taxa}
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
                {item.renda}
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
        Investimentos para gerar renda passiva
      </h2>

      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        {[
          {
            name: "Fundos Imobiliários (FIIs)",
            desc: "Distribuem dividendos mensais isentos de IR para pessoa física. Ideal para renda passiva regular.",
            tag: "Renda mensal"
          },
          {
            name: "CDBs e LCI/LCA",
            desc: "Renda fixa com garantia do FGC. CDBs pagam IOF + IR; LCIs/LCAs são isentas de IR.",
            tag: "Segurança"
          },
          {
            name: "Tesouro IPCA+ (juros semestrais)",
            desc: "Proteção contra inflação com pagamento semestral. Excelente para planejamento de longo prazo.",
            tag: "Inflação"
          },
          {
            name: "Ações pagadoras de dividendos",
            desc: "Empresas sólidas que distribuem parte do lucro como dividendos. Renda variável com potencial de crescimento.",
            tag: "Crescimento"
          }
        ].map((inv) => (
          <div
            key={inv.name}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 8,
              background: "var(--surface)",
              padding: 14
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6
              }}
            >
              <strong style={{ fontSize: 14, color: "var(--verde-escuro)" }}>
                {inv.name}
              </strong>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--verde-medio)",
                  border: "1px solid var(--verde-claro)",
                  borderRadius: 20,
                  padding: "2px 8px"
                }}
              >
                {inv.tag}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5
              }}
            >
              {inv.desc}
            </p>
          </div>
        ))}
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
        Quanto você precisa para viver de renda?
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 16
        }}
      >
        A resposta depende do seu padrão de vida desejado. Use o simulador da
        Fincare para descobrir em 1 minuto qual patrimônio você precisa
        acumular para gerar a renda passiva mensal que deseja.
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
        Simular quanto preciso para viver de renda →
      </Link>

      <FAQSection items={faqItems} />
    </ContentLayout>
  )
}
