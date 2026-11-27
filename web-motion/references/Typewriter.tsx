"use client"

// Types a word, pauses, deletes it and moves to the next one.
// Screen readers hear the whole phrase once (sr-only text); the moving letters are hidden from them.
// With reduced motion it shows the first word, still.
import { useEffect, useState } from "react"
import { useMediaQuery } from "./use-media-query"

interface TypewriterProps {
  words: string[]
  prefix?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseDelay?: number
  /** What screen readers hear instead of the animation. Defaults to "prefix word1, word2." */
  label?: string
}

export default function Typewriter({
  words,
  prefix = "",
  typingSpeed = 100,
  deletingSpeed = 45,
  pauseDelay = 1200,
  label,
}: TypewriterProps) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const still = useMediaQuery("(prefers-reduced-motion: reduce)")

  useEffect(() => {
    if (still || words.length === 0) return
    const word = words[index % words.length]
    let delay: number
    let step: () => void

    if (!deleting && text.length < word.length) {
      delay = typingSpeed
      step = () => setText(word.slice(0, text.length + 1))
    } else if (!deleting) {
      delay = pauseDelay
      step = () => setDeleting(true)
    } else if (text.length > 0) {
      delay = deletingSpeed
      step = () => setText(word.slice(0, text.length - 1))
    } else {
      delay = 50
      step = () => {
        setDeleting(false)
        setIndex((i) => (i + 1) % words.length)
      }
    }

    const t = setTimeout(step, delay)
    return () => clearTimeout(t)
  }, [text, deleting, index, words, typingSpeed, deletingSpeed, pauseDelay, still])

  const shown = still ? words[0] ?? "" : text
  // "21, design engineer, gamer." rather than "21, design engineer., gamer."
  const spoken = label ?? `${prefix}${words.map((w) => w.replace(/[.!?]+$/, "")).join(", ")}.`

  // Plain inline text on purpose: inside an inline-flex container, the space at the end of
  // the prefix ("21, ") would be dropped and render as "21,design engineer."
  return (
    <span>
      <span className="sr-only">{spoken}</span>
      <span aria-hidden="true">
        {prefix}
        {shown}
        <span className="ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-current align-middle motion-reduce:animate-none" />
      </span>
    </span>
  )
}
