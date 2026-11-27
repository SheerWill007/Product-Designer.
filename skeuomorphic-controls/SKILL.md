---
name: skeuomorphic-controls
description: Tactile, hardware-style UI controls built in CSS and React. Covers rotary dials and knobs with knurled rings, glowing level bars in recessed wells, round hardware buttons and pill-shaped control panels that fold away, with drag, wheel and keyboard input and full slider accessibility. Use when the user wants a dial, knob, volume or brightness control, a physical, hardware, device-like, skeuomorphic or tactile control panel, or recreates a device control from a reference image (like the willx.tech volume and theme panel).
---

# Skeuomorphic controls

Physical-looking controls are believable when the light is consistent, the layers are honest (body → well → fill → glow) and the input feels like the object it imitates.

## Anatomy and layer recipe

Light always comes from the top: highlights on top edges, shadows below.

| Part | Recipe |
| --- | --- |
| Body (pill/panel) | `#1b1b1c`, `inset 0 1px 0 rgba(255,255,255,.06)` (top lip), `inset 0 -2px 6px rgba(0,0,0,.6)` (bottom), drop shadow `0 18px 40px -12px rgba(0,0,0,.55)`, plus `ring-1 ring-black/5 dark:ring-white/10` |
| Well (recessed track) | `#0d0d0e`, `inset 0 2px 5px rgba(0,0,0,.85)` + `0 1px 0 rgba(255,255,255,.05)` under the edge |
| Fill (level) | gradient `#6fe3f0 → #5fc8f2 → #3d8ff0`, glow `0 0 14px rgba(95,200,242,.55)`, optional top highlight `inset 0 1px 0 rgba(255,255,255,.35)` |
| Knob body | `radial-gradient(circle at 50% 35%, #2c2c2e, #111112)`, drop shadow `0 6px 14px rgba(0,0,0,.7)` |
| Knurled ring | 36 SVG tick lines on a 60-unit viewBox (r 24→28, `#4a4a4d`), with tick 0 coloured as the indicator (`#5fc8f2`). Or `repeating-conic-gradient` masked to a ring with `radial-gradient` (see `assets/dial.html`) |
| Cap | `radial-gradient(circle at 50% 30%, #d9d9db, #8e8e92)`, `inset 0 1px 0 rgba(255,255,255,.7)`, label `7–9px` bold `tabular-nums` `#2a2a2c` |
| Round button | `#141415`, `0 2px 4px rgba(0,0,0,.6)` + top lip. Pressed: `inset 0 2px 4px rgba(0,0,0,.7)`. Icon `#cfcfd2` → white on hover |
| Active icon | Brighter colour + `drop-shadow(0 0 3–6px ...)` glow (amber bulb `#fcd34d` for "light on") |

Hardware stays dark in both themes, because it's an object, not a surface. Only the outer ring changes per theme.

## Interaction model (value 0–1)

- **Knob:**
  - Choose **vertical drag** (`value += dy / 150`, predictable on touch and used on willx) or **angular drag** (`atan2` delta around the centre, more physical, used in `assets/dial.html`). Pick one per product.
  - Use `setPointerCapture` so a drag continues outside the knob.
  - Map the value to a 270° sweep: `angle = -135 + value * 270`.
  - **Wheel:** a non-passive listener with `preventDefault()`, `±0.05` per notch. Add `data-lenis-prevent` so smooth scroll doesn't fight it.
  - **Keyboard:** arrows ±0.05, PageUp/PageDown ±0.2, Home/End to the ends.
  - **ARIA:** `role="slider"` + `aria-valuemin/max/now` + `aria-valuetext` ("40%, muted").
- **Level bar:** click or drag along x sets the value. If a knob controls the same value, mark the bar `aria-hidden` so there is one accessible control.
- **Buttons:** real `<button>`s with an `aria-label`, and `aria-pressed` for toggles (mute).
- **Touch:** put `touch-action: none` only on the draggable parts. Make the hit area at least 44px with a `::before` (`before:-inset-x-2 before:-inset-y-0.5`) without changing the look.

## Folding panel pattern (willx corner widget)

- The bar sits in a wrapper with `overflow-hidden` and animates `max-width` + `opacity` + margins over 300ms. It's open while hovered, **keyboard**-focused (`:focus-visible` only) or dragging.
- On touch, `pointerleave` fires right after a tap, so keep it open for 2.5s before folding.
- Mount it only on the client (`mounted` guard) when it reads theme state, to avoid hydration flicker.

## Building one from a reference

Follow `component-recreation`:

1. Prototype as a standalone HTML file first, like `assets/dial.html`.
2. Compare it in the browser.
3. Port it to React with the blocks in `references/ControlPanel.tsx`.

## Rules

- Keep one light direction and one glow colour per device.
- Use numbers that change with `tabular-nums` so the cap label doesn't jitter.
- Keep motion short: transforms at 150ms on value change. Panels fold over 300ms. Honour `motion-reduce`.
- Every control works without a mouse: keyboard, screen reader values, touch drag.

## References

- `references/ControlPanel.tsx`: `Knob`, `LevelBar`, `HardwareButton` and the folding `ControlPanel` (the willx.tech music and theme panel, generalised)
- `assets/dial.html`: a standalone, dependency-free dial with brightness/volume modes, angular drag, wheel and keyboard. The recreation is based on a dial shot by designer staromlynski; credit them if you publish it
