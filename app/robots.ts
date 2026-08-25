import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/gerar-card"]
      }
    ],
    sitemap: "https://fincarescorepatrimonial.com.br/sitemap.xml"
  }
}
