// Small building blocks used across willx.tech. Tailwind 3 + shadcn tokens.
import Link from "next/link"
import { ArrowRight } from "lucide-react"

/* ─── Section header: title + muted subtitle ─────────────────── */
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>}
    </div>
  )
}

/* ─── Eyebrow + big heading (projects, archive) ──────────────── */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{children}</p>
}

/* ─── Link with an underline that grows on hover ─────────────── */
const isExternal = (href: string) => href.startsWith("http") || href.startsWith("mailto")

export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const ext = isExternal(href)
  return (
    <a
      href={href}
      target={ext ? "_blank" : undefined}
      rel={ext ? "noopener noreferrer" : undefined}
      className="relative text-foreground after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full focus-visible:after:w-full"
    >
      {children}
    </a>
  )
}

export function SocialLink({ href, label }: { href: string; label: string }) {
  const ext = isExternal(href)
  return (
    <a
      href={href}
      target={ext ? "_blank" : undefined}
      rel={ext ? "noopener noreferrer" : undefined}
      className="relative text-foreground/70 transition hover:text-foreground after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full"
    >
      {label}
    </a>
  )
}

/* ─── Timeline item (experience, certifications) ─────────────── */
export function TimelineItem({
  title,
  meta,
  desc,
  isLast = false,
}: {
  title: string
  meta: React.ReactNode
  desc: string
  isLast?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className="relative flex w-6 shrink-0 flex-col items-center">
        {!isLast && (
          <div aria-hidden="true" className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-foreground/20" />
        )}
        <div className="relative z-10 mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60" />
      </div>
      <div className="flex flex-1 flex-col gap-1 pb-8">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-foreground/60">{meta}</p>
        <p className="text-sm leading-relaxed text-foreground/70">{desc}</p>
      </div>
    </div>
  )
}

/* ─── Floating nav pill (top-right) ──────────────────────────── */
export function NavPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-full border border-border bg-background/70 px-5 py-2.5 shadow-lg shadow-black/10 ring-1 ring-blue-400/30 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:ring-blue-400/60 active:scale-95 dark:shadow-black/40"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <ArrowRight size={16} className="text-foreground" />
    </Link>
  )
}

/* ─── Pill badge (tags, status) ──────────────────────────────── */
export function Pill({ children, dot }: { children: React.ReactNode; dot?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
      {dot && <span className="h-1.5 w-1.5 rounded-full animate-pulse motion-reduce:animate-none" style={{ background: dot }} />}
      {children}
    </span>
  )
}

/* ─── Hover-lift card shell ──────────────────────────────────── */
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-background transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg hover:shadow-foreground/5 motion-reduce:hover:translate-y-0">
      {children}
    </article>
  )
}

/* ─── Ambient glow behind long pages ─────────────────────────── */
export function AmbientGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute left-[10%] top-[-20%] h-[600px] w-[600px] rounded-full bg-foreground/5 blur-[120px]" />
      <div className="absolute bottom-[10%] right-[5%] h-[400px] w-[400px] rounded-full bg-foreground/[0.03] blur-[100px]" />
    </div>
  )
}

/* ─── Film grain overlay ─────────────────────────────────────── */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

export function Grain({ opacity = 0.22 }: { opacity?: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-multiply"
      style={{ backgroundImage: GRAIN, opacity }}
    />
  )
}
