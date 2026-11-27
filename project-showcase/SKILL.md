---
name: project-showcase
description: Present projects on a portfolio. Covers typed project data (one file per project), featured project cards with image, status, tech chips and links, an editorial archive page with collapsible architecture trees, and case-study pages (overview, features, challenges and solutions, architecture, stack, learnings) with static generation and metadata. Use when adding or restyling a projects or work section, project cards, an archive, portfolio grid or case studies, or when adding a new project to the portfolio data.
---

# Project showcase

willx.tech shows projects in three places:

1. A **featured grid** on the homepage: two columns of cards with staggered reveals and a "View all projects" button.
2. An **archive page**: big editorial cards with a serif title, year and index, a tag pill, features and stack, and a collapsible architecture tree.
3. A **case-study page** per project.

## Data first

- Put each project in its own file `lib/projects/NN-slug.ts` (NN = display order), exporting a typed `Project`. `lib/projects/index.ts` re-exports them as an ordered array.
- The homepage featured list is a separate, smaller `FeaturedProject[]` (`data/featured-projects.ts`), so the homepage can have different copy and images.
- Types and an example entry are in `references/project-types.ts`. Every field has a job. `accent` gives each project its own colour, used only for the hover edge and the Live dot.

## Adding a project (checklist)

1. Copy the example entry to `lib/projects/NN-slug.ts`, and fill in the title, subtitle, description (2–3 sentences, outcome first), 4–6 features and the stack.
2. Add a 16:9 screenshot (~1600×900 WebP/PNG) to `public/projects/`.
3. Pick an `accent` hex that suits the project's own UI.
4. Write the `architecture` tree (folders or a diagram) and the `detailedContent` for the case study (`references/case-study-template.md`).
5. Add it to the barrel in `index.ts` and, if featured, to `featured-projects.ts`.
6. Check the card in both themes, at phone width, and on the case-study route.

## Featured card (`references/ProjectCard.tsx`)

- `rounded-lg border-foreground/10`. On hover: lift `-translate-y-1`, the border goes to /30 and a soft shadow appears. The image zooms to 1.05 over 500ms.
- The 16:9 image uses `next/image` with `sizes`, plus a text fallback if it fails to load.
- The title is clamped to 1 line and the description to 3, so cards in a row line up.
- The status badge is green with a pulsing dot. Tech chips are `bg-foreground/5 border-foreground/10`.
- Links are small outline buttons (GitHub, Live demo, Case study). External links open in a new tab.
- Grid: `grid-cols-1 md:grid-cols-2 gap-6`, with the stagger reveal from `web-motion`.

## Archive card (`references/ArchiveCard.tsx`)

- A big `rounded-2xl` glassy card (`bg-background/70 backdrop-blur-xl`) with a 3px accent edge that fades in on hover.
- Header: `year / index` in mono, a **serif** title (`text-3xl md:text-4xl`), and a mono subtitle. On the right: the tag pill and the "View live ↗" and "View details →" pills.
- Body: the description, thumbnail, a hairline divider, then Features and Tech Stack in two columns (plus Future Scope).
- **Architecture** collapses with a real `<button aria-expanded aria-controls>`. The panel animates `grid-template-rows: 0fr → 1fr`, which is smoother and more accurate than `max-height: 2000px`.
- The page header is an eyebrow ("Blogs and Projects"), a huge serif italic "Projects", "N works", and a gradient hairline rule. Ambient glow sits behind.

## Case study page

Follow `references/case-study-template.md`: static params, metadata, the hero, challenge and solution pairs, architecture and learnings, and links to the next and previous projects.

## Rules

- Keep data and markup separate: no project copy hard-coded in components.
- One accent per project, used in at most two places.
- Images always reserve space (`fill` + `aspect-video` parent) so there's no layout shift.
- Every card and pill is a real link, has a visible focus state and works by keyboard.

## References

- `references/project-types.ts`: the `Project`, `FeaturedProject` types and an example entry
- `references/ProjectCard.tsx`: the featured grid card
- `references/ArchiveCard.tsx`: the editorial archive card with accessible collapsible architecture
- `references/case-study-template.md`: case-study page structure and writing guidance
