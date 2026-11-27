---
name: mobile-polish
description: Make a desktop-first, highly interactive site work well on phones and tablets. Fixes hover-only reveals, tiny touch targets, fixed corner widgets that cover content, custom cursors, smooth-scroll conflicts, autoplaying audio and iPhone volume, heavy canvas and blur effects, viewport height, safe areas and input zoom. Use when the user asks to optimise for mobile, says something is broken, awkward or slow on phones, iPhone, Android or touch devices, or before launching an interactive page.
---

# Mobile polish

Interactive portfolios (dials, record players, canvas scenes, custom cursors) are usually built on a laptop with a mouse. This skill is the pass that makes them feel native on a phone without losing their character.

## Process

1. **Look first.**
   - Open the page in the browser pane with the mobile preset (375×812, touch emulation). Scroll the whole page and tap every control.
   - Screenshot problems as you find them.
   - Then check a tablet width (768) and landscape.
2. **List the issues** against the checklist below, ranked by how badly each one hurts use.
3. **Fix with the patterns below.** Keep desktop behaviour unchanged unless it's also wrong.
4. **Re-test in emulation.** Then name what still needs a **real device** check (iOS audio, safe areas, momentum scrolling, keyboard overlap).

## Checklist and fixes

**Input model**
- Hover-only reveals need a tap path. Open on tap, close on an outside tap or after a linger timer (the willx dial stays open 2.5s after a touch `pointerleave`). Check `e.pointerType === "touch"`.
- Focus-driven opening should only react to **keyboard** focus (`target.matches(":focus-visible")`). Otherwise a tap focuses the element and it stays open forever.
- Never require a double tap, a long press or precise dragging for a primary action.

**Targets**
- Minimum 24×24 CSS px, aiming for 44×44. Expand small round buttons without changing how they look: `relative before:absolute before:-inset-2 before:content-['']`.
- Keep at least 8px between adjacent targets.

**Fixed and corner widgets**
- Shrink or scale them below `sm:` (willx: the record player scales to 0.45 when idle, and its details are hidden on phones).
- Make sure they never cover the content, the footer CTA or each other. Add bottom padding to the page if they sit over the last content.
- Respect safe areas: `bottom: max(0.75rem, env(safe-area-inset-bottom))`, with `viewport-fit=cover` in the viewport meta.

**Viewport and layout**
- Use `min-h-[100dvh]` (or `svh`) instead of `100vh`, which jumps as the browser bars hide and show.
- No horizontal overflow at 320px. Use `overflow-x: clip` on wide decorative layers, and wrap long words, URLs and code.
- Fluid type with `clamp()` for display text. Body text at least 14px, input text at least **16px** (or iOS zooms on focus).

**Custom cursor**
- Only mount it for `(pointer: fine)`. On touch, the native behaviour must come back (remove `cursor: none`).

**Smooth scroll**
- Leave touch scrolling native (Lenis does by default, so don't turn on touch syncing).
- Add `data-lenis-prevent` to inner scrollers, dials and embeds, and `overscroll-behavior: contain` on modals and drawers.

**Gestures**
- Use `touch-action: none` only on drag controls (dials, sliders). Use `pan-y pinch-zoom` on horizontal-only interactive areas so the page still scrolls.

**Audio**
- iOS ignores `audio.volume`, so route it through a Web Audio gain node created during a tap (see `ambient-music-player`).
- Audio only starts after a real gesture (tap or keypress), never on scroll.
- Keep mute reachable with one tap.

**Performance**
- Cap canvas `devicePixelRatio` at 2 (1.5 on very wide canvases). Pause offscreen. Scale particle or sprite counts with width.
- Cut large `blur()` and `backdrop-filter` layers on phones. They're the usual cause of janky scrolling.
- `content-visibility: auto` on long below-the-fold sections. Correct `sizes` on images. `preload="none"` on media.

**Polish**
- Replace the tap highlight with real pressed states (`-webkit-tap-highlight-color: transparent` + `active:` styles).
- Mobile browsers show the native scrollbar overlay. Hidden-scrollbar styles are fine, but the content must stay scrollable.
- Don't show tooltips that only appear on hover. Show the information inline or on tap.

## Testing matrix

| Check | Emulation | Real device |
| --- | --- | --- |
| Layout at 320, 375, 414, 768 + landscape | ✓ | |
| Tap targets, tap-to-open widgets | ✓ | ✓ |
| Safe areas, browser bar resizing (`dvh`) | partly | ✓ |
| Audio start, volume, mute, background/foreground | | ✓ (iPhone) |
| Scroll smoothness with canvas, blur and video | partly | ✓ |
| Form inputs (no zoom, keyboard doesn't cover the field) | partly | ✓ |

## Output

A short list: the issues found, what was changed (with file references), and what still needs a real-device check.
