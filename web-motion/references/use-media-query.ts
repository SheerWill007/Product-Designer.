"use client"

// Subscribe to a media query without setState-in-effect (lint-clean, hydration-safe).
// const reduced = useMediaQuery("(prefers-reduced-motion: reduce)")
// const mouse = useMediaQuery("(pointer: fine)")
import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string, serverFallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverFallback,
  )
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)", true)
