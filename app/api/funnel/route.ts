import { forwardFunnel } from "@/lib/server/integrations"
import { clientIp, readJson, RequestSizeError } from "@/lib/server/http"
import { rateLimit } from "@/lib/security"
import { NextRequest, NextResponse } from "next/server"

const allowedEvents = new Set(["etapa_1", "etapa_2", "etapa_3", "etapa_4", "etapa_5"])

export async function POST(request: NextRequest) {
  if (!rateLimit(`funnel:${clientIp(request)}`, 30, 600)) return NextResponse.json({ ok: false }, { status: 429 })
  try {
    const body = await readJson<Record<string, unknown>>(request, 5_000)
    if (typeof body.evento !== "string" || !allowedEvents.has(body.evento)) return NextResponse.json({ ok: false }, { status: 400 })
    const ok = await forwardFunnel({ evento: body.evento, utm_source: String(body.utm_source || "").slice(0, 150), utm_campaign: String(body.utm_campaign || "").slice(0, 150), utm_medium: String(body.utm_medium || "").slice(0, 150), utm_content: String(body.utm_content || "").slice(0, 150) })
    return NextResponse.json({ ok }, { status: ok ? 200 : 502 })
  } catch (error) {
    const status = error instanceof RequestSizeError ? 413 : 400
    return NextResponse.json({ ok: false }, { status })
  }
}
