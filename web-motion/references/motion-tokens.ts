// Shared motion tokens. Import from components instead of repeating numbers.
import type { Transition, Variants } from "motion/react"

export const EASE = [0.21, 1, 0.32, 1] as const

export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
} as const

export const SPRING = {
  snappy: { type: "spring", stiffness: 420, damping: 22, mass: 0.4 },
  soft: { type: "spring", stiffness: 160, damping: 20 },
} as const satisfies Record<string, Transition>

/** Blur-in rise used for scroll reveals and staggered items. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATION.slow, ease: EASE },
  },
}

/** Parent that reveals its children one after another. */
export const staggerParent: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

/** Start revealing a little before the element reaches the viewport, and only once. */
export const IN_VIEW = { once: true, margin: "-80px" } as const
