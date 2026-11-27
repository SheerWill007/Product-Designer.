"use client"

// cal.com on the page instead of in a new tab. npm i @calcom/embed-react
// calLink is "<username>/<event-slug>", e.g. "yourname/30min" (no https://cal.com/).
import { useEffect, type ReactNode } from "react"
import Cal, { getCalApi } from "@calcom/embed-react"
import { useTheme } from "next-themes"

const NAMESPACE = "30min"

/** Keeps the embed's theme and layout in sync with the site. */
function useCalUi(namespace = NAMESPACE) {
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cal = await getCalApi({ namespace })
      if (cancelled) return
      cal("ui", {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        hideEventTypeDetails: false,
        layout: "month_view",
      })
    })()
    return () => {
      cancelled = true
    }
  }, [namespace, resolvedTheme])
}

/** Button that opens the booking calendar in a popup over the page. */
export function CalPopupButton({
  calLink,
  children = "Book a free call",
  className = "",
}: {
  calLink: string
  children?: ReactNode
  className?: string
}) {
  useCalUi()
  return (
    <button
      type="button"
      data-cal-namespace={NAMESPACE}
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  )
}

/** The calendar inline in the page. Give it a fixed-height box so the page doesn't jump. */
export function CalInline({ calLink }: { calLink: string }) {
  useCalUi()
  return (
    <div className="h-[640px] w-full overflow-hidden rounded-2xl border border-border" data-lenis-prevent>
      <Cal
        namespace={NAMESPACE}
        calLink={calLink}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ layout: "month_view" }}
      />
    </div>
  )
}
