"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { trackAnalyticsPageView } from "@/lib/analytics"

type GoogleAnalyticsTrackerProps = {
  measurementId: string
}

export function GoogleAnalyticsTracker({
  measurementId
}: GoogleAnalyticsTrackerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return

    trackAnalyticsPageView(
      measurementId,
      pathname,
      searchParams.toString()
    )
  }, [measurementId, pathname, searchParams])

  return null
}
