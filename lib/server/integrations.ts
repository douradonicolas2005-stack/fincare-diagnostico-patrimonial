import type {
  FunnelPayload,
  LeadPayload,
  PartialLeadPayload
} from "../security"

type RequestJob = Promise<boolean>

// Timeout curto o bastante pra nao segurar a function inteira caso o Apps
// Script (que tem cold start e lock proprio, ver LockService no .gs) trave -
// assim o outro destino (Formspree) ainda tem tempo de responder dentro do
// limite de execucao da Vercel, em vez do fetch travado derrubar tudo.
const REQUEST_TIMEOUT_MS = 8_000

// O Apps Script SEMPRE responde HTTP 200 - inclusive quando rejeita o
// payload ({"ok":false,"erro":"email invalido"}) e quando a implantacao esta
// sem autorizacao (devolve uma pagina HTML de login). Checar so response.ok
// dava falso positivo: o lead era dado como recebido e nao chegava em lugar
// nenhum. Por isso o corpo e inspecionado.
async function post(
  url: string,
  body: unknown,
  contentType = "application/json"
): Promise<boolean> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": contentType, Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  })

  if (!response.ok) return false

  const texto = (await response.text()).trim()
  if (!texto) return true

  // Pagina de login/permissao do Google: 200, mas nao gravou nada.
  if (texto.startsWith("<")) return false

  try {
    const json = JSON.parse(texto)
    if (json && typeof json === "object" && "ok" in json) return json.ok === true
    return true
  } catch {
    return true
  }
}

function configured(name: string): string | undefined {
  return process.env[name]
}

// Envio progressivo: o parcial vai SO para a planilha. O Formspree gratuito
// tem cota de 50 submissoes por mes e cada lead gera ate 6 parciais - mandar
// os dois lados esgotaria a cota com menos de 10 leads. A planilha ja e o
// destino "de trabalho" (onde o time olha os leads); o Formspree continua
// recebendo apenas o envio completo, como notificacao.
export async function forwardLead(
  payload: LeadPayload | PartialLeadPayload
): Promise<boolean> {
  const parcial = "parcial" in payload && payload.parcial === true
  const formspreeUrl = parcial ? undefined : configured("FORMSPREE_ENDPOINT")
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
    result => result.status === "fulfilled" && result.value === true
  )
}

export async function forwardFunnelEvent(
  payload: FunnelPayload
): Promise<boolean> {
  const sheetsUrl = configured("GOOGLE_SHEETS_WEBHOOK_URL")
  const token = configured("GOOGLE_SHEETS_WEBHOOK_TOKEN")

  if (!sheetsUrl || !token) return false

  return post(
    sheetsUrl,
    { ...payload, tipo: "funil", webhook_token: token },
    "text/plain;charset=utf-8"
  )
}
