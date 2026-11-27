---
name: willx-design-system
description: The visual language of willx.tech, William's portfolio. It covers monospace typography (Geist Mono for body text, IBM Plex Mono for headings, serif italics for display), a pure-black dark theme on shadcn HSL tokens, text shades made from foreground opacity, a narrow single-column layout, quiet cinematic glows and grain, and tactile widgets fixed to the corners. Use it when building or restyling any page, section or component for willx.tech or the will.me repo. Also use it for any project the user wants "in my style", "like my portfolio" or "like willx", or when picking fonts, colours, spacing, tokens or page structure for the user's own sites.
---

# willx design system

willx.tech is minimal and monospace, with a little cinema and play in it. Content is a quiet reading column of small text. The personality lives in the details: a dial that looks like hardware, a spinning record, an arrow pointer that inverts, a crowd walking past the footer, and a theme change that spreads out in a circle. Keep the base calm so those details stand out.

## When to use

- Adding a page, section or component to willx.tech (repo `SheerWill007/will.me`, folder `Programming/will.me`)
- Starting another project the user wants to look like their portfolio
- Choosing type, colour, spacing, radius, motion or copy tone for the user's own work
- For a different style on a new product, use `design-direction` instead

## Stack

Next.js (App Router) + React 19 + TypeScript, Tailwind CSS 3 with shadcn/ui tokens (`cn()` = clsx + tailwind-merge, `cva` variants), Motion/Framer Motion, Lenis smooth scroll, next-themes (`attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`), lucide-react icons, deployed on Vercel with `@vercel/analytics`.

## Typography

| Role | Spec |
| --- | --- |
| Root size | `html { font-size: 14px }`. Everything in rem is smaller than usual, on purpose |
| Body | Geist Mono 400, `line-height: 1.8`, `letter-spacing: -0.01em`, antialiased |
| Headings | IBM Plex Mono, `font-weight: 600`, `letter-spacing: -0.02em` |
| Display | `font-serif font-light italic`, `text-6xl md:text-7xl`, `leading-none tracking-tight`. Only for archive and case-study titles |
| Accent | Amiri italic (`--font-amiri`) is loaded for the odd quote or flourish |
| Homepage h1 | Deliberately small: `text-lg font-semibold tracking-tight` |
| Section title | `text-lg font-semibold tracking-tight` + subtitle `text-sm text-foreground/60 mt-1` |
| Body copy | `text-[14px]`–`text-[15px] leading-8 text-foreground/90` |
| Eyebrow | `text-xs uppercase tracking-wider` (or `tracking-[0.35em]`) `text-foreground/60` |
| Mono labels | `text-[10px]`–`text-[11px] uppercase tracking-[0.2em]`–`[0.25em] font-mono` |
| Numbers | `tabular-nums` for anything that changes (clock, %, counters) |

Load fonts with `next/font/google` as CSS variables (`--font-geist-mono`, `--font-ibm-plex-mono`) and set `display: "swap"`.

## Colour

- Tokens are the shadcn HSL set in `references/tokens.css`. Dark mode uses **pure black** (`--background: 0 0% 0%`), and light mode uses pure white.
- Build text hierarchy from **foreground opacity** rather than extra greys: `/90` body, `/80` lists, `/70` secondary, `/60` meta and subtitles, `/50` and `/40` faint labels, `/20` timeline lines and pill borders, `/10` card borders and dividers, `/5` fills and glows.
- Use accents sparingly, one at a time:
  - Glow cyan `#5fc8f2` for focus rings, the dial and active states. Glow gradient `#6fe3f0 → #5fc8f2 → #3d8ff0`
  - Blue `#4c6fff` as an illustration accent
  - `ring-blue-400/30` on the floating nav pill
  - `green-500` for "Live" status dots
  - A per-project `accent` hex on project cards (left border, pulsing dot)
- Contribution graph scale: `--gh-0…4`, blue-grey and theme-aware (see `github-activity-graph`).
- Hardware widgets (dial, buttons) stay dark in **both** themes, because they are physical objects. Only their outer ring changes: `ring-black/5 dark:ring-white/10`.

## Layout

- Page: `main.min-h-screen flex justify-center px-6 py-24` → column `w-full max-w-2xl space-y-28`. Archive pages use `max-w-5xl` and case studies use `max-w-4xl`.
- Sections: `space-y-5`/`space-y-6`. Later sections are separated with `border-t border-foreground/10 pt-10`.
- Fixed chrome, all `z-50`:
  - A top fade: `fixed top-0 h-32 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-40`
  - Clock top-left
  - Nav pill top-right
  - Record player bottom-left (`bottom-3 left-3`)
  - Control dial bottom-right (`bottom-3 right-3`)
  - The custom cursor above everything
- Scrollbars are hidden site-wide (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`). Keep content scrollable by keyboard.
- Page order on the homepage: nav pill → intro (typewriter) → GitHub graph → skills grid (`grid-cols-2 sm:grid-cols-3`) → featured projects → experience timeline → certifications timeline → interests → socials → contact/booking → crowd footer.

## Reusable patterns

All of these are in `references/patterns.tsx`:

- **SectionHeader**: a title plus a muted subtitle
- **InlineLink / SocialLink**: an underline that grows from 0 to 100% width as an `after:` pseudo-element (`after:h-[1px] after:transition-all after:duration-300`)
- **Timeline item**: a 6px dot at `mt-[7px]` on a 1.5px connector line `bg-foreground/20`, with no line after the last item
- **Nav pill**: `rounded-full border bg-background/70 backdrop-blur-md shadow-lg ring-1 ring-blue-400/30 hover:scale-105 active:scale-95`
- **Card**: `rounded-lg border-foreground/10 hover:border-foreground/30 hover:-translate-y-1 hover:shadow-lg`, with the image `group-hover:scale-105` over 500ms
- **Pills/badges**: `rounded-full border border-foreground/20 text-[11px] uppercase tracking-[0.2em]`
- **Ambient glow**: fixed, blurred circles at `bg-foreground/5 blur-[120px]` behind archive pages
- **Grain**: an SVG `feTurbulence` data URI at `opacity-[0.22] mix-blend-multiply`

## Motion feel

- Use one easing everywhere: `[0.21, 1, 0.32, 1]`.
- Entrances blur in: opacity 0 → 1, y 24 → 0, blur 8px → 0, over 0.6s, `viewport: { once: true, margin: "-80px" }`.
- Stagger children by 0.1s after a 0.2s delay.
- Micro-interactions take 150–300ms. Collapses and layout take 500ms. Springs for physical things (cursor: stiffness 420, damping 22, mass 0.4).
- Every animation needs a reduced-motion path. The full recipes are in `web-motion`.

## Copy voice

First person, short and a little dry: "See you around.", "Rush hour on my website. I'm the one not moving.", "I still can't leave a pixel alone." Keep headings plain, put the jokes in captions and microcopy, and don't oversell.

## Rules

- Stay inside the type and colour system. Add a new font or accent only with a reason the user agrees to.
- Use tokens (`bg-background`, `text-foreground/70`) and never raw hex, except inside hardware widgets and illustration canvases.
- Keep the reading column at `max-w-2xl`. Let wide things (graphs, footer scene) break out deliberately.
- Fixed widgets must not cover content or each other on small screens (see `mobile-polish`).
- Any new interactive piece gets a keyboard path, a visible `focus-visible` ring (cyan `#5fc8f2` on hardware, `ring` token elsewhere) and a reduced-motion fallback.

## Related skills

`web-motion`, `theme-toggle-reveal`, `custom-cursor`, `skeuomorphic-controls`, `ambient-music-player`, `canvas-crowd-footer`, `booking-contact-section`, `github-activity-graph`, `project-showcase`, `mobile-polish`.

## References

- `references/tokens.css`: the CSS variables, base styles and utilities from `app/globals.css`
- `references/tailwind.config.js`: the Tailwind 3 theme mapping. For Tailwind 4, see the note at the top of `tokens.css`
- `references/layout-shell.tsx`: the root layout with fonts, providers and fixed corner widgets
- `references/patterns.tsx`: SectionHeader, links, timeline, nav pill, card, badges, glow and grain
