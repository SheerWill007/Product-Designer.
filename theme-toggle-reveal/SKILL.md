---
name: theme-toggle-reveal
description: Switch between light and dark themes with next-themes, and animate the switch as a circle that grows from the click point (the View Transitions API clip-path reveal used on willx.tech). Falls back to an instant switch where the API isn't supported or reduced motion is on. Use when adding a theme toggle or dark-mode switch, a circle/ripple/spotlight theme animation, or when fixing theme flicker, hydration warnings or a toggle that animates to the wrong theme in Next.js.
---

# Theme toggle with circular reveal

The whole page is captured, the theme flips, and the new theme is revealed through a circle that expands from the pointer until it covers the far corner.

## Setup (once)

1. `npm i next-themes`. Wrap the app: `<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>`. Use `enableSystem` and `defaultTheme="system"` if the site should follow the OS.
2. Add `suppressHydrationWarning` to `<html>`. next-themes sets the class before React hydrates.
3. Add the CSS in `references/theme-transition.css`. It turns off the browser's default cross-fade so only the circle animates.
4. Tailwind: `darkMode: ["class"]` (v3) or `@custom-variant dark (&:where(.dark, .dark *));` (v4).

## The toggle (`references/ThemeToggle.tsx`)

1. Work out the origin: the pointer position, or the button's centre when it was triggered from the keyboard (`event.detail === 0`).
2. Work out the radius to the farthest viewport corner: `Math.hypot(max(x, W - x), max(y, H - y))`.
3. Call `document.startViewTransition(update)`. Inside `update`, apply the theme **synchronously**: `flushSync(() => setTheme(next))`, and set the class on `<html>` directly. Otherwise React may commit after the browser has taken the "new" snapshot, and the circle reveals the old theme.
4. On `transition.ready`, animate `clipPath` from `circle(0px at x y)` to `circle(r at x y)` on `::view-transition-new(root)`, over 500ms `ease-in-out`.
5. `.catch()` the `ready` promise. The transition can be skipped (background tab, a second fast click), and the theme should still change quietly.
6. Fall back to a plain `setTheme(next)` when `document.startViewTransition` is missing or `prefers-reduced-motion: reduce` matches.

## Icon and hydration

- On the server the theme is unknown. Render a neutral placeholder of the same size until mounted (the reference uses `useSyncExternalStore`), so the icon doesn't flash or cause a hydration mismatch.
- Read `resolvedTheme` (not `theme`) when deciding the current mode if `enableSystem` is on.
- Label the action, not the state: `aria-label="Switch to light theme"`.

## Browser support

Same-document view transitions work in Chrome and Edge 111+, Safari 18+ and Firefox 144+ (Baseline since October 2025). Older browsers switch instantly through the fallback. Nothing breaks.

## Variants

- **Shrink back:** when switching to light, animate `::view-transition-old(root)` from full size down to `circle(0)` instead, so the dark theme collapses into the button.
- **Other shapes:** `inset()` wipes (top to bottom) or `polygon()` diagonals work the same way.
- **Hardware button:** on willx.tech the bulb button on the control dial triggers it. The bulb glows amber in light mode (`text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.9)]`).

## Rules

- Use one theme source (next-themes). Don't also keep a separate `isDark` state.
- Don't animate `background-color` on `body` at the same time, or it fights the reveal.
- Make sure fixed and transparent layers (top fade, glows) use theme tokens, so both snapshots look right.
- Test with a keyboard (Enter/Space on the toggle), with reduced motion on, and in Firefox and Safari.

## References

- `references/ThemeToggle.tsx`: the toggle button with circular reveal, keyboard origin, reduced-motion and unsupported fallbacks
- `references/theme-transition.css`: the view-transition CSS to add to `globals.css`
