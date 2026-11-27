---
name: ui-polish-review
description: Review UI code or a running page for polish and accessibility problems, and report each one with its file and line, why it matters and the fix. Covers keyboard and focus, hit-target size, motion and reduced motion, forms, typography details, colour contrast in both themes, layout shift, mobile layout and front-end performance. Use when the user asks to review, audit, polish, QA or "check" a UI, component or page, asks whether it is accessible or ready to ship, or asks what's wrong with how something looks or feels.
---

# UI polish review

Find the details that make an interface feel unfinished, and the ones that lock people out. Report them precisely. Don't fix anything until the user has seen the findings, unless they asked for fixes.

## Process

1. **Scope.** Decide what to review: the files in the current diff, a named component, or a page URL. Read the code before judging it.
2. **Run it if you can.** Open the page in the browser pane and check:
   - Tab through every control. Is focus visible, and is the order sensible?
   - Switch both themes.
   - Use the mobile preset (375×812, touch).
   - Zoom to 200%.
   - Look for horizontal scroll at 320px wide.
3. **Walk the checklist below.** Each finding needs a concrete location (`file:line`, or the element on the page) and a concrete fix.
4. **Rank** findings by severity:
   - **blocker**: someone can't use it (keyboard trap, unlabelled control, contrast below 3:1 on essential UI)
   - **major**: clearly wrong or fragile
   - **minor**: polish
   - **nit**: preference
5. **Report**, then offer to apply the fixes, blockers first.

## Checklist

**Keyboard and semantics**
- Actions are `<button>` and navigation is `<a>`/`<Link>`. Clickable `div`s and `span`s are findings.
- Every focusable element has a visible `:focus-visible` style. `outline: none` without a replacement is a blocker.
- Custom controls have a role and state. A slider needs `role="slider"`, `aria-valuenow`/`aria-valuetext`, arrow keys, Home/End and PageUp/PageDown. A toggle needs `aria-pressed`.
- Icon-only buttons have an `aria-label`. Decorative SVGs have `aria-hidden="true"`.
- Escape closes overlays, and focus returns to the trigger. Nothing traps focus.
- Headings run in order. Landmarks exist (`main`, `nav`, `footer`). `<html lang>` is set.
- Canvas or animated scenes have a text alternative (an `sr-only` description).

**Targets and touch**
- Targets are at least 24×24 CSS px (WCAG 2.2, 2.5.8). Aim for 44×44 on touch. Small visuals get a larger hit area through padding or a `::before` with negative inset.
- Nothing that matters is hover-only. Touch users need a tap path.
- Drag controls set `touch-action: none` on the control only, never on the page.

**Motion**
- `prefers-reduced-motion` is honoured for transforms, parallax, auto-scrolling, canvas loops and smooth scroll.
- Animations use `transform`/`opacity` (and small `filter` values). Animating `width`/`top`/`box-shadow` on large elements, or `transition: all`, is a finding.
- Anything that moves by itself for more than 5 seconds has a pause/stop control (WCAG 2.2.2). Nothing flashes more than 3 times a second.
- Durations are about 150–300ms for UI feedback and up to about 600ms for entrances. Longer is a finding unless it's a signature moment.

**Forms**
- Every input has a visible label (placeholder text alone is a finding), plus `autocomplete` and the right `type`/`inputmode`.
- Input font size is at least 16px on mobile, or iOS zooms in.
- Paste is never blocked. Errors appear next to the field, are announced (`aria-live` or `aria-describedby`), and the first invalid field gets focus.
- Submit isn't disabled before the user tries. While submitting, the button keeps its label and shows progress.

**Typography and content**
- Changing numbers use `tabular-nums`. Headings use `text-wrap: balance`. Prose has no widows where it shows.
- Use curly quotes and a real ellipsis (…), with non-breaking spaces in "10 MB" and "⌘ K".
- Line length is about 45–75ch. Meta text isn't below about 11px on mobile.
- Truncated text has a way to see the full value.

**Colour and themes**
- Contrast is at least 4.5:1 for body text, and 3:1 for large text, icons, borders of inputs and focus rings. Check both themes.
- Colour is never the only signal (errors, status, selected state).
- No hard-coded colours that break in the other theme. `color-scheme` is set so native controls and scrollbars match.
- Theme-dependent UI doesn't flash or cause hydration warnings (mounted guard or `suppressHydrationWarning` on `<html>`).

**Layout and stability**
- No horizontal scroll at 320px. Fixed widgets don't cover content and respect `env(safe-area-inset-*)`.
- Use `dvh`/`svh` instead of `100vh` for full-height sections on mobile.
- Images and embeds reserve space (width/height or `aspect-ratio`). Fonts use `display: swap` with similar fallbacks. Async content has a skeleton of the final size.
- The z-index layering makes sense (overlays > fixed chrome > content), and decorative layers have `pointer-events: none`.

**Performance**
- Images use `next/image` with `sizes`. Only the first visible image has `priority`. Media below the fold is lazy.
- Audio and video use `preload="none"` (or `metadata`) unless they're needed at once.
- No React state updates on every `mousemove`/`scroll`. Use refs, motion values or `requestAnimationFrame`.
- Canvas loops cap `devicePixelRatio` at 2, pause when offscreen (IntersectionObserver) and stop when unmounted.
- Listeners are passive unless they call `preventDefault()`, and are removed on cleanup.
- Large blur and `backdrop-filter` effects are used sparingly, especially on mobile.

## Report format

```
## Blockers
1. components/ControlDial.tsx:142 — Dial has no keyboard support.
   Why: keyboard users can't change the volume.
   Fix: add role="slider", aria-valuenow, and arrow/Home/End handling.

## Major
...
## Minor / Nits
...
```

End with a one-line verdict ("ready to ship after the 2 blockers" / "needs another pass") and ask whether to apply the fixes.

## Further reading

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Web Interface Guidelines (MIT): https://github.com/vercel-labs/web-interface-guidelines
