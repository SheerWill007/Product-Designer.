"use client"

// Blur-in reveal on scroll. Wrap any section: <Reveal><section>…</section></Reveal>
// With <MotionConfig reducedMotion="user"> at the root, reduced-motion users get a plain fade.
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { EASE, IN_VIEW } from "./motion-tokens"

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      viewport={IN_VIEW}
    >
      {children}
    </motion.div>
  )
}
