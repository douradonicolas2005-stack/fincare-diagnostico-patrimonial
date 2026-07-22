import type { LeadPayload } from "./security"

type FunnelEvent = "etapa_1" | "etapa_2" | "etapa_3" | "etapa_4" | "etapa_5"
type Utm = Record<string, string>

async function post(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    return response.ok
  } catch {
    return false
  }
}

export function trackFunnel(evento: FunnelEvent, utm: Utm): void {
  void post("/api/funnel", { evento, ...utm })
}

export async function sendLead(payload: LeadPayload): Promise<boolean> {
  return post("/api/leads", payload)
}
