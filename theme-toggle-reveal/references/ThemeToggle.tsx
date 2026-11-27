"use client"

// Theme toggle whose new theme grows out of the click point as a circle.
// Needs next-themes (<ThemeProvider attribute="class">) and theme-transition.css.
import { useSyncExternalStore, type MouseEvent } from "react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

const noop = () => () => {}
/** false during SSR and hydration, true afterwards: avoids an icon mismatch. */
const useMounted = () => useSyncExternalStore(noop, () => true, () => false)

export function switchTheme(
  next: "light" | "dark",
  setTheme: (theme: string) => void,
  origin: { x: number; y: number },
) {
  const root = document.documentElement
  const apply = () => {
    flushSync(() => setTheme(next))
    // Set it directly as well, so the new snapshot is taken with the new theme.
    root.classList.toggle("dark", next === "dark")
    root.style.colorScheme = next
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (!document.startViewTransition || reduced) {
    apply()
    return
  }

  const { x, y } = origin
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = document.startViewTransition(apply)
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      )
    })
    // skipped transitions (background tab, double click) still change the theme
    .catch(() => {})
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const isDark = resolvedTheme === "dark"

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // detail === 0 means Enter/Space: there is no pointer, so start from the button
    const fromKeyboard = e.detail === 0
    switchTheme(isDark ? "light" : "dark", setTheme, {
      x: fromKeyboard ? rect.left + rect.width / 2 : e.clientX,
      y: fromKeyboard ? rect.top + rect.height / 2 : e.clientY,
    })
  }

  if (!mounted) {
    return <span aria-hidden="true" className={`inline-block h-9 w-9 ${className}`} />
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`grid h-9 w-9 place-items-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-md transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {isDark ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
    </button>
  )
}
