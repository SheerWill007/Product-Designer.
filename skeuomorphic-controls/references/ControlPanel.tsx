"use client"

// Hardware-style control panel (as on willx.tech): a glowing level bar that folds into the
// panel, two round hardware buttons and a knurled dial. Values are 0–1.
//
// Building blocks are exported separately: <Knob>, <LevelBar>, <HardwareButton>.
// Wire it to real state, for example music volume + theme:
//   const { volume, muted, setVolume, toggleMute } = useMusic()            // ambient-music-player
//   const { resolvedTheme, setTheme } = useTheme()                            // next-themes
//   <ControlPanel value={volume} onChange={setVolume} muted={muted} onToggleMute={toggleMute}
//     isDark={resolvedTheme === "dark"}
//     onToggleTheme={(e) => switchTheme(resolvedTheme === "dark" ? "light" : "dark", setTheme,
//       { x: e.clientX, y: e.clientY })} />                                   // theme-toggle-reveal
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react"
import { Lightbulb, Volume2, VolumeX } from "lucide-react"

const STEP = 0.05
const SWEEP = 270 // degrees the dial turns from 0% to 100%
const TICKS = 36
const clamp = (v: number) => Math.min(1, Math.max(0, v))
// Round SVG coordinates: server and browser can print sin/cos with different precision,
// which React reports as a hydration mismatch.
const r2 = (n: number) => Math.round(n * 100) / 100

const noop = () => () => {}
/** false during SSR and hydration, true afterwards. */
const useMounted = () => useSyncExternalStore(noop, () => true, () => false)

/* ─── Knob ───────────────────────────────────────────────────────────────── */
export function Knob({
  value,
  onChange,
  label,
  valueText,
  size = 48,
}: {
  value: number
  onChange: (v: number) => void
  label: string
  valueText?: string
  size?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const drag = useRef<{ y: number; v: number } | null>(null)

  useEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
  })

  // Write through the ref first, so several events before the next render add up
  // (fast key repeat, wheel bursts).
  const commit = (v: number) => {
    const next = clamp(v)
    valueRef.current = next
    onChangeRef.current(next)
  }

  // Non-passive wheel listener so turning the dial doesn't scroll the page.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const next = clamp(valueRef.current + (e.deltaY < 0 ? STEP : -STEP))
      valueRef.current = next
      onChangeRef.current(next)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const onKeyDown = (e: ReactKeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowUp: STEP,
      ArrowRight: STEP,
      ArrowDown: -STEP,
      ArrowLeft: -STEP,
      PageUp: 0.2,
      PageDown: -0.2,
    }
    if (e.key in keys) commit(valueRef.current + keys[e.key])
    else if (e.key === "Home") commit(0)
    else if (e.key === "End") commit(1)
    else return
    e.preventDefault()
  }

  const pct = Math.round(value * 100)
  const angle = -SWEEP / 2 + value * SWEEP
  const cap = Math.round(size * 0.46)

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText ?? `${pct}%`}
      data-lenis-prevent
      onKeyDown={onKeyDown}
      // Drag up/down to turn: 150px of travel = the full range. Predictable on touch too.
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = { y: e.clientY, v: valueRef.current }
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (d) commit(d.v + (d.y - e.clientY) / 150)
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      style={{ width: size, height: size }}
      className="relative grid shrink-0 cursor-grab place-items-center rounded-full bg-[radial-gradient(circle_at_50%_35%,#2c2c2e,#111112)] shadow-[0_6px_14px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] outline-none [touch-action:none] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#5fc8f2]"
    >
      {/* knurled ring that turns with the value; tick 0 is the indicator */}
      <svg
        viewBox="0 0 60 60"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full transition-transform duration-150 motion-reduce:transition-none"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * Math.PI * 2
          return (
            <line
              key={i}
              x1={r2(30 + Math.sin(a) * 24)}
              y1={r2(30 - Math.cos(a) * 24)}
              x2={r2(30 + Math.sin(a) * 28)}
              y2={r2(30 - Math.cos(a) * 28)}
              stroke={i === 0 ? "#5fc8f2" : "#4a4a4d"}
              strokeWidth={i === 0 ? 2 : 1.2}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      {/* centre cap */}
      <div
        style={{ width: cap, height: cap }}
        className="relative grid place-items-center rounded-full bg-[radial-gradient(circle_at_50%_30%,#d9d9db,#8e8e92)] shadow-[0_2px_5px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.7)]"
      >
        <span className="text-[7px] font-semibold tabular-nums text-[#2a2a2c]">{pct}%</span>
      </div>
    </div>
  )
}

/* ─── Level bar: click or drag to set ───────────────────────────────────── */
export function LevelBar({
  value,
  onChange,
  onDragChange,
  className = "h-6 w-20",
}: {
  value: number
  onChange: (v: number) => void
  onDragChange?: (dragging: boolean) => void
  className?: string
}) {
  const setFrom = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onChange(clamp((e.clientX - r.left) / r.width))
  }
  return (
    // aria-hidden: the Knob is the accessible control for the same value
    <div
      aria-hidden="true"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        onDragChange?.(true)
        setFrom(e)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) setFrom(e)
      }}
      onPointerUp={() => onDragChange?.(false)}
      onPointerCancel={() => onDragChange?.(false)}
      className={`relative cursor-pointer rounded-full bg-[#0d0d0e] p-[2.5px] shadow-[inset_0_2px_5px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)] [touch-action:none] ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#6fe3f0] via-[#5fc8f2] to-[#3d8ff0] shadow-[0_0_14px_rgba(95,200,242,0.55)] transition-[width,opacity] duration-150"
        style={{ width: `${value * 100}%`, opacity: value === 0 ? 0 : 1 }}
      />
    </div>
  )
}

/* ─── Round hardware button with a larger invisible hit area ─────────────── */
export function HardwareButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string
  pressed?: boolean
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="relative grid h-6 w-6 place-items-center rounded-full bg-[#141415] text-[#cfcfd2] shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors before:absolute before:-inset-x-2 before:-inset-y-0.5 before:content-[''] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5fc8f2] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]"
    >
      {children}
    </button>
  )
}

/* ─── The panel ─────────────────────────────────────────────────────────── */
export default function ControlPanel({
  value,
  onChange,
  muted,
  onToggleMute,
  isDark,
  onToggleTheme,
}: {
  value: number
  onChange: (v: number) => void
  muted: boolean
  onToggleMute: () => void
  isDark: boolean
  onToggleTheme: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  // The bar folds into the panel and slides out while the panel is hovered,
  // keyboard-focused or the bar is being dragged.
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    [],
  )

  // Theme and volume are only known in the browser: render nothing on the server
  // (like willx.tech's ControlDial) so the first client render can't mismatch.
  const mounted = useMounted()

  const open = hovered || focused || dragging
  const shown = muted ? 0 : value
  const pct = Math.round(value * 100)

  if (!mounted) return null

  return (
    <div
      onPointerEnter={() => {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setHovered(true)
      }}
      onPointerLeave={(e) => {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        // a tap "leaves" straight away on touch screens, so keep it open for a moment
        if (e.pointerType === "touch") closeTimer.current = setTimeout(() => setHovered(false), 2500)
        else setHovered(false)
      }}
      onFocus={(e) => {
        // only keyboard focus holds the bar out; a tap would otherwise keep it open forever
        if ((e.target as HTMLElement).matches(":focus-visible")) setFocused(true)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
      data-lenis-prevent
      className="flex select-none items-center rounded-full bg-[#1b1b1c] p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-2px_6px_rgba(0,0,0,0.6)] ring-1 ring-black/5 dark:ring-white/10"
    >
      <div
        className={`overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-out motion-reduce:transition-none ${
          open ? "ml-1 mr-1.5 max-w-[5.5rem] opacity-100" : "ml-0 mr-0 max-w-0 opacity-0"
        }`}
      >
        <LevelBar value={shown} onChange={onChange} onDragChange={setDragging} />
      </div>

      <div className="mr-1.5 flex flex-col gap-1">
        <HardwareButton label={isDark ? "Switch to light theme" : "Switch to dark theme"} onClick={onToggleTheme}>
          <Lightbulb
            size={11}
            strokeWidth={1.8}
            className={isDark ? "" : "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.9)]"}
          />
        </HardwareButton>
        <HardwareButton label={muted ? "Unmute" : "Mute"} pressed={muted} onClick={onToggleMute}>
          {muted ? <VolumeX size={11} strokeWidth={1.8} /> : <Volume2 size={11} strokeWidth={1.8} />}
        </HardwareButton>
      </div>

      <Knob value={value} onChange={onChange} label="Volume" valueText={muted ? `${pct}%, muted` : `${pct}%`} />
    </div>
  )
}
