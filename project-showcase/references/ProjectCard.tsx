"use client"

// Featured project card for the homepage grid: 16:9 image, title, 3-line description,
// a status badge, tech chips and GitHub / demo / case-study links.
import { useState } from "react"
import Image from "next/image"
import { ExternalLink, FileText } from "lucide-react"
import type { FeaturedProject } from "./project-types"

const linkButton =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

function GitHubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export default function ProjectCard({ project }: { project: FeaturedProject }) {
  const [imageError, setImageError] = useState(false)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-background transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg hover:shadow-foreground/5 motion-reduce:hover:translate-y-0">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {!imageError ? (
          <Image
            src={project.image}
            alt={`${project.title} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-foreground/40">Image not available</div>
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-4 p-5">
        <h3 className="line-clamp-1 text-lg font-semibold tracking-tight">{project.title}</h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-foreground/70">{project.description}</p>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 motion-reduce:animate-none" />
            {project.status}
          </span>
          <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
            {project.tech.map((t) => (
              <li key={t} className="rounded border border-foreground/10 bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/80">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className={linkButton}>
              <GitHubMark /> GitHub
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className={linkButton}>
              <ExternalLink size={14} aria-hidden="true" /> Live demo
            </a>
          )}
          {project.caseStudy && (
            <a href={project.caseStudy} className={linkButton}>
              <FileText size={14} aria-hidden="true" /> Case study
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
