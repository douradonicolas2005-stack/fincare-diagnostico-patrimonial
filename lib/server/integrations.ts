import type {
  FunnelPayload,
  LeadPayload,
  PartialLeadPayload
} from "../security"

type RequestJob = Promise<Response>

// Timeout curto o bastante pra nao segurar a function inteira caso o Apps
// Script (que tem cold start e lock proprio, ver LockService no .gs) trave -
// assim o outro destino (Formspree) ainda tem tempo de responder dentro do
// limite de execucao da Vercel, em vez do fetch travado derrubar tudo.
const REQUEST_TIMEOUT_MS = 8_000

function post(
  url: string,
  body: unknown,
  contentType = "application/json"
): RequestJob {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": contentType, Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })
}

function configured(name: string): string | undefined {
  return process.env[name]
}

export async function forwardLead(
  payload: LeadPayload | PartialLeadPayload
): Promise<boolean> {
  const formspreeUrl = configured("FORMSPREE_ENDPOINT")
  const sheetsUrl = configured("GOOGLE_SHEETS_WEBHOOK_URL")
  const token = configured("GOOGLE_SHEETS_WEBHOOK_TOKEN")

  const jobs: RequestJob[] = [
    sheetsUrl && token
      ? post(
          sheetsUrl,
          { ...payload, webhook_token: token },
          "text/plain;charset=utf-8"
        )
      : null,
    formspreeUrl ? post(formspreeUrl, payload) : null
  ].filter((job): job is RequestJob => Boolean(job))

  if (jobs.length === 0) return false

  const results = await Promise.allSettled(jobs)

  return results.some(
    result => result.status === "fulfilled" && result.value.ok
  )
}

export async function forwardFunnelEvent(
  payload: FunnelPayload
): Promise<boolean> {
  const sheetsUrl = configured("GOOGLE_SHEETS_WEBHOOK_URL")
  const token = configured("GOOGLE_SHEETS_WEBHOOK_TOKEN")

  if (!sheetsUrl || !token) return false

  const response = await post(
    sheetsUrl,
    { ...payload, tipo: "funil", webhook_token: token },
    "text/plain;charset=utf-8"
  )

  return response.ok
}
