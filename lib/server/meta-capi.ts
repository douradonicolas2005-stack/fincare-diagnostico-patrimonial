import { createHash } from "node:crypto"

// Conversions API (server-side) do mesmo evento "Lead" que o Pixel já dispara
// no navegador (components/analytics + lib/meta-pixel.ts). Sem isto, bloqueio
// de cookies/ITP e Safari/iOS fazem o Meta perder uma fração real dos eventos
// de conversão — o algoritmo de otimização do anúncio acaba decidindo com
// menos sinal do que existe de verdade. event_id precisa ser o mesmo enviado
// pelo fbq('track', ...) do navegador para o Meta deduplicar os dois lados
// como um único evento, não contar em dobro.
const GRAPH_API_VERSION = "v21.0"

function sha256(valor: string): string {
  return createHash("sha256").update(valor.trim().toLowerCase()).digest("hex")
}

function telefoneComCodigoPais(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "")
  return digitos.startsWith("55") ? digitos : `55${digitos}`
}

type EnviarEventoLeadParams = {
  eventId: string
  eventSourceUrl: string
  clientIp: string
  userAgent: string
  email: string
  telefone: string
  fbp?: string
  fbc?: string
}

export async function enviarEventoLeadMetaCapi(params: EnviarEventoLeadParams): Promise<boolean> {
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  if (!pixelId || !accessToken) return false

  const userData: Record<string, unknown> = {
    em: [sha256(params.email)],
    ph: [sha256(telefoneComCodigoPais(params.telefone))],
    client_ip_address: params.clientIp,
    client_user_agent: params.userAgent
  }
  if (params.fbp) userData.fbp = params.fbp
  if (params.fbc) userData.fbc = params.fbc

  try {
    const resposta = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              event_id: params.eventId,
              action_source: "website",
              event_source_url: params.eventSourceUrl,
              user_data: userData
            }
          ]
        }),
        cache: "no-store"
      }
    )
    return resposta.ok
  } catch {
    return false
  }
}
