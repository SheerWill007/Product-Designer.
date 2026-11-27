---
name: component-recreation
description: Recreate a UI component from a reference image, video or link (a Dribbble shot, screenshot or another site) as working code that closely matches it. Break it into layers, measure proportions, sample colours, build a standalone prototype, compare side by side in the browser until it matches, then port it into the project with real state, keyboard support and reduced motion. Use when the user shares a design and says "I want this", "make this", "recreate this", "build this component" or "make it look exactly like this", or asks to match a reference pixel-perfectly.
---

# Component recreation

This is how the willx.tech dial, record player, arrow pointer and crowd footer were built: the user shares a picture, and it becomes a working, accessible component that matches it.

## Process

1. **Read the reference.**
   - List every visible element, from back to front.
   - Several screenshots usually show **states** (on/off, 100% vs 36%). Note what changes between them.
   - Infer the interactions (what's draggable, what toggles, what animates).
   - Ask only if a behaviour is genuinely ambiguous. Otherwise choose sensible defaults and say what you chose.
2. **Measure.**
   - Zoom into the image and pick one anchor element (the knob, the pill height). Express everything else as a ratio of it. Proportions matter more than absolute pixels.
   - Note radii, gaps, stroke widths and text sizes.
3. **Sample colours.**
   - Read them from the zoomed image.
   - Dark UIs are almost never `#000`: surfaces sit around `#111`–`#1f1f1f`, wells darker, highlights `rgba(255,255,255,.05–.1)`.
   - Gradients usually have 3+ stops. Glows are a blurred copy of the fill colour at 40–60% opacity.
4. **Plan the layers.** Work out the light direction and build up: shape → base gradient → inner shadows (depth) → top highlight → content → glow → texture (grain, knurling) → text.
5. **Prototype standalone.**
   - Write `_components/<name>/index.html` in the Design Skills repo, or a scratch page in the project.
   - Use a single file with no dependencies, tokens in `:root`, and every state reachable (buttons, keys).
   - Make the interaction work, not just the look.
6. **Compare and iterate.**
   - Open the prototype in the browser pane and screenshot it.
   - Zoom into the same region as the reference and put them side by side.
   - Each round, fix the **three biggest differences**: usually proportions, then contrast and colour, then details like glow or knurl.
   - Check every state the reference shows.
7. **Make it real.**
   - Keyboard access and ARIA (role, value text, labels).
   - `:focus-visible` rings.
   - Touch input and hit areas.
   - A reduced-motion path.
   - Both themes, if the component sits on themed surfaces.
8. **Port it.** Convert it to the project's stack (React + Tailwind on willx), wire it to real state (context, props), and replace raw values with the project's tokens where they exist. Hardware-like objects can keep their own fixed palette.
9. **Deliver.** A short note on what matches, what differs on purpose (and why), and how to tweak it.

## Matching checklist

- [ ] Overall proportions and spacing match at the same width
- [ ] Silhouette and radii match (pill vs rounded rect, knob size relative to the body)
- [ ] Light direction is consistent: highlights on top, shadows below
- [ ] Contrast between layers matches (body vs well vs fill)
- [ ] Signature details are present: the glow, the texture, and the number format (`tabular-nums`, `%`)
- [ ] Every state in the reference can be reproduced
- [ ] It still looks right at 2× zoom and at phone width

## Ethics and credit

- Recreate the **look and behaviour**, not the brand: no logos, trademarks, product names or proprietary assets (icons, illustrations, fonts) unless the user owns them or they're licensed.
- Keep the original designer's credit when the recreation is published or shown publicly ("Recreated from <designer>"). Not knowing the source is a reason to ask, not to drop the credit.
- Don't recreate whole products, games or sites wholesale. Components and visual techniques are fine.

## Related skills

- `skeuomorphic-controls` for dials, knobs and device-like panels
- `canvas-crowd-footer` for animated illustration scenes
- `custom-cursor`, `ambient-music-player`, `web-motion` for the pieces those components needed
- `ui-polish-review` for a final pass before shipping
