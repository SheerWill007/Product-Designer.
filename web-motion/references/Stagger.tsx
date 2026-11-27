"use client"

// Staggered reveal for grids and lists.
// <StaggerGrid className="grid grid-cols-1 gap-6 md:grid-cols-2">
//   {items.map((item) => <StaggerItem key={item.id}><Card … /></StaggerItem>)}
// </StaggerGrid>
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { IN_VIEW, rise, staggerParent } from "./motion-tokens"

export function StaggerGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerParent} initial="hidden" whileInView="visible" viewport={IN_VIEW} className={className}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={rise} className={className}>
      {children}
    </motion.div>
  )
}
