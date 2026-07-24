declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function trackMetaPixelEvent(event: string): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event)
  }
}
