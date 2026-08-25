import type { MetadataRoute } from "next"

const BASE_URL = "https://fincarescorepatrimonial.com.br"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0
    },
    {
      url: `${BASE_URL}/diagnostico`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9
    },
    {
      url: `${BASE_URL}/o-que-e-independencia-financeira`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${BASE_URL}/quanto-preciso-para-aposentar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${BASE_URL}/renda-passiva-como-calcular`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${BASE_URL}/tabela-de-aportes-para-aposentadoria`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${BASE_URL}/privacidade`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2
    }
  ]
}
