---
name: design-direction
description: Choose a distinctive visual direction before building a new site, landing page, app screen or brand surface, so the result doesn't look like a generic template. Produces a short direction brief covering the concept, type, palette, layout, texture and one signature interaction, then builds against it and critiques the result. Use when starting a new front-end or product UI, when the user asks for a fresh look, moodboard or design ideas, or says something looks generic, boring, template-like or AI-made. For willx.tech itself or "my usual style", use willx-design-system instead.
---

# Design direction

Most forgettable interfaces come from defaults: a centred hero, three feature cards, a purple-to-blue gradient, one sans-serif everywhere and motion on everything. Commit to a direction first, write it down, then build against it.

## When to use

- A new project, page or product surface with no established design system
- The user says "make it look better / less generic / more premium / more like me"
- Before a recreation the user wants to "make my own" rather than copy

## Process

1. **Ground it.** In one sentence each, write down what this is, who it's for and the one feeling it should leave. If a brand, product or person is involved, find what is specific about them (their material, era, place, hobby, tools). That is where the concept comes from.
2. **Pick a concept or metaphor**, something physical or cultural the interface can borrow from: a hardware panel, a printed magazine, a terminal, a record sleeve, a museum label, a train timetable, a blueprint, a darkroom. Name it, and use it to decide every lever below.
3. **Set the five levers:**
   - **Type:** a display face, a text face and (optionally) a mono face, with a clear job for each. Pair on contrast (serif display + grotesk text, or mono everything with a serif accent). Pick the scale (ratio 1.2–1.333), line height and tracking.
   - **Palette:** two neutrals plus one accent, a second accent only if it has a job. Define both themes. Build ramps in OKLCH so lightness steps look even. Check contrast: 4.5:1 for body text, 3:1 for large text, UI parts and focus rings.
   - **Layout:** a column, a grid or deliberate asymmetry. Decide the reading width (45–75ch), section rhythm (spacing scale), and where things break the grid.
   - **Texture and depth:** flat, bordered, shadowed, glassy, grainy or tactile. Choose one surface language and use it everywhere.
   - **Signature moment:** one interaction or piece of motion people will remember (a dial, a scene, a reveal, a cursor). Only one. Everything else stays quiet.
4. **Write the brief** using the template below and show it to the user before building anything large. It is a cheap decision to change at this point.
5. **Build one key screen first**, then critique it against the brief: does every element follow the concept? Remove anything that doesn't. Then spread the system to the other screens.
6. **Check it in the browser** at desktop and phone widths in both themes before calling it done.

## Direction brief template

```
Concept:     <metaphor> because <reason tied to the subject>
Feeling:     <three words>
Type:        display <font>, text <font>, mono <font>; scale <ratio>; body <size>/<line-height>
Palette:     bg <value>, fg <value>, muted <value>, accent <value> (used for <job>)
Layout:      <column/grid>, reading width <ch>, section spacing <value>
Surface:     <flat/bordered/tactile/...>, radius <value>, shadow <recipe>
Signature:   <the one memorable interaction>
Motion:      easing <curve>, durations <micro>/<entrance>, reduced-motion plan
Avoid:       <three things this design must not do>
```

## Defaults to avoid unless chosen on purpose

- A centred hero, three identical cards and a CTA band, as the whole page
- A purple/blue gradient, glassmorphism or glow on every surface
- One sans-serif for everything with no hierarchy beyond size
- The same `rounded-2xl` card wrapping every piece of content
- Emoji or a random icon set as decoration
- Stock illustrations and generic 3D blobs
- Every element animating in. Motion loses meaning when everything moves
- Placeholder copy ("Lorem ipsum", "Build the future") in the design review. Write the real words

## Free font pairings by mood

Starting points, not rules. Check licences for anything outside Google Fonts.

| Mood | Display | Text | Mono |
| --- | --- | --- | --- |
| Editorial, literary | Instrument Serif, Fraunces, Newsreader | Geist, Source Sans 3 | IBM Plex Mono |
| Technical, precise | Geist, Space Grotesk | Geist, IBM Plex Sans | Geist Mono, JetBrains Mono |
| Warm, human | Fraunces (soft), Bricolage Grotesque | Nunito Sans, Figtree | DM Mono |
| Brutal, loud | Archivo Black, Anton | Archivo, Inter Tight | Space Mono |
| Developer-personal (willx) | IBM Plex Mono 600 | Geist Mono | Geist Mono |

## Rules

- Make one strong decision rather than several weak ones. If a choice doesn't serve the concept, cut it.
- Don't add a second accent, font or effect to fix a dull design. Fix the hierarchy and spacing first.
- The signature moment must stay usable with a keyboard and with reduced motion.
- Write real copy early. Words change layouts.
- Record the final tokens in code (CSS variables) so the direction survives the next change.

## Output

A direction brief (above), then the key screen built to it, with a short note of how each lever shows up in the build.
