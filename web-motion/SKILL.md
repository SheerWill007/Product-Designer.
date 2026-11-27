---
name: web-motion
description: The motion system for React and Next.js sites. Covers blur-in scroll reveals, staggered grids, page fades, typewriter text, hover and press micro-interactions, springs and Lenis smooth scrolling, with shared easing and duration tokens, reduced-motion handling and performance rules. Use when adding or tuning animation, entrance effects, scroll reveals, smooth scroll, typewriter or text effects, or hover states; when asked to make something feel smoother, premium or alive; or when animation is janky, laggy or ignores reduced-motion settings.
---

# Web motion

Motion should explain and reward, never decorate everything. One easing curve, a few durations, and a reduced-motion path for every effect.

## Library

- Use **Motion** (`npm i motion`, `import { motion } from "motion/react"`). It is the renamed Framer Motion and has the same API. Projects still on `framer-motion` (like willx.tech) import from `"framer-motion"` and need no other changes.
- Any component using `motion.*`, hooks or `whileInView` needs `"use client"` in the Next.js App Router.
- Prefer CSS transitions for simple hover and press states. Use Motion for enter/exit, in-view, layout, gestures and springs.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `ease` | `[0.21, 1, 0.32, 1]` | everything that enters or settles |
| `fast` | 150ms | press, colour, icon swaps |
| `base` | 300ms | hover, underline grow, small reveals |
| `slow` | 500–600ms | entrances, collapses, layout |
| `lift` | `translateY(-4px)` / `-translate-y-1` | card hover |
| `rise` | `y: 24` + `blur(8px)` → 0 | scroll reveal |
| `spring.snappy` | `{ stiffness: 420, damping: 22, mass: 0.4 }` | cursor, toggles |
| `spring.soft` | `{ stiffness: 160, damping: 20 }` | panels, drawers |

They're kept in `references/motion-tokens.ts`.

## Recipes

- **Scroll reveal**: wrap a section in `<Reveal>` (`references/Reveal.tsx`). It fades and blurs in once, starting 80px before the section enters the viewport.
- **Staggered grid**: a parent with `staggerChildren: 0.1, delayChildren: 0.2`, and children using the reveal variant (`references/Stagger.tsx`).
- **Page fade**: the CSS class `.page-fade` (6px rise, 0.6s) on the page wrapper. It costs nothing and needs no JavaScript.
- **Underline grow**: an `after:` pseudo-element going from `w-0` to `w-full` over 300ms. See `willx-design-system` patterns.
- **Press**: `active:scale-95` (buttons) or `active:scale-[0.98]` (big pills). **Hover**: `hover:scale-105` only for small floating controls.
- **Typewriter**: `references/Typewriter.tsx`. It types, pauses, deletes and moves to the next word. Screen readers get the full list once through a visually hidden label, never each letter.
- **Smooth scroll**: Lenis through `references/SmoothScroll.tsx` (`ReactLenis root`, `lerp: 0.08`). Import `lenis/dist/lenis.css` once.
  - Add `data-lenis-prevent` to anything that uses the wheel itself (dials, scrollable panels, modals, code blocks).
  - Turn Lenis off when reduced motion is on.
  - Lenis leaves touch scrolling native by default. Keep it that way.
- **Collapsing widget**: animate `max-width` + `opacity` on a wrapper with `overflow-hidden` over 300–500ms, and keep the content mounted. This is how the dial bar and record-player details fold away.

## Reduced motion

- Put `<MotionConfig reducedMotion="user">` at the root. Motion then skips transform and layout animations for people who ask for less motion, while opacity still fades.
- In CSS, use `motion-reduce:` variants (`motion-reduce:animate-none`, `motion-reduce:transition-none`) or an `@media (prefers-reduced-motion: reduce)` block.
- For JavaScript loops (canvas, typewriter, carousels), check `matchMedia("(prefers-reduced-motion: reduce)")`. Render a still frame, or stop advancing on a timer.
- Never remove content for reduced motion. Only remove the movement.

## Performance rules

- Animate `transform` and `opacity`. Keep `filter: blur()` small (8px or less) and on section-sized elements, not long lists, especially on mobile.
- Never set React state on every `mousemove`/`scroll`/frame. Use `useMotionValue`, `useScroll`, refs or `requestAnimationFrame`.
- Use `will-change` only on elements that are animating right now.
- Use `whileInView` with `viewport={{ once: true }}` for entrances, so they don't replay on every scroll past.
- Clean up every timer, observer, RAF loop and Lenis instance on unmount.

## Rules

- Use one easing family across the site. Mixing curves makes things feel off even when people can't say why.
- Entrances run once. Don't animate a section every time it scrolls into view.
- Nothing loops forever next to reading text, except tiny status dots. Auto-moving content needs a pause control if it runs more than 5 seconds.
- Motion confirms an action within 100ms. Any longer and the interface feels broken.

## References

- `references/motion-tokens.ts`: easing, durations, springs and the reveal variants
- `references/Reveal.tsx`: the blur-in on scroll wrapper
- `references/Stagger.tsx`: a staggered grid container and item
- `references/Typewriter.tsx`: accessible typewriter text
- `references/SmoothScroll.tsx`: the Lenis provider with reduced-motion handling
- `references/use-media-query.ts`: a `useMediaQuery` / `usePrefersReducedMotion` hook (useSyncExternalStore, lint-clean)
