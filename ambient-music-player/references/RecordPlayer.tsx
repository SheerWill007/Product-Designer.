"use client"

// "Now playing" record player, fixed to a corner (bottom-left on willx.tech).
// The record spins while music plays and the tonearm swings onto it.
// When nobody is using it, it shrinks to a small record and hides the song details;
// it opens on hover or focus, and for a few seconds on load and when the song changes.
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { useMusic } from "./MusicProvider"

const PEEK_MS = 4000 // open on load and when the song changes
const LINGER_MS = 1200 // stays open after the pointer leaves

// Geometry of the 120×110 stage, in px
const DISC = { x: 22, y: 16, size: 88 }
const PIVOT = { x: 12, y: 12 }
const ARM_TIP = { x: 84, y: 54 }

/** A colour label unique to each song, for records without a cover. */
function labelGradient(title: string) {
  let h = 0
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 80% 68%), hsl(${(hue + 55) % 360} 70% 55%))`
}

export default function RecordPlayer() {
  const { track, playing, togglePlay, next, prev, tracks, index } = useMusic()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [peek, setPeek] = useState(true)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Peek on load and whenever the song changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeek(true)
    const t = setTimeout(() => setPeek(false), PEEK_MS)
    return () => clearTimeout(t)
  }, [index])

  useEffect(
    () => () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    },
    [],
  )

  if (!track) return null
  const open = hovered || focused || peek
  const many = tracks.length > 1

  return (
    <div
      className="flex select-none items-end gap-2"
      onPointerEnter={() => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current)
        setHovered(true)
      }}
      onPointerLeave={() => {
        leaveTimer.current = setTimeout(() => setHovered(false), LINGER_MS)
      }}
      onFocus={(e) => {
        if ((e.target as HTMLElement).matches(":focus-visible")) setFocused(true)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      {/* Space the record takes up; it shrinks when idle */}
      <div
        className={`relative shrink-0 transition-[width,height] duration-500 ease-out motion-reduce:transition-none ${
          open ? "h-[88px] w-[96px] sm:h-[110px] sm:w-[120px]" : "h-[50px] w-[54px] sm:h-[55px] sm:w-[60px]"
        }`}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          className={`group absolute bottom-0 left-0 h-[110px] w-[120px] origin-bottom-left rounded-full outline-none transition-transform duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#5fc8f2] motion-reduce:transition-none ${
            open ? "scale-[0.8] sm:scale-100" : "scale-[0.45] sm:scale-50"
          }`}
        >
          {/* record: grooves + sheen, spins only while playing */}
          <span
            className="absolute animate-[spin_6s_linear_infinite] rounded-full bg-[repeating-radial-gradient(circle,#f7f7f8_0,#f7f7f8_1.4px,#e4e4e7_1.8px,#f7f7f8_2.4px)] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)] ring-1 ring-black/5 motion-reduce:animate-none dark:bg-[repeating-radial-gradient(circle,#1c1c1e_0,#1c1c1e_1.4px,#2c2c30_1.8px,#1c1c1e_2.4px)] dark:ring-white/10"
            style={{
              left: DISC.x,
              top: DISC.y,
              width: DISC.size,
              height: DISC.size,
              animationPlayState: playing ? "running" : "paused",
            }}
          >
            <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent_0deg,rgba(255,255,255,0.55)_40deg,transparent_80deg,transparent_180deg,rgba(255,255,255,0.4)_220deg,transparent_260deg)] dark:bg-[conic-gradient(from_30deg,transparent_0deg,rgba(255,255,255,0.08)_40deg,transparent_80deg,transparent_180deg,rgba(255,255,255,0.06)_220deg,transparent_260deg)]" />
            {/* label: the song's cover, or a colour label */}
            <span className="absolute inset-[27%] overflow-hidden rounded-full ring-[3px] ring-white/80 dark:ring-black/40">
              {track.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={encodeURI(track.cover)}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: track.coverPosition }}
                  draggable={false}
                />
              ) : (
                <span
                  className="grid h-full w-full place-items-center text-[11px] font-semibold text-white"
                  style={{ background: labelGradient(track.title) }}
                >
                  {track.title.slice(0, 1)}
                </span>
              )}
            </span>
            {/* spindle */}
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
          </span>

          {/* tonearm: rests on the record while playing, lifts off when paused */}
          <svg viewBox="0 0 120 110" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="arm-metal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f2f2f4" />
                <stop offset="0.5" stopColor="#9a9aa0" />
                <stop offset="1" stopColor="#5d5d63" />
              </linearGradient>
            </defs>
            <g
              className="transition-transform duration-700 ease-[cubic-bezier(.3,1.3,.5,1)] motion-reduce:transition-none"
              style={{ transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`, transform: `rotate(${playing ? 0 : -16}deg)` }}
            >
              <line x1={PIVOT.x} y1={PIVOT.y} x2={ARM_TIP.x} y2={ARM_TIP.y} stroke="url(#arm-metal)" strokeWidth="2.6" strokeLinecap="round" />
              <rect
                x={ARM_TIP.x - 3}
                y={ARM_TIP.y - 2.5}
                width="9"
                height="5"
                rx="1.2"
                fill="#7a7a80"
                transform={`rotate(30 ${ARM_TIP.x} ${ARM_TIP.y})`}
              />
            </g>
            <circle cx={PIVOT.x} cy={PIVOT.y} r="8" fill="#fafafa" stroke="rgba(0,0,0,0.12)" />
            <circle cx={PIVOT.x} cy={PIVOT.y} r="4.5" fill="none" stroke="#d4d4d8" strokeWidth="1.5" />
            <circle cx={PIVOT.x} cy={PIVOT.y} r="1.6" fill="#a1a1aa" />
          </svg>
        </button>
      </div>

      {/* Song and controls, hidden when idle (and on small screens) */}
      <div
        aria-hidden={!open}
        inert={!open}
        className={`hidden min-w-0 overflow-hidden pb-2 transition-[max-width,opacity] duration-500 ease-out motion-reduce:transition-none sm:block ${
          open ? "max-w-[15rem] opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        <p className="text-[10px] leading-none text-muted-foreground">{playing ? "Now playing" : "Paused"}</p>
        <p aria-live="polite" className="mt-1 truncate text-lg font-semibold leading-tight tracking-tight text-foreground">
          {track.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{track.artist}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <ControlButton label="Previous song" onClick={prev} disabled={!many}>
            <SkipBack size={12} fill="currentColor" />
          </ControlButton>
          <ControlButton label={playing ? "Pause" : "Play"} onClick={togglePlay}>
            {playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </ControlButton>
          <ControlButton label="Next song" onClick={next} disabled={!many}>
            <SkipForward size={12} fill="currentColor" />
          </ControlButton>
        </div>
      </div>
    </div>
  )
}

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-foreground shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
    >
      {children}
    </button>
  )
}
