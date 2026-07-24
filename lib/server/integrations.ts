import type { FunnelPayload, LeadPayload } from "../security"

type RequestJob = Promise<Response>

function post(url: string, body: unknown, contentType = "application/json"): RequestJob {
  return fetch(url, { method: "POST", headers: { "Content-Type": contentType, Accept: "application/json" }, body: JSON.stringify(body), cache: "no-store" })
}

function configured(name: string): string | undefined {
  return process.env[name]
}

export async function forwardLead(payload: LeadPayload): Promise<boolean> {
  const sheetsUrl = configured("GOOGLE_SHEETS_WEBHOOK_URL")
  const token = configured("GOOGLE_SHEETS_WEBHOOK_TOKEN")
  const formspreeUrl = configured("FORMSPREE_ENDPOINT")
  const jobs: RequestJob[] = [
    sheetsUrl && token ? post(sheetsUrl, { ...payload, webhook_token: token }, "text/plain;charset=utf-8") : null,
    formspreeUrl && payload.diagnostico_completo === "sim" ? post(formspreeUrl, payload) : null
  ].filter((job): job is RequestJob => Boolean(job))
  // The report can still be generated when no provider is configured, but the
  // lead cannot be confirmed as registered. The UI mirrors the original flow
  // by showing a warning while keeping the result available.
  if (jobs.length === 0) return false
  const results = await Promise.allSettled(jobs)
  return results.every(result => result.status === "fulfilled" && result.value.ok)
}

export async function forwardFunnelEvent(payload: FunnelPayload): Promise<boolean> {
  const sheetsUrl = configured("GOOGLE_SHEETS_WEBHOOK_URL")
  const token = configured("GOOGLE_SHEETS_WEBHOOK_TOKEN")
  if (!sheetsUrl || !token) return false
  const response = await post(sheetsUrl, { ...payload, tipo: "funil", webhook_token: token }, "text/plain;charset=utf-8")
  return response.ok
}
