import type { Metadata } from "next"
import Simulator from "@/components/simulator/Simulator"

export const metadata: Metadata = {
  title: "Diagnóstico Patrimonial Gratuito",
  description:
    "Simule sua trajetória patrimonial em 1 minuto. Descubra seu Score Patrimonial, quanto falta para a independência financeira e receba um plano personalizado em PDF.",
  keywords: [
    "diagnóstico patrimonial",
    "score patrimonial",
    "simulador investimentos",
    "independência financeira simulador",
    "quanto falta para me aposentar"
  ],
  alternates: {
    canonical: "https://fincarescorepatrimonial.com.br/diagnostico"
  },
  openGraph: {
    title: "Diagnóstico Patrimonial Gratuito | Fincare Investimentos",
    description:
      "Simule sua trajetória patrimonial em 1 minuto e receba um plano personalizado em PDF.",
    url: "https://fincarescorepatrimonial.com.br/diagnostico",
    type: "website"
  }
}

export default function DiagnosisPage() {
  return <Simulator />
}
