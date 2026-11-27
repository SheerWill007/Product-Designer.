---
name: custom-cursor
description: Replace the system pointer with a custom arrow or dot that inverts against whatever is behind it (white with mix-blend-mode difference, so it shows black on light and white on dark) and springs on hover and press. It is only turned on for mouse users. Use when the user wants a custom cursor or pointer, an inverting or "black on white, white on black" cursor, a cursor that grows over links, or when a custom cursor lags, disappears on some backgrounds, gets stuck over iframes or shows up on phones.
---

# Custom cursor

willx.tech uses a rounded arrow drawn in white with `mix-blend-mode: difference`, so it inverts against both themes. Its tip sits exactly on the real pointer position. It grows over interactive elements and shrinks while pressed.

## Rules that make it feel native

1. **Gate it.** Turn it on only for `(pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)`. Listen for changes, because a laptop can switch between touch and mouse. On phones and tablets the native behaviour stays untouched.
2. **Hide the native cursor only while the custom one is active.** Add a `custom-cursor` class to `<html>` and use `cursor: none !important` under that class, never globally.
3. **Don't re-render on mouse move.** Write the position into motion values (`useMotionValue`) or a ref plus `transform`. React state is only for visibility, hover and press.
4. **Hotspot.** Offset the drawing so the tip lands on the pointer (`-translate-x-[2px] -translate-y-[2px]` for a tip at 2,2), and scale around the tip (`origin-[2px_2px]`). Otherwise clicks feel off by a few pixels.
5. **Stacking.** Render it `fixed`, `pointer-events-none`, at the top `z-index`, as a direct child of `body` (portal if needed). Blend modes only blend inside the stacking context. A parent with `transform`, `filter` or `isolation: isolate` breaks the inversion.
6. **Hover targets.** Use `closest("a, button, [role='button'], [role='slider'], [data-cursor-hover]")` on `mouseover`, so any element can opt in.
7. **Text fields** keep the native I-beam (`input, textarea, [contenteditable]` override `cursor: text`), and the custom cursor fades out over them.
8. **Edges and iframes.** Hide on `mouseleave` of the document. An embedded iframe (cal.com, YouTube) takes the pointer away, so hide when `mouseout` has no `relatedTarget`.

## Visual options

- **Arrow** (willx): the 24×24 path in `references/CustomCursor.tsx`, white fill and a white 1.8 stroke with round joins, so the corners look soft.
- **Dot + ring:** an 8px dot that follows instantly, plus a 32px ring on a soft spring that grows to 48px over links.
- **Label cursor:** a pill that shows "View", "Drag" or "Play" from `data-cursor-label`. Only for showcase sections.

## Known limits

- On mid-grey backgrounds, `difference` against white gives mid-grey, and the cursor gets faint. Test on real images. Add a 1px dark outline in a separate, non-blended layer if needed.
- The cursor follows the page. Over a native `<select>` dropdown or browser UI, the system cursor shows.
- Screen magnifier users may lose track of a non-native cursor. Keep it at least as big as the system arrow.

## Checklist

- [ ] Doesn't render on touch (check with the mobile emulation preset)
- [ ] The tip matches the click point (click small links at the edges)
- [ ] Inverts correctly in both themes and over images
- [ ] No React re-render per mouse move (React DevTools highlight)
- [ ] Hides when leaving the window and over iframes. Text fields show the I-beam
- [ ] Turned off with reduced motion

## References

- `references/CustomCursor.tsx`: the inverting arrow cursor with gating, hover, press, text-field and iframe handling
- `references/cursor.css`: the CSS to add to `globals.css`
