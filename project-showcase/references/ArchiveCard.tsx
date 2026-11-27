"use client"

// Editorial archive card (the /projects page): year / index, serif italic title, mono subtitle,
// tag pill with a pulsing accent dot, "View live" + "View details" pills, description,
// thumbnail, features + stack in two columns, and a collapsible architecture tree.
import { useId, useState, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Project } from "./project-types"

function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60">{children}</h3>
}

const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-all duration-200"

export default function ArchiveCard({ project }: { project: Project }) {
  const { year, index, title, subtitle, slug, href, thumbnail, description, features, stack, future, architecture, accent, tag } = project
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-foreground/20 bg-background/70 backdrop-blur-xl transition-all duration-500 hover:border-foreground/30 hover:bg-background/90">
      {/* accent edge on hover */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: accent }}
      />

      <div className="p-8 md:p-10">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-3 font-mono text-[11px]">
              <span className="uppercase tracking-widest text-foreground/60">{year}</span>
              <span className="text-foreground/40">/ {index}</span>
            </div>
            <Link href={`/projects/${slug}`}>
              <h2 className="mb-1 font-serif text-3xl font-normal leading-none tracking-tight text-foreground transition-colors hover:text-foreground/80 md:text-4xl">
                {title}
              </h2>
            </Link>
            <p className="font-mono text-sm tracking-wide text-foreground/60">{subtitle}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
            <span className={`${pill} border-foreground/20 tracking-[0.2em] text-foreground/60`}>
              {tag === "Live" && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full motion-reduce:animate-none" style={{ background: accent }} />
              )}
              {tag}
            </span>
            {href && (
              <a href={href} target="_blank" rel="noopener noreferrer" className={`${pill} border-transparent text-foreground/60 hover:border-foreground/30 hover:text-foreground`}>
                View live ↗
              </a>
            )}
            <Link href={`/projects/${slug}`} className={`${pill} border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground`}>
              View details →
            </Link>
          </div>
        </div>

        <p className="mb-8 max-w-2xl text-[15px] leading-8 text-foreground/70">{description}</p>

        {thumbnail && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl border border-foreground/20">
            <Image src={thumbnail} alt={`${title} screenshot`} fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
          </div>
        )}

        <div className="mb-8 h-px bg-foreground/10" />

        <div className="mb-8 grid gap-8 md:grid-cols-2">
          <div>
            <SectionLabel>Features</SectionLabel>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f.label} className="flex gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                  <div>
                    <span className="text-sm font-medium text-foreground">{f.label}</span>
                    <p className="mt-0.5 text-xs leading-5 text-foreground/60">{f.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionLabel>Tech Stack</SectionLabel>
            <ul className="flex flex-wrap gap-2">
              {stack.map((t) => (
                <li key={t} className="rounded-full border border-foreground/20 bg-background/30 px-3 py-1 text-xs text-foreground/60">
                  {t}
                </li>
              ))}
            </ul>
            {future && (
              <div className="mt-6">
                <SectionLabel>Future Scope</SectionLabel>
                <p className="text-xs leading-6 text-foreground/60">{future}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible architecture: grid-rows 0fr → 1fr animates to the content's real height */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-foreground"
        >
          <span aria-hidden="true" className={`inline-block transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
            ›
          </span>
          Architecture
        </button>
        <div
          id={panelId}
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out motion-reduce:transition-none ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden" inert={!open}>
            <div className="overflow-x-auto rounded-xl border border-foreground/20 bg-background/50 p-5 font-mono text-[11px] leading-relaxed text-foreground/60">
              <pre className="whitespace-pre">{architecture}</pre>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
