---
name: ambient-music-player
description: Background music for a website. One shared audio player (React context) is driven by a vinyl record-player widget and volume controls, with autoplay-policy handling, the iPhone volume workaround (Web Audio gain), lock-screen controls (Media Session), a typed playlist and a "now playing" widget that folds away. Use when adding site music, a music toggle, record player, now-playing widget or playlist. Also use when music won't autoplay, the volume does nothing on iPhone or iPad, or songs and covers need adding.
---

# Ambient music player

willx.tech plays a short playlist quietly in the background. A record player in the bottom-left corner shows the song and play/skip controls. The control dial in the bottom-right sets the volume and mute. Both drive one `<audio>` element.

## Architecture

- `MusicProvider` (context) owns the only `<audio>` element and exposes `useMusic()`:
  - `track`, `index`, `playing`, `volume`, `muted`
  - `togglePlay`, `next`, `prev`, `setVolume`, `toggleMute`
- UI components never create audio. They only call `useMusic()`.
- Songs live in `data/playlist.ts` (`Track { title, artist, src, cover?, coverPosition? }`).
- Mount the provider once in the root layout, above every component that uses it.

## Browser rules you must design around

1. **Autoplay.** Browsers block audible playback until the visitor interacts. Call `play()` on mount, and if it's rejected, try again on the first **activation** gesture (`pointerup`, `keydown`, `touchend`, `click`). Scrolling and `touchstart` don't count. Once the visitor pauses, never auto-resume.
2. **iPhone/iPad volume.** `audio.volume` is read-only on iOS (it stays at 1).
   - Detect it with a probe element.
   - During a gesture, route the element through `AudioContext → MediaElementSource → GainNode → destination`, and set `gain.value` instead.
   - `createMediaElementSource` can be called once per element.
   - Resume a suspended context on the next tap.
   - Serve MP3/AAC, because gain changes reportedly have no effect on WebM/Opus in iOS Safari.
   - Same-origin files are fine. Cross-origin audio needs CORS (`crossOrigin="anonymous"` + headers), or it plays silent through Web Audio.
3. **Accessibility (WCAG 1.4.2).** Sound that starts by itself and lasts more than 3 seconds needs an easy way to pause it or change its volume. Keep the mute and volume controls visible on every page. Start quietly (50%). Offer `autoStart={false}` if the user prefers music to be opt-in.
4. **Performance.** Use `preload="none"` so audio downloads only when it plays. Keep files small (128–192 kbps MP3, under 5 MB).

## Record player widget

- **Disc:**
  - Grooves come from `repeating-radial-gradient` and the sheen from a `conic-gradient` overlay.
  - It spins with a CSS animation whose `animation-play-state` follows `playing`, so it pauses in place without resetting.
  - **Label:** the cover image (`object-position` for non-square art), or a colour label generated from a hash of the title.
- **Tonearm:** an SVG group rotated around its pivot, 0° while playing and −16° when paused, with a springy `cubic-bezier(.3,1.3,.5,1)` over 700ms.
- **Folding:**
  - It opens on hover, keyboard focus, on load and for 4s when the song changes ("peek"), then stays open 1.2s after the pointer leaves.
  - When folded, it scales to 0.45–0.5 and the details collapse.
  - Hidden details get `inert` + `aria-hidden`.
- **Announce** song changes with `aria-live="polite"` on the title.
- **Small screens:** hide the details and keep the record as a play/pause button.

## Adding songs and covers

1. Put the audio file in `public/music/` (MP3/M4A, kebab-case name). Put a square cover (~300px WebP) in `public/music/covers/`.
2. Add an entry to `data/playlist.ts`. Order is play order, and the playlist loops.
3. Only use music and artwork you have the rights to publish. Commercial tracks on a public site can be taken down.

## Rules

- Keep one audio element and one source of truth for volume and mute.
- Keep the visitor's choice: once they pause, autoplay stays off for that visit.
- Don't play sound on pages where it would surprise people (case studies with video, booking embeds). Consider pausing while a video is playing.
- Test on a real iPhone: play, volume dial, mute, background/foreground, lock-screen controls.

## References

- `references/MusicProvider.tsx`: the context with autoplay-on-gesture, iOS gain routing and Media Session
- `references/RecordPlayer.tsx`: the spinning record, tonearm, cover label and folding details
- `references/playlist.ts`: the `Track` type and playlist template
- Volume and mute UI: `skeuomorphic-controls` (`ControlPanel` wired to `useMusic()`)
