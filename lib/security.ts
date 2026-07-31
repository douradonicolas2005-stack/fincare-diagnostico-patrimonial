import { z } from "zod"

const BR_PHONE_REGEX = /^[1-9][1-9](?:9\d{8}|[2-5]\d{7})$/

export function isValidPhoneBR(value: string) {
  return BR_PHONE_REGEX.test(value.replace(/\D/g, ""))
}

export type LeadPayload = z.infer<typeof leadSchema>

export const leadSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  telefone: z
    .string()
    .trim()
    .min(8)
    .max(30)
    .refine(isValidPhoneBR, { message: "telefone inválido" }),
  email: z.string().trim().email().max(180),
  cidade: z.string().trim().max(100),
  estado: z.string().max(2),
  faixa_patrimonio: z.enum(["ate_500k", "500k_1m", "1m_5m", "5m_mais"]),
  faixa_renda: z.enum(["ate_15k", "15k_40k", "40k_100k", "100k_mais"]),
  instituicao_financeira_atual: z.string().max(120),
  possui_assessor: z.enum(["sim", "nao"]),
  possui_gerente_banco: z.enum(["sim", "nao"]),
  objetivo_financeiro: z.string().max(100),
  consentimento_contato: z.literal(true),
  consentimento_data_hora: z.string().datetime(),
  diagnostico_completo: z.enum(["nao", "sim"]),
  honeypot: z.string().max(0).optional(),
  patrimonio_atual: z.number().nonnegative().max(1e12).optional(),
  aporte_mensal: z.number().nonnegative().max(1e10).optional(),
  renda_desejada: z.number().nonnegative().max(1e10).optional(),
  rentabilidade_esperada: z.number().min(0).max(1).optional(),
  taxa_retirada: z.number().min(0.001).max(1).optional(),
  ["patrimonio_necessario"]: z.number().nonnegative().max(1e14).optional(),
  anos_ate_independencia: z.number().int().nonnegative().nullable().optional(),
  idade_atual: z.number().int().min(0).max(120).optional(),
  patrimonio_projetado_10anos: z.number().nonnegative().optional(),
  anos_cenario_aporte: z.number().int().nonnegative().nullable().optional(),
  anos_cenario_rentabilidade: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),
  score_patrimonial: z.number().min(0).max(100).optional(),
  perfil_investidor: z.string().max(40).optional(),
  perfil_investidor_descricao: z.string().max(500).optional(),
  perfil_investidor_alocacao: z.string().max(2000).optional(),
  diagnostico_avancado_fonte: z.string().max(80).optional(),
  diagnostico_avancado_patrimonio_liquido_adicional: z
    .number()
    .max(1e12)
    .optional(),
  diagnostico_avancado_alocacao_por_classe: z.string().max(3000).optional(),
  data: z.string().datetime(),
  origem_lead: z.string().max(80),
  utm_campaign: z.string().max(150),
  utm_source: z.string().max(150),
  utm_medium: z.string().max(150),
  utm_content: z.string().max(150),
  utm_term: z.string().max(150)
})

export type FunnelPayload = z.infer<typeof funnelSchema>

export const funnelSchema = z.object({
  etapa: z.enum([
    "1_patrimonio",
    "2_aporte",
    "3_renda",
    "4_premissas",
    "5_qualificacao",
    "6_contato",
    "result",
    "final"
  ]),
  utm_source: z.string().max(150),
  utm_medium: z.string().max(150),
  utm_campaign: z.string().max(150),
  utm_content: z.string().max(150),
  utm_term: z.string().max(150)
})

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const buckets = new Map<string, { count: number; expires: number }>()
export function rateLimit(
  key: string,
  max = Number(process.env.RATE_LIMIT_MAX || 8),
  windowSeconds = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 600)
) {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || current.expires <= now) {
    buckets.set(key, { count: 1, expires: now + windowSeconds * 1000 })
    return true
  }
  if (current.count >= max) return false
  current.count++
  return true
}
