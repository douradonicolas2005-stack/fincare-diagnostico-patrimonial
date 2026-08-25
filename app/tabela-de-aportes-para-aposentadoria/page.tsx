import type { Metadata } from "next"
import Link from "next/link"
import { ContentLayout } from "@/components/content/ContentLayout"
import { FAQSchema, FAQSection } from "@/components/content/FAQ"

export const metadata: Metadata = {
  title: "Tabela de Aportes para Aposentadoria",
  description:
    "Tabela completa de aportes para aposentadoria: descubra quanto investir por mês para atingir sua meta de independência financeira.",
  keywords: [
    "tabela aportes aposentadoria",
    "quanto investir por mês",
    "tabela de investimentos",
    "planejamento de aposentadoria",
    "aporte mensal para aposentar"
  ],
  alternates: {
    canonical: "https://fincarescorepatrimonial.com.br/tabela-de-aportes-para-aposentadoria"
  },
  openGraph: {
    title: "Tabela de Aportes para Aposentadoria | Guia Prático",
    description:
      "Veja quanto investir por mês para se aposentar com a renda que deseja. Tabela completa com diferentes cenários.",
    url: "https://fincarescorepatrimonial.com.br/tabela-de-aportes-para-aposentadoria",
    type: "article"
  }
}

const faqItems = [
  {
    question: "Quanto devo investir por mês para me aposentar?",
    answer:
      "Depende da sua idade, patrimônio atual e renda desejada na aposentadoria. Como regra geral, investir 20% da renda mensal desde os 25 anos pode proporcionar uma aposentadoria confortável aos 60 anos. Use o simulador da Fincare para um cálculo personalizado."
  },
  {
    question: "É tarde para começar a investir para aposentadoria aos 40 anos?",
    answer:
      "Não é tarde, mas é importante começar imediatamente. Com 40 anos, você tem cerca de 25 anos até a aposentadoria tradicional. Investindo R$ 2.000/mês com rentabilidade de 8% a.a., pode acumular mais de R$ 1.900.000 nesse período."
  },
  {
    question: "Como a inflação afeta meus investimentos para aposentadoria?",
    answer:
      "A inflação corrói o poder de compra do seu dinheiro. Por isso, é essencial investir em ativos que rendam acima da inflação (rentabilidade real). O Tesouro IPCA+ e fundos multimercado são boas opções para proteger seu patrimônio."
  },
  {
    question: "Qual a diferença entre aportar fixo e aportar crescente?",
    answer:
      "No aporte fixo, você investe o mesmo valor todo mês. No aporte crescente, aumenta o valor conforme sua renda sobe. O aporte crescente é mais realista e pode acelerar significativamente a construção do patrimônio."
  }
]

const tableData = [
  {
    idade: "25",
    renda: "R$ 5.000",
    aporte: "R$ 1.000",
    patrimonio60: "R$ 3.500.000",
    rendaApos: "R$ 11.667"
  },
  {
    idade: "30",
    renda: "R$ 7.000",
    aporte: "R$ 1.500",
    patrimonio60: "R$ 2.800.000",
    rendaApos: "R$ 9.333"
  },
  {
    idade: "35",
    renda: "R$ 10.000",
    aporte: "R$ 2.500",
    patrimonio60: "R$ 2.300.000",
    rendaApos: "R$ 7.667"
  },
  {
    idade: "40",
    renda: "R$ 12.000",
    aporte: "R$ 3.000",
    patrimonio60: "R$ 1.600.000",
    rendaApos: "R$ 5.333"
  },
  {
    idade: "45",
    renda: "R$ 15.000",
    aporte: "R$ 4.000",
    patrimonio60: "R$ 1.100.000",
    rendaApos: "R$ 3.667"
  }
]

export default function TabelaAportesPage() {
  return (
    <ContentLayout
      breadcrumbs={[{ label: "Tabela de Aportes para Aposentadoria" }]}
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
        Tabela de Aportes para Aposentadoria
      </h1>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 24
        }}
      >
        Quanto você precisa investir por mês para se aposentar com
        tranquilidade? A resposta depende de três fatores:{" "}
        <strong>sua idade atual</strong>, <strong>quanto já tem investido</strong> e{" "}
        <strong>a renda que deseja ter na aposentadoria</strong>. A tabela abaixo
        mostra cenários para diferentes idades, considerando rentabilidade real
        de 6% ao ano.
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
        Cenários de aposentadoria (rentabilidade 6% a.a. real)
      </h2>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid var(--line)",
          borderRadius: 8,
          background: "var(--surface)",
          marginBottom: 24
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--verde-escuro)",
                color: "#fff"
              }}
            >
              {[
                "Idade atual",
                "Renda mensal",
                "Aporte mensal",
                "Patrimônio aos 60",
                "Renda na aposentadoria"
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "12px 14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    whiteSpace: "nowrap"
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr
                key={row.idade}
                style={{
                  background: i % 2 === 0 ? "var(--surface)" : "var(--surface-alt)",
                  borderBottom: "1px solid var(--line)"
                }}
              >
                <td
                  style={{
                    padding: "10px 14px",
                    fontWeight: 700,
                    color: "var(--verde-escuro)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {row.idade} anos
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {row.renda}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    fontWeight: 700,
                    color: "var(--verde-medio)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {row.aporte}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {row.patrimonio60}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    fontWeight: 700,
                    color: "var(--verde-escuro)",
                    fontFamily: "var(--font-mono)"
                  }}
                >
                  {row.rendaApos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 12,
          lineHeight: 1.5,
          marginBottom: 24,
          fontStyle: "italic"
        }}
      >
        * Valores estimados com rentabilidade real de 6% a.a. (acima da
        inflação), sem patrimônio inicial e aporte crescente de 3% ao ano.
        Resultados meramente ilustrativos.
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
        Dica: comece pelo simulador
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 16
        }}
      >
        A tabela acima é uma referência geral. Cada pessoa tem uma situação
        diferente. O simulador da Fincare considera sua idade, patrimônio
        atual, aportes mensais, rentabilidade e taxa de retirada para gerar
        um diagnóstico personalizado — em menos de 1 minuto.
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
        Gerar minha projeção personalizada →
      </Link>

      <FAQSection items={faqItems} />
    </ContentLayout>
  )
}
