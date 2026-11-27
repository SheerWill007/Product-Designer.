"use client"

// Arrow pointer that inverts against what's behind it (black on light, white on dark).
// Replaces the system cursor only on mouse devices with wide screens and no reduced-motion
// preference. The arrow's tip sits exactly on the mouse position.
// Mount once in the root layout; needs cursor.css.
import { useEffect, useState } from "react"
import { motion, useMotionValue } from "motion/react"

const INTERACTIVE = "a, button, summary, label, [role='button'], [role='slider'], [role='tab'], [data-cursor-hover]"
const TEXT_ENTRY =
  "input:not([type='range']):not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']), textarea, [contenteditable='true']"

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [overText, setOverText] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)")
    const root = document.documentElement

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const onLeave = () => setVisible(false)
    // Moving into an iframe fires mouseout with no relatedTarget: the page loses the pointer.
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false)
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null
      setHovering(!!t?.closest(INTERACTIVE))
      setOverText(!!t?.closest(TEXT_ENTRY))
    }

    const attach = () => {
      root.classList.add("custom-cursor")
      document.addEventListener("mousemove", onMove, { passive: true })
      document.addEventListener("mouseout", onOut)
      root.addEventListener("mouseleave", onLeave)
      document.addEventListener("mousedown", onDown)
      document.addEventListener("mouseup", onUp)
      document.addEventListener("mouseover", onOver)
    }
    const detach = () => {
      root.classList.remove("custom-cursor")
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseout", onOut)
      root.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("mouseup", onUp)
      document.removeEventListener("mouseover", onOver)
    }

    const sync = () => {
      detach()
      setEnabled(query.matches)
      if (query.matches) attach()
    }
    sync()
    query.addEventListener("change", sync)
    return () => {
      query.removeEventListener("change", sync)
      detach()
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
      style={{ x, y }}
      animate={{
        opacity: visible && !overText ? 1 : 0,
        scale: pressed ? 0.85 : hovering ? 1.15 : 1,
      }}
      transition={{
        opacity: { duration: 0.15 },
        scale: { type: "spring", stiffness: 420, damping: 22, mass: 0.4 },
      }}
    >
      {/* White arrow drawn with "difference" blending. Its tip is at (2, 2) in the
          24×24 box, so the box is shifted by 2px and scales around the tip. */}
      <svg width="24" height="24" viewBox="0 0 24 24" className="-translate-x-[2px] -translate-y-[2px] origin-[2px_2px]">
        <path
          d="M2.6 2.3 L20.4 9.4 Q21.5 9.9 20.4 10.5 L13.3 13.3 L10.5 20.4 Q9.9 21.5 9.4 20.4 Z"
          fill="#ffffff"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  )
}
