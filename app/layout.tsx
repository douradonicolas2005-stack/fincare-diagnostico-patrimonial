import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { MetaPixel } from "@/components/analytics/MetaPixel"

import "./globals.css"

export const metadata: Metadata = {
  title: "Diagnóstico Patrimonial | Fincare Investimentos",
  description:
    "Simule sua trajetória patrimonial e descubra caminhos para alcançar seus objetivos.",
  icons: { icon: "/favicon.ico" }
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
