import { funnelSchema, rateLimit } from "@/lib/security"
import { forwardFunnelEvent } from "@/lib/server/integrations"
import { clientIp, readJson, RequestSizeError } from "@/lib/server/http"
import { NextRequest, NextResponse } from "next/server"

const MAX_PAYLOAD_BYTES = 2_000

export async function POST(request: NextRequest) {
  if (!rateLimit(`funnel-ip:${clientIp(request)}`, 60, 600)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }
  try {
    const body = await readJson<unknown>(request, MAX_PAYLOAD_BYTES)
    const parsed = funnelSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
    const ok = await forwardFunnelEvent(parsed.data)
    return NextResponse.json({ ok }, { status: ok ? 200 : 502 })
  } catch (error) {
    const status = error instanceof RequestSizeError ? 413 : 400
    return NextResponse.json({ ok: false }, { status })
  }
}
