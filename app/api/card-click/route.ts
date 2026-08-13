import { track } from "@vercel/analytics/server"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// Rastreio de clique do card de WhatsApp. O link rastreável (gerado em
// /gerar-card) aponta para cá; registramos um evento `card_click` com a
// variante (completo/gancho) no Vercel Analytics e redirecionamos o lead
// para o destino. Serve para comparar qual variante atrai mais cliques.

// Destinos permitidos além do próprio site — evita open redirect.
const ALLOWED_HOSTS = new Set([
  "fincarescorepatrimonial.com.br",
  "wa.me",
  "api.whatsapp.com"
])

function resolveDestination(req: NextRequest, to: string | null): string {
  const origin = new URL(req.url).origin
  if (!to) return `${origin}/` // default: simulador completo
  if (to.startsWith("/")) return `${origin}${to}`
  try {
    const u = new URL(to)
    if (
      (u.protocol === "https:" || u.protocol === "http:") &&
      ALLOWED_HOSTS.has(u.hostname)
    ) {
      return u.toString()
    }
  } catch {
    /* URL inválida — cai no default abaixo */
  }
  return `${origin}/`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const v = (searchParams.get("v") || "").toLowerCase()
  const variant = v === "gancho" || v === "b" ? "gancho" : "completo"
  const destination = resolveDestination(req, searchParams.get("to"))

  try {
    await track("card_click", { variant })
  } catch {
    // Nunca deixar uma falha de analytics quebrar o redirecionamento do lead.
  }

  return NextResponse.redirect(destination, 302)
}
