import type { Metadata } from "next"

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
      <body>{children}</body>
    </html>
  )
}
