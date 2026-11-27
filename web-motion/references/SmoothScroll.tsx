"use client"

// Lenis smooth scrolling for the whole page (Next.js App Router).
// Add once in app/layout.tsx around {children}, and import "lenis/dist/lenis.css" in globals.css.
// - Turned off for people who prefer reduced motion (native scrolling instead).
// - Touch scrolling stays native (Lenis default).
// - Put data-lenis-prevent on elements that handle the wheel themselves (dials, modals, scroll panels).
import { ReactLenis } from "lenis/react"
import type { ReactNode } from "react"
import { usePrefersReducedMotion } from "./use-media-query"

export default function SmoothScroll({ children }: { children: ReactNode }) {
  // true on the server, so Lenis only starts in the browser once the preference is known
  const reduced = usePrefersReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true, wheelMultiplier: 1 }}>
      {children}
    </ReactLenis>
  )
}

/*
 * Without lenis/react (plain instance, as on willx.tech):
 *
 *   useEffect(() => {
 *     const lenis = new Lenis({ lerp: 0.08, autoRaf: true })
 *     return () => lenis.destroy()
 *   }, [])
 *
 * Driving Lenis from Motion's frame loop instead (keeps one RAF):
 *   <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
 *   useEffect(() => {
 *     const update = ({ timestamp }: { timestamp: number }) => lenisRef.current?.lenis?.raf(timestamp)
 *     frame.update(update, true)
 *     return () => cancelFrame(update)
 *   }, [])
 */
