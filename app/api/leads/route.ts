import { leadSchema } from "@/lib/security"
import { forwardLead } from "@/lib/server/integrations"
import { clientIp, readJson, RequestSizeError } from "@/lib/server/http"
import { enviarEventoLeadMetaCapi } from "@/lib/server/meta-capi"
import { rateLimit } from "@/lib/security"
import { NextRequest, NextResponse } from "next/server"

const MAX_PAYLOAD_BYTES = 50_000
const ORIGEM_PADRAO = "https://fincarescorepatrimonial.com.br"

export async function POST(request: NextRequest) {
  if (!rateLimit(`ip:${clientIp(request)}`)) return NextResponse.json({ ok: false, error: "limite de tentativas atingido" }, { status: 429 })
  try {
    const body = await readJson<Record<string, unknown>>(request, MAX_PAYLOAD_BYTES)
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success || parsed.data.honeypot) return NextResponse.json({ ok: false, error: "dados inválidos" }, { status: 400 })
    if (!rateLimit(`email:${parsed.data.email.toLowerCase()}`)) return NextResponse.json({ ok: false, error: "limite de envios atingido" }, { status: 429 })
    const ok = await forwardLead(parsed.data)
    const metaEventId = typeof body.meta_event_id === "string" ? body.meta_event_id : undefined
    if (ok && metaEventId) {
      await enviarEventoLeadMetaCapi({
        eventId: metaEventId,
        eventSourceUrl: request.headers.get("referer") || ORIGEM_PADRAO,
        clientIp: clientIp(request),
        userAgent: request.headers.get("user-agent") || "",
        email: parsed.data.email,
        telefone: parsed.data.telefone,
        fbp: request.cookies.get("_fbp")?.value,
        fbc: request.cookies.get("_fbc")?.value
      })
    }
    return NextResponse.json({ ok, accepted: true }, { status: ok ? 200 : 502 })
  } catch (error) {
    const status = error instanceof RequestSizeError ? 413 : 400
    const message = error instanceof RequestSizeError ? "payload muito grande" : "requisição inválida"
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
