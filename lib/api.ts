import type { FunnelPayload, LeadPayload, PartialLeadPayload } from "./security"

async function post(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    return response.ok
  } catch {
    return false
  }
}

export async function sendLead(payload: LeadPayload & { meta_event_id?: string }): Promise<boolean> {
  return post("/api/leads", payload)
}

// Envio progressivo (um "pedaco" por tela concluida). Fire-and-forget de
// proposito: a pessoa pode fechar a aba logo depois de clicar em "Continuar",
// entao usamos sendBeacon (que o navegador entrega mesmo durante o unload).
// Sem await e sem tratamento de erro na tela - o envio final continua sendo
// o unico com feedback visivel para o usuario.
export function sendPartialLead(payload: PartialLeadPayload): void {
  const body = JSON.stringify(payload)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/leads", new Blob([body], { type: "application/json" }))
    return
  }
  fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {})
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
