---
name: canvas-crowd-footer
description: Animated canvas illustration scenes, based on the willx.tech footer. A crowd of illustrated people walks past in two lanes going opposite ways, while the site owner stands still in the middle with a giant name behind them. Covers turning illustration sheets into transparent sprites (background removal, splitting a sheet into figures), lane and depth layering, wave and group spacing, walking poses, DPR and resize handling, pausing offscreen, a pause button, reduced motion and screen-reader text. Use when building a footer or hero scene with moving characters, a crowd, parade or walking-people animation, any sprite-based canvas animation, or when the user supplies illustrations to animate.
---

# Canvas crowd footer

The footer of willx.tech says "See you around." A big black name sits on a white stage, people stream past in front of and behind it, and the owner's portrait stands still in the middle: "Rush hour on my website. I'm the one not moving."

## Layer stack (back to front)

1. A white stage (`bg-white`, stays white in both themes) inside a `<button>` that pauses and resumes the animation
2. The giant name: `font-extrabold`, `text-[clamp(100px,22.7vw,370px)]`, `tracking-[-0.04em]`, `#141414`, `aria-hidden`
3. **Back canvas:** the back lane walks left to right, clipped at its baseline (`H × 0.58`) so the walkers sink "behind" the name
4. **Front canvas:** the owner's portrait (still, `H × 0.97` tall, centred), then the front lane walking right to left
5. Grain overlay: SVG `feTurbulence`, `opacity .22`, `mix-blend-multiply`

Above the stage, a heading row ("See you around." + "Back to top ↑"). Below it, a caption row (joke + © line + link).

## Sprite pipeline (`references/prep-crowd.mjs`, `npm run crowd:prep`, needs `sharp`)

- **Input:** `art/crowd/`
  - `you.*` → the portrait
  - `sheet-*.png|jpg` → many people per sheet
  - Anything else → one person each
- **Background removal:** near-white pixels are flood-filled from the image edges, so white clothing inside an outline stays opaque.
  - Outlines are thickened first (`SEAL`) so small gaps don't leak.
  - Waist-up figures get their bottoms closed.
  - Edges are softened.
- **Sheet splitting:** connected blobs on a 4px grid, dilated so hair strands stay attached. Specks under 1.5% of the area are dropped. Figures come out in reading order.
- **Output:** trimmed WebP sprites (crowd 640px tall, portrait 1100px) in `public/footer/crowd/` + `manifest.json`. The component loads the manifest and falls back to vector people drawn in code until sprites exist.

## Motion model (`references/CrowdScene.tsx`)

- **Lanes:** `{ row: "back" | "front", dir: ±1, people[] }`. Every frame, people move by `dir × speed × dt`. Anyone past the exit edge is dropped, and new people are added past the entry edge until the lane is full.
- **Speed** scales with width: `clamp(60, W × 0.1, 130)` px/s. The back lane runs at 85% for parallax.
- **Groups and waves:**
  - People arrive in groups of 3–6, with gaps of 0.35–1.1 body widths.
  - Heights follow a travelling wave (`amp 0.2` of the row height) so the crowd looks like it ebbs.
  - `GAP 0.74` sets how much neighbours overlap.
- **Walking pose:** sprites are drawn with a canvas transform:
  - turn: squash to 0.86 for a 3/4 view
  - tilt: 0.035 depth skew toward the walking direction
  - lean: 0.07, plus a sway of 0.015 per step
  - a small step bob
- **Waist crop:** the bottom 4% of each sprite (the drawn waist line) is cropped, and the figure sinks 6% below the row edge so the cut never shows.
- **Variety:** no repeats among the last 3 sprites in a lane, size `0.9–1.06`, random depth order within a lane, blinking for vector people.

## Engineering rules

- Cap `devicePixelRatio` at 2. Size both canvases to `W × dpr` and `setTransform(dpr, …)`. Rebuild the lanes when the size changes by more than 2px (`ResizeObserver`).
- Clamp `dt` to 50ms so a background tab doesn't teleport everyone.
- Stop drawing while offscreen (`IntersectionObserver`). Reset the clock when it becomes visible again.
- **Reduced motion:** draw one still frame and start no loop.
- **Pause control:** the stage is a `<button aria-pressed>`, because motion that lasts more than 5s needs a pause (WCAG 2.2.2). Use `touch-action: pan-y pinch-zoom` so the page still scrolls on phones.
- Describe the scene in an `sr-only` paragraph linked with `aria-describedby`. The canvases are `aria-hidden`.
- Load images with `decoding = "async"`. A missing manifest is not an error.

## Tuning knobs

| Constant | Effect |
| --- | --- |
| `GAP` | lower = tighter crowd |
| `WAVE.amp / step / group / gap` | wave depth, wave length, group size and spacing |
| `WALK.turn / tilt / lean / sway` | how "turned" and lively the walkers look |
| `speed()` | pace; the user asked for faster, then slower, so expose it |
| `rowGeom` | back baseline `0.58H`, row heights `0.54H` (back) / `0.64H` (front) |
| `WAIST_CROP / WAIST_SINK` | hide the cut-off line under the edge |

## Adapting it

- **Other subjects:** cars, birds, fish or crowds at a station. Keep the lane model and swap the sprites and pose transform.
- **Theme:** the stage is a deliberately fixed white "poster". If it should follow the theme, invert it with tokens and use dark-on-light sprites only.
- **Personalise** with the props `name` (the giant word), `owner`, `heading` and `caption`.

## References

- `references/CrowdScene.tsx`: the full component (canvas layers, lanes, sprites, vector fallback, pause, accessibility)
- `references/prep-crowd.mjs`: the sprite preparation script (background removal, sheet splitting, manifest)
