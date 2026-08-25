import type { Metadata } from "next"
import Link from "next/link"
import { ContentLayout } from "@/components/content/ContentLayout"
import { FAQSchema, FAQSection } from "@/components/content/FAQ"

export const metadata: Metadata = {
  title: "O que é Independência Financeira",
  description:
    "Descubra o que é independência financeira, como calcular quanto você precisa e quais passos seguir para alcançar a liberdade financeira.",
  keywords: [
    "independência financeira",
    "liberdade financeira",
    "como achieving independência financeira",
    "renda passiva",
    "planejamento financeiro"
  ],
  alternates: {
    canonical: "https://fincarescorepatrimonial.com.br/o-que-e-independencia-financeira"
  },
  openGraph: {
    title: "O que é Independência Financeira | Guia Completo",
    description:
      "Entenda o conceito de independência financeira e como planejar sua jornada até a liberdade financeira.",
    url: "https://fincarescorepatrimonial.com.br/o-que-e-independencia-financeira",
    type: "article"
  }
}

const faqItems = [
  {
    question: "Quanto preciso para me tornar independente financeiramente?",
    answer:
      "A regra geral é multiplicar seus gastos mensais por 300 (equivalente a 25 anos de despesas, baseado na regra dos 4%). Por exemplo, se você gasta R$ 10.000 por mês, precisaria de aproximadamente R$ 3.000.000 investidos para gerar renda passiva suficiente."
  },
  {
    question: "Qual a diferença entre independência financeira e aposentadoria?",
    answer:
      "A aposentadoria é uma etapa regulamentada com idade mínima e regras do INSS ou previdência privada. A independência financeira ocorre quando seus investimentos geram renda suficiente para cobrir seus gastos, sem depender de salário ou aposentadoria — e pode acontecer a qualquer idade."
  },
  {
    question: "É possível alcançar independência financeira ganhando salário mínimo?",
    answer:
      "É desafiador, mas não impossível. O mais importante é a taxa de poupança (quanto do seu rendimento você guarda). Pessoas que conseguem poupar 50% ou mais da renda, mesmo com valores menores, podem atingir a independência financeira em 10 a 15 anos com investimentos consistentes."
  },
  {
    question: "O que é a regra dos 4% e como ela funciona?",
    answer:
      "A regra dos 4% sugere que, se você retirar 4% do seu patrimônio investido por ano para cobrir seus gastos, o dinheiro deve durar pelo menos 30 anos. É o método mais utilizado nos EUA para planejamento de aposentadoria antecipada (FIRE - Financial Independence, Retire Early)."
  },
  {
    question: "Quais são os melhores investimentos para independência financeira?",
    answer:
      "Não existe resposta única — depende do seu perfil de risco e prazo. Geralmente, uma combinação diversificada de renda fixa (CDBs, IPCA+), fundos imobiliários (FIIs) e ações de empresas sólidas é recomendada. O mais importante é manter consistência e disciplina ao longo dos anos."
  }
]

export default function IndependenciaFinanceiraPage() {
  return (
    <ContentLayout
      breadcrumbs={[{ label: "O que é Independência Financeira" }]}
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
        O que é Independência Financeira
      </h1>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 24
        }}
      >
        Independência financeira é o momento em que seus investimentos geram
        renda suficiente para cobrir todos os seus gastos mensais, sem a
        necessidade de depender de um salário ou renda ativa. É o conceito
        central por trás do movimento{" "}
        <strong>FIRE</strong> (Financial Independence, Retire Early), que
        inspira milhares de pessoas a buscarem liberdade financeira antes da
        idade tradicional de aposentadoria.
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
        Como calcular o valor necessário
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 16
        }}
      >
        O cálculo mais utilizado é a <strong>regra dos 4%</strong>. Ela
        funciona assim:
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
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 20,
            color: "var(--verde-escuro)",
            fontWeight: 500
          }}
        >
          Patrimônio Necessário = Gastos Mensais × 300
        </p>
      </div>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 24
        }}
      >
        Isso significa que, se você gasta R$ 8.000 por mês, precisaria de
        aproximadamente R$ 2.400.000 investidos para manter seu estilo de vida
        apenas com renda dos investimentos.
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
        Os 5 pilares da independência financeira
      </h2>

      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        {[
          {
            num: "01",
            title: "Controle financeiro",
            desc: "Saiba exatamente quanto ganha e quanto gasta. A taxa de poupança é o indicador mais importante."
          },
          {
            num: "02",
            title: "Aportes consistentes",
            desc: "Invista regularmente, independentemente do valor. A consistência supera a quantidade."
          },
          {
            num: "03",
            title: "Rendimentos compostos",
            desc: "Reinvinda seus rendimentos. Os juros compostos são o oitavo maravilho do mundo financeiro."
          },
          {
            num: "04",
            title: "Diversificação",
            desc: "Não coloque todos os ovos em uma cesta. Distribua seus investimentos entre diferentes classes de ativos."
          },
          {
            num: "05",
            title: "Paciência e disciplina",
            desc: "Independência financeira não acontece da noite para o dia. É uma marathon, não um sprint."
          }
        ].map((pilar) => (
          <div
            key={pilar.num}
            style={{
              display: "flex",
              gap: 14,
              border: "1px solid #d6e6dc",
              borderRadius: 8,
              background: "var(--verde-claro-bg)",
              padding: 16
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--verde-medio)",
                flexShrink: 0
              }}
            >
              {pilar.num}
            </span>
            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: 14,
                  color: "var(--verde-escuro)",
                  marginBottom: 4
                }}
              >
                {pilar.title}
              </strong>
              <span
                style={{
                  fontSize: 13.5,
                  color: "var(--text-muted)",
                  lineHeight: 1.5
                }}
              >
                {pilar.desc}
              </span>
            </div>
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
        Quanto falta para sua independência financeira?
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 16
        }}
      >
        A resposta depende da sua situação atual: patrimônio investido, aportes
        mensais, rentabilidade esperada e renda desejada. O simulador da Fincare
        calcula tudo isso em menos de 1 minuto e ainda gera um plano
        personalizado em PDF.
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
          marginBottom: 32,
          transition: "background 0.15s"
        }}
      >
        Descubra quanto falta para sua independência →
      </Link>

      <FAQSection items={faqItems} />
    </ContentLayout>
  )
}
