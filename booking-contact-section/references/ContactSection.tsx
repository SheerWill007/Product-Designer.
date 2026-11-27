"use client"

// "Let's talk" section: left = reasons to reach out, right = a booking card with avatar,
// a "Book a call" pill and rotating quotes. Tailwind + shadcn tokens, no other dependencies.
// For an on-page popup instead of a new tab, render <CalPopupButton> (CalBooking.tsx) as the CTA.
import { useEffect, useState } from "react"

interface Reason {
  /** Tailwind text colour for the title, e.g. "text-sky-400" */
  color: string
  title: string
  body: string
  /** Link for this reason; defaults to the booking link */
  href?: string
}

const DEFAULT_REASONS: Reason[] = [
  { color: "text-sky-400", title: "Want to bounce ideas?", body: "Let's jump on a quick call and explore what's possible." },
  { color: "text-emerald-400", title: "Looking to build something bigger?", body: "I can connect you with the right team and resources." },
  { color: "text-orange-400", title: "In town?", body: "Perfect! Let's grab a coffee and brainstorm in person." },
]

const DEFAULT_QUOTES = [
  "Good design is as little design as possible.",
  "Move fast. Ship things people actually want.",
  "The details are not the details. They make the design.",
]

export default function ContactSection({
  bookingUrl,
  email,
  avatarUrl,
  eyebrow = "Start here",
  headline = "Let's hop on a quick call and see if we've got the ",
  headlineEmphasis = "right chemistry",
  reasons = DEFAULT_REASONS,
  quotes = DEFAULT_QUOTES,
  ctaHeading = "Ready to chat?",
  ctaBody = "Book a free 30-minute call to shape your idea and start working together.",
  ctaLabel = "Book a free call",
}: {
  /** e.g. https://cal.com/<username>/30min */
  bookingUrl: string
  email?: string
  avatarUrl?: string
  eyebrow?: string
  headline?: string
  headlineEmphasis?: string
  reasons?: Reason[]
  quotes?: string[]
  ctaHeading?: string
  ctaBody?: string
  ctaLabel?: string
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Rotate quotes every 4.5s; hold while hovered/focused, and not at all with reduced motion.
  useEffect(() => {
    if (quotes.length <= 1 || paused) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setActive((i) => (i + 1) % quotes.length), 4500)
    return () => clearInterval(id)
  }, [quotes.length, paused])

  const external = (href: string) => href.startsWith("http")

  return (
    <section className="w-full bg-background px-4 py-16 sm:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Reasons */}
        <div className="rounded-2xl border border-border bg-muted/30 p-8 sm:p-10 dark:bg-neutral-900">
          <p className="mb-3 text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <h2 className="mb-8 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {headline}
            <em className="italic">{headlineEmphasis}</em>.
          </h2>
          <div className="space-y-7">
            {reasons.map((r) => {
              const href = r.href ?? bookingUrl
              return (
                <a
                  key={r.title}
                  href={href}
                  target={external(href) ? "_blank" : undefined}
                  rel={external(href) ? "noopener noreferrer" : undefined}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <h3 className={`mb-1 text-lg font-semibold ${r.color}`}>{r.title}</h3>
                  <p className="text-muted-foreground transition-colors group-hover:text-foreground">{r.body}</p>
                </a>
              )
            })}
          </div>
        </div>

        {/* Booking card */}
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-8 text-center sm:p-10"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-dashed border-muted-foreground/50">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden="true" className="text-xl text-muted-foreground">☏</span>
            )}
          </div>

          <h3 className="mb-3 text-xl font-semibold text-foreground">{ctaHeading}</h3>
          <p className="mb-6 max-w-xs text-muted-foreground">{ctaBody}</p>

          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            {avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
            )}
            <span className="text-muted-foreground">+ You</span>
            <span className="ml-2">{ctaLabel}</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          {email && (
            <a href={`mailto:${email}`} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              or email {email}
            </a>
          )}

          {quotes.length > 0 && (
            <div className="mt-8 w-full border-t border-border pt-6">
              <p className="min-h-[2.5rem] text-sm italic text-muted-foreground">&ldquo;{quotes[active]}&rdquo;</p>
              {quotes.length > 1 && (
                <div className="mt-4 flex justify-center gap-1.5">
                  {quotes.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Show quote ${i + 1}`}
                      aria-current={i === active}
                      onClick={() => setActive(i)}
                      // 6px dot, 24px hit area
                      className="relative grid h-6 w-6 place-items-center before:h-1.5 before:w-1.5 before:rounded-full before:bg-muted before:transition-colors before:content-[''] aria-[current=true]:before:bg-foreground"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
