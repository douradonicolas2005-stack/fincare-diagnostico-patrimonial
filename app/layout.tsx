import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { MetaPixel } from "@/components/analytics/MetaPixel"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://fincarescorepatrimonial.com.br"),
  title: {
    default:
      "Simulador de Independência Financeira | Score Patrimonial Gratuito",
    template: "%s | Fincare Investimentos"
  },
  description:
    "Descubra em 1 minuto quanto falta para sua independência financeira. Simulador gratuito com score patrimonial, projeção de aposentadoria e plano personalizado em PDF.",
  keywords: [
    "independência financeira",
    "calculadora aposentadoria",
    "score patrimonial",
    "simulador investimentos",
    "renda passiva",
    "quanto falta para me aposentar",
    "planejamento patrimonial",
    "calculadora de aposentadoria por idade",
    "quanto preciso para me aposentar",
    "Fincare Investimentos"
  ],
  authors: [{ name: "Fincare Investimentos" }],
  creator: "Fincare Investimentos",
  publisher: "Fincare Investimentos",
  formatDetection: { telephone: false },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title:
      "Simulador de Independência Financeira | Score Patrimonial Gratuito",
    description:
      "Descubra em 1 minuto quanto falta para sua independência financeira. Simulador gratuito com score patrimonial, projeção de aposentadoria e plano personalizado em PDF.",
    url: "https://fincarescorepatrimonial.com.br",
    siteName: "Fincare Investimentos",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Simulador de Score Patrimonial Fincare"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Simulador de Independência Financeira | Score Patrimonial Gratuito",
    description:
      "Descubra em 1 minuto quanto falta para sua independência financeira. Simulador gratuito com score patrimonial e plano em PDF.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://fincarescorepatrimonial.com.br"
  }
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <MetaPixel />
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
