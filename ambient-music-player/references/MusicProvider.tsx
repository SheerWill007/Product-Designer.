"use client"

// The site's one audio player. UI pieces (record player, volume dial, mute button) drive it
// through useMusic(); none of them create their own <audio>.
//
// - Starts quietly on the first real gesture if the browser blocks autoplay
//   (pointerup / keydown / touchend / click count; scroll and touchstart don't).
// - iPhone/iPad ignore audio.volume, so there the volume goes through a Web Audio gain node,
//   created during a gesture. Serve MP3/AAC: gain changes reportedly do nothing for WebM/Opus on iOS.
// - Lock-screen / media-key controls through the Media Session API.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { PLAYLIST, type Track } from "./playlist"

const DEFAULT_VOLUME = 0.5
const clamp = (v: number) => Math.min(1, Math.max(0, v))
const GESTURES = ["pointerup", "keydown", "touchend", "click"] as const

interface MusicState {
  tracks: Track[]
  track: Track | null
  index: number
  playing: boolean
  volume: number
  muted: boolean
  togglePlay: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
}

const MusicContext = createContext<MusicState | null>(null)

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>")
  return ctx
}

/** True on browsers that ignore audio.volume (iOS/iPadOS). */
function volumeIsLocked() {
  const probe = document.createElement("audio")
  probe.volume = 0.5
  return probe.volume !== 0.5
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

export default function MusicProvider({
  children,
  tracks = PLAYLIST,
  autoStart = true,
}: {
  children: ReactNode
  tracks?: Track[]
  /** false = never start by itself; the visitor presses play. */
  autoStart?: boolean
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME)
  const [muted, setMuted] = useState(false)

  const wantPlayRef = useRef(autoStart) // false once the visitor pauses
  const startedRef = useRef(false)
  const levelRef = useRef({ volume: DEFAULT_VOLUME, muted: false })

  // Web Audio volume, only used where audio.volume is ignored
  const lockedRef = useRef<boolean | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  /** Call from a gesture. Sets up (or wakes) the gain node on browsers that need it. */
  const unlockVolume = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (lockedRef.current === null) lockedRef.current = volumeIsLocked()
    if (!lockedRef.current) return
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
      if (!AC) return
      try {
        const ctx = new AC()
        const gain = ctx.createGain()
        const level = levelRef.current
        gain.gain.value = level.muted ? 0 : level.volume
        // Only once per element. Cross-origin audio needs CORS (crossOrigin="anonymous") or it plays silent.
        ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination)
        ctxRef.current = ctx
        gainRef.current = gain
      } catch {
        return // the hardware volume buttons still work
      }
    }
    if (ctxRef.current.state !== "running") ctxRef.current.resume().catch(() => {})
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    try {
      await audio.play()
      startedRef.current = true
    } catch {
      // blocked until the visitor interacts with the page
    }
  }, [])

  // Try to start now; if the browser blocks it, start on the first gesture.
  useEffect(() => {
    if (!wantPlayRef.current) return
    function start() {
      unlockVolume()
      if (startedRef.current || !wantPlayRef.current) return detach()
      play().then(() => {
        if (startedRef.current) detach()
      })
    }
    function detach() {
      GESTURES.forEach((type) => window.removeEventListener(type, start))
    }
    GESTURES.forEach((type) => window.addEventListener(type, start))
    play().then(() => {
      if (startedRef.current) detach()
    })
    return detach
  }, [play, unlockVolume])

  // iOS suspends Web Audio in the background; wake it on the next gesture.
  useEffect(() => {
    const wake = () => {
      const ctx = ctxRef.current
      if (ctx && ctx.state !== "running") ctx.resume().catch(() => {})
    }
    window.addEventListener("pointerup", wake)
    window.addEventListener("keydown", wake)
    return () => {
      window.removeEventListener("pointerup", wake)
      window.removeEventListener("keydown", wake)
    }
  }, [])

  // New track: load it and keep playing if we were.
  // Compare against the last loaded index (not a "first run" flag) so StrictMode's
  // double effects in development don't reload the first song.
  const loadedIndex = useRef(index)
  useEffect(() => {
    if (loadedIndex.current === index) return
    loadedIndex.current = index
    const audio = audioRef.current
    if (!audio) return
    audio.load()
    if (wantPlayRef.current) play()
  }, [index, play])

  // Volume and mute: element properties everywhere, gain node where volume is locked.
  useEffect(() => {
    levelRef.current = { volume, muted }
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
      audio.muted = muted
    }
    if (gainRef.current) gainRef.current.gain.value = muted ? 0 : volume
  }, [volume, muted])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    unlockVolume()
    if (audio.paused) {
      wantPlayRef.current = true
      play()
    } else {
      wantPlayRef.current = false
      audio.pause()
    }
  }, [play, unlockVolume])

  const next = useCallback(() => {
    if (tracks.length > 1) setIndex((i) => (i + 1) % tracks.length)
    else if (audioRef.current) audioRef.current.currentTime = 0
  }, [tracks.length])

  const prev = useCallback(() => {
    const audio = audioRef.current
    // like most players: restart the song unless it has only just begun
    if (tracks.length <= 1 || (audio && audio.currentTime > 3)) {
      if (audio) audio.currentTime = 0
      return
    }
    setIndex((i) => (i - 1 + tracks.length) % tracks.length)
  }, [tracks.length])

  const setVolume = useCallback(
    (v: number) => {
      unlockVolume()
      setVolumeState(clamp(Math.round(v * 100) / 100))
    },
    [unlockVolume],
  )

  const toggleMute = useCallback(() => {
    unlockVolume()
    setMuted((m) => !m)
  }, [unlockVolume])

  const track = tracks[index] ?? null

  // Lock screen, headphones and media keys
  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return
    const session = navigator.mediaSession
    session.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      artwork: track.cover ? [{ src: encodeURI(track.cover), sizes: "300x300" }] : [],
    })
    const handlers: [MediaSessionAction, () => void][] = [
      ["play", () => { wantPlayRef.current = true; play() }],
      ["pause", () => { wantPlayRef.current = false; audioRef.current?.pause() }],
      ["nexttrack", next],
      ["previoustrack", prev],
    ]
    handlers.forEach(([action, handler]) => session.setActionHandler(action, handler))
    return () => handlers.forEach(([action]) => session.setActionHandler(action, null))
  }, [track, play, next, prev])

  const value = useMemo<MusicState>(
    () => ({ tracks, track, index, playing, volume, muted, togglePlay, next, prev, setVolume, toggleMute }),
    [tracks, track, index, playing, volume, muted, togglePlay, next, prev, setVolume, toggleMute],
  )

  return (
    <MusicContext.Provider value={value}>
      {children}
      {track && (
        <audio
          ref={audioRef}
          src={encodeURI(track.src)} // file names may contain spaces
          preload="none"
          loop={tracks.length === 1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={next}
          onLoadedMetadata={(e) => {
            e.currentTarget.volume = levelRef.current.volume
            e.currentTarget.muted = levelRef.current.muted
          }}
        />
      )}
    </MusicContext.Provider>
  )
}
