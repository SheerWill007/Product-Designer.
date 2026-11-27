// Project data model (lib/projects/types.ts) + one example entry.
// One file per project: lib/projects/NN-slug.ts, re-exported in order from lib/projects/index.ts.

export interface Project {
  year: string // "2026"
  index: string // "02", position in the archive
  title: string
  subtitle: string // one line: what it is
  slug: string // URL: /projects/<slug>
  href: string | null // live site, if any
  github?: string
  thumbnail?: string // 16:9 image in public/projects/
  description: string // 2–3 sentences: what it does and why it matters
  features: { label: string; detail: string }[] // 4–6
  stack: string[]
  future?: string
  architecture: string // folder tree or ASCII diagram, shown in a <pre>
  accent: string // hex used for the hover edge and the "Live" dot
  tag: "Live" | "In progress" | "Archived" | string
  detailedContent: {
    overview: string
    challenges: string[]
    solutions: string[]
    learnings: string[]
  }
}

/** Smaller shape for the homepage "featured" grid (data/featured-projects.ts). */
export interface FeaturedProject {
  id: string
  title: string
  description: string
  image: string
  tech: string[]
  status: string
  github?: string
  demo?: string
  caseStudy?: string
}

export const example: Project = {
  year: "2026",
  index: "01",
  title: "Example App",
  subtitle: "One line about what it is",
  slug: "example-app",
  href: "https://example.com",
  github: "https://github.com/<user>/example-app",
  thumbnail: "/projects/example-app.png",
  description:
    "What it does, who it's for and the hardest technical thing in it, in two or three sentences. Lead with the outcome, not the stack.",
  features: [
    { label: "Headline feature", detail: "What it does and how, in one sentence with one concrete number if possible." },
    { label: "Second feature", detail: "Keep each detail to a single line in the card." },
  ],
  stack: ["Next.js", "TypeScript", "PostgreSQL"],
  future: "What's next, in one sentence.",
  architecture: `example-app/
├── app/          # Next.js App Router
├── components/   # UI
└── lib/          # data + utils`,
  accent: "#4c6fff",
  tag: "Live",
  detailedContent: {
    overview: "A paragraph for the case-study page.",
    challenges: ["The real problem, stated plainly."],
    solutions: ["What was built to solve it, and why that approach."],
    learnings: ["What changed in how you build things."],
  },
}

/*
 * lib/projects/index.ts
 *   import { example } from "./01-example-app"
 *   export const projects = [example, …]
 */
