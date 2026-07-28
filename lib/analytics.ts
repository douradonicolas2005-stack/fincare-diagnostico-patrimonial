"use client"

import { track as vercelTrack } from "@vercel/analytics"

type AnalyticsParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function trackAnalyticsEvent(
  eventName: string,
  params: AnalyticsParams = {}
): void {
  vercelTrack(eventName, params)

  if (typeof window === "undefined" || !window.gtag) return

  window.gtag("event", eventName, params)
}

export function trackAnalyticsPageView(
  measurementId: string,
  pathname: string,
  searchParams: string
): void {
  const pagePath = searchParams ? `${pathname}?${searchParams}` : pathname

  if (typeof window === "undefined" || !window.gtag) return

  window.gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: pagePath,
    page_title: document.title,
    send_to: measurementId
  })
}
