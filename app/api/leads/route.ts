import { computeFit } from "@/lib/fit"
import {
  leadSchema,
  partialLeadSchema,
  rateLimit,
  type PartialLeadPayload
} from "@/lib/security"
import { RequestSizeError, clientIp, readJson } from "@/lib/server/http"
import { forwardLead } from "@/lib/server/integrations"
import { enviarEventoLeadMetaCapi } from "@/lib/server/meta-capi"
import { NextRequest, NextResponse } from "next/server"

const MAX_PAYLOAD_BYTES = 50_000
const ORIGEM_PADRAO = "https://fincarescorepatrimonial.com.br"

// Envio progressivo: ate 6 telas por sessao + reenvios. Cada envio e
// idempotente no Apps Script (mesma linha, merge de campos vazios), entao o
// limite pode ser bem mais folgado que o do lead completo.
const PARTIAL_IP_MAX = 60
const PARTIAL_LEAD_MAX = 40
const PARTIAL_EMAIL_MAX = 20
const PARTIAL_WINDOW_SECONDS = 600

async function handlePartial(
  request: NextRequest,
  body: Record<string, unknown>
): Promise<NextResponse> {
  if (!rateLimit(`partial-ip:${clientIp(request)}`, PARTIAL_IP_MAX, PARTIAL_WINDOW_SECONDS)) {
    return NextResponse.json(
      { ok: false, error: "limite de tentativas atingido" },
      { status: 429 }
    )
  }

  const parsed = partialLeadSchema.safeParse(body)

  if (!parsed.success || parsed.data.honeypot)
    return NextResponse.json(
      { ok: false, error: "dados inválidos" },
      { status: 400 }
    )

  const partial: PartialLeadPayload = parsed.data

  if (
    !rateLimit(
      `partial-lead:${partial.lead_id}`,
      PARTIAL_LEAD_MAX,
      PARTIAL_WINDOW_SECONDS
    )
  )
    return NextResponse.json(
      { ok: false, error: "limite de envios atingido" },
      { status: 429 }
    )

  if (
    partial.email &&
    !rateLimit(
      `partial-email:${partial.email.toLowerCase()}`,
      PARTIAL_EMAIL_MAX,
      PARTIAL_WINDOW_SECONDS
    )
  )
    return NextResponse.json(
      { ok: false, error: "limite de envios atingido" },
      { status: 429 }
    )

  // Parciais nao disparam Conversions API: o evento "Lead" do Meta continua
  // sendo enviado uma unica vez, no envio completo (abaixo). Tambem nao vao
  // para o Formspree - so para a planilha (ver forwardLead).
  const ok = await forwardLead(partial)

  return NextResponse.json(
    { ok, accepted: true, parcial: true },
    { status: ok ? 200 : 502 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJson<Record<string, unknown>>(
      request,
      MAX_PAYLOAD_BYTES
    )

    if (body.parcial === true) return handlePartial(request, body)

    if (!rateLimit(`ip:${clientIp(request)}`)) {
      return NextResponse.json(
        { ok: false, error: "limite de tentativas atingido" },
        { status: 429 }
      )
    }

    const parsed = leadSchema.safeParse(body)

    if (!parsed.success || parsed.data.honeypot)
      return NextResponse.json(
        {
          ok: false,
          error: "dados inválidos"
        },
        { status: 400 }
      )

    if (!rateLimit(`email:${parsed.data.email.toLowerCase()}`))
      return NextResponse.json(
        {
          ok: false,
          error: "limite de envios atingido"
        },
        { status: 429 }
      )

    const enriched = {
      ...parsed.data,
      ...computeFit(parsed.data)
    }

    const ok = await forwardLead(enriched)

    const metaEventId =
      typeof body.meta_event_id === "string" ? body.meta_event_id : undefined

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

    const message =
      error instanceof RequestSizeError
        ? "payload muito grande"
        : "requisição inválida"

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status }
    )
  }
}
