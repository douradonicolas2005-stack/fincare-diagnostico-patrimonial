declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function trackMetaPixelEvent(event: string, eventId?: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    // eventID (mesmo valor mandado à Conversions API server-side em
    // app/api/leads/route.ts) permite o Meta deduplicar Pixel + CAPI como um
    // único evento em vez de contar a mesma conversão duas vezes.
    if (eventId) {
      window.fbq("track", event, {}, { eventID: eventId })
    } else {
      window.fbq("track", event)
    }
  }
}
