import type { NextRequest } from "next/server"

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
}

export async function readJson<T>(request: NextRequest, maxBytes: number): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") || 0)
  if (contentLength > maxBytes) throw new RequestSizeError()
  return request.json() as Promise<T>
}

export class RequestSizeError extends Error {}
