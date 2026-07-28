import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { MetaPixel } from "@/components/analytics/MetaPixel"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://fincarescorepatrimonial.com.br"),
  title: "Diagnóstico Patrimonial | Fincare Investimentos",
  description:
    "Simule sua trajetória patrimonial e descubra caminhos para alcançar seus objetivos.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Descubra em 1 minuto quanto falta para seu objetivo",
    description:
      "Diagnóstico patrimonial gratuito, com metodologia de Wealth Management, da Fincare Investimentos.",
    url: "https://fincarescorepatrimonial.com.br",
    siteName: "Fincare Investimentos",
    images: ["/logo-fincare.png"],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Descubra em 1 minuto quanto falta para seu objetivo",
    description:
      "Diagnóstico patrimonial gratuito, com metodologia de Wealth Management, da Fincare Investimentos.",
    images: ["/logo-fincare.png"]
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
