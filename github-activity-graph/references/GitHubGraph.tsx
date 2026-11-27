"use client"

// GitHub contribution heatmap for the last year, styled with theme tokens (--gh-0 … --gh-4).
// Data: https://github-contributions-api.jogruber.de/v4/<user>?y=last (public, cached 1h by the API).
// On narrow screens the grid scrolls sideways and starts scrolled to the latest week.
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react"

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
type ApiResponse = { total: Record<string, number>; contributions: Day[] }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const CELL = 11
const GAP = 3

/** "2025-01-08" → local date at noon, so time zones can't shift it to another day. */
function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d, 12)
}

const label = (s: string) =>
  parseDate(s).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

export default function GitHubGraph({
  username,
  title = "GitHub Activity",
  subtitle = "My contribution graph, live from GitHub",
}: {
  username: string
  title?: string
  subtitle?: string
}) {
  const [days, setDays] = useState<Day[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [hovered, setHovered] = useState<{ day: Day; x: number; y: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ApiResponse>) : Promise.reject(r.status)))
      .then((json) => setDays([...json.contributions].sort((a, b) => a.date.localeCompare(b.date))))
      .catch((err) => {
        if (!ctrl.signal.aborted) {
          console.error(err)
          setFailed(true)
        }
      })
    return () => ctrl.abort()
  }, [username])

  // Columns of 7 (Sun–Sat), padded so the first day lands on its real weekday row.
  const weeks = useMemo(() => {
    if (!days?.length) return []
    const padded: (Day | null)[] = [...Array(parseDate(days[0].date).getDay()).fill(null), ...days]
    const out: (Day | null)[][] = []
    for (let i = 0; i < padded.length; i += 7) out.push(padded.slice(i, i + 7))
    return out
  }, [days])

  const total = useMemo(() => days?.reduce((sum, d) => sum + d.count, 0) ?? 0, [days])

  // Start scrolled to the most recent weeks on small screens.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [weeks.length])

  const onEnter = (e: MouseEvent<HTMLDivElement>, day: Day) => {
    const cell = e.currentTarget.getBoundingClientRect()
    const wrap = wrapRef.current?.getBoundingClientRect()
    if (!wrap) return
    setHovered({ day, x: cell.left - wrap.left + cell.width / 2, y: cell.top - wrap.top })
  }

  const gridWidth = weeks.length * (CELL + GAP)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-foreground/50">{subtitle}</p>
      </div>

      <div ref={wrapRef} className="relative">
        <div ref={scrollRef} className="overflow-x-auto pb-1" data-lenis-prevent>
          {/* Fixed height while loading, so the page doesn't jump */}
          <div
            role="img"
            aria-label={days ? `${total.toLocaleString()} GitHub contributions in the last year` : "Loading GitHub contributions"}
            className="relative select-none"
            style={{ width: gridWidth || "100%", minHeight: 7 * (CELL + GAP) + 28 }}
          >
            {/* Month labels */}
            <div aria-hidden="true" className="relative mb-2 h-5">
              {weeks.map((week, i) => {
                const first = week.find(Boolean)
                const prev = i > 0 ? weeks[i - 1].find(Boolean) : null
                if (!first) return null
                const month = parseDate(first.date).getMonth()
                if (prev && parseDate(prev.date).getMonth() === month) return null
                return (
                  <span key={i} className="absolute text-[11px] text-foreground/40" style={{ left: i * (CELL + GAP) }}>
                    {MONTHS[month]}
                  </span>
                )
              })}
            </div>

            {/* Cells */}
            <div aria-hidden="true" className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                  {Array.from({ length: 7 }, (_, di) => {
                    const day = week[di] ?? null
                    return (
                      <div
                        key={di}
                        onMouseEnter={day ? (e) => onEnter(e, day) : undefined}
                        onMouseLeave={() => setHovered(null)}
                        className="relative rounded-[2px] transition-transform duration-150 hover:z-10 hover:scale-125 motion-reduce:transition-none"
                        style={{
                          width: CELL,
                          height: CELL,
                          backgroundColor: day ? `var(--gh-${day.level})` : "transparent",
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {!days && !failed && <div className="absolute inset-x-0 bottom-0 top-7 animate-pulse rounded-md bg-foreground/5" />}
          </div>
        </div>

        {hovered && (
          <div
            className="pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-[11px] text-foreground shadow-xl"
            style={{ left: hovered.x, top: hovered.y - 44, transform: "translateX(-50%)" }}
          >
            <span className="font-semibold">{hovered.day.count}</span> contribution{hovered.day.count !== 1 ? "s" : ""} on{" "}
            <span className="font-semibold">{label(hovered.day.date)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-foreground/70">
        <p>
          {failed
            ? "Couldn't load contributions right now."
            : days
              ? `${total.toLocaleString()} activities in the last year`
              : "Loading…"}
        </p>
        <div aria-hidden="true" className="flex items-center gap-2">
          <span className="text-xs">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: `var(--gh-${lvl})` }} />
            ))}
          </div>
          <span className="text-xs">More</span>
        </div>
      </div>
    </section>
  )
}
