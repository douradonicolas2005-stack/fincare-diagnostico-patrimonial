import type { Metadata } from "next"
import { CardGenerator } from "./CardGenerator"

// Ferramenta interna: gera o link/imagem do card de diagnóstico para envio no
// WhatsApp. Fora do índice de busca — não é uma página pública do produto.
export const metadata: Metadata = {
  title: "Gerar card de diagnóstico — uso interno",
  robots: { index: false, follow: false }
}

export default function GerarCardPage() {
  return <CardGenerator />
}
