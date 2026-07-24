import type { FunnelPayload, LeadPayload } from "./security"

async function post(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    return response.ok
  } catch {
    return false
  }
}

export async function sendLead(payload: LeadPayload): Promise<boolean> {
  return post("/api/leads", payload)
}

// Fire-and-forget: usa sendBeacon pra sobreviver a troca/fechamento de aba
// (o motivo de a pessoa estar "abandonando" a etapa é justamente esse).
export function sendFunnelEvent(payload: FunnelPayload): void {
  const body = JSON.stringify(payload)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/funnel", new Blob([body], { type: "application/json" }))
    return
  }
  fetch("/api/funnel", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {})
}
