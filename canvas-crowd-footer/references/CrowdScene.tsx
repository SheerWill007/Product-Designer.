"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp } from "lucide-react"

/* ─── Types ─────────────────────────────────────────────────── */
type Row = "back" | "front"

interface Traits {
  hair: number // see HAIR
  shirt: number // 0 plain, 1 solid ink, 2 stripes, 3 dots
  collar: number // 0 crew, 1 shirt, 2 hoodie, 3 jacket, 4 v-neck
  mouth: number // 0 smile, 1 flat, 2 open, 3 "o"
  glasses: boolean
  headphones: boolean
  straps: number // 0 none, 1 backpack, 2 bag
  headScale: number
  bodyW: number
}

interface Palette {
  ink: string
  paper: string
  accent: string
}

const HAIR = { SHORT: 0, LONG: 1, BUN: 2, CURLY: 3, BALD: 4, PONY: 5, CAP: 6, SPIKY: 7 }
const TAU = Math.PI * 2

/* ─── Helpers ───────────────────────────────────────────────── */
const rand = (a: number, b: number) => a + Math.random() * (b - a)
const pick = (n: number) => Math.floor(Math.random() * n)
const chance = (p: number) => Math.random() < p

function randomTraits(): Traits {
  return {
    hair: pick(8),
    shirt: pick(4),
    collar: pick(5),
    mouth: pick(4),
    glasses: chance(0.3),
    headphones: chance(0.18),
    straps: chance(0.35) ? 1 + pick(2) : 0,
    headScale: rand(0.92, 1.08),
    bodyW: rand(0.88, 1.12),
  }
}

/* ─── Person drawing ────────────────────────────────────────── */
interface DrawOpts {
  x: number
  baseY: number // y where the waist sits (torso bottom)
  u: number // unit size
  t: Traits
  walk: number | null // walk phase, null = standing
  blink: boolean
  pal: Palette
  you?: boolean
}

function drawPerson(ctx: CanvasRenderingContext2D, o: DrawOpts) {
  const { u, t, pal } = o
  const { ink, paper, accent } = pal
  const lw = Math.max(1, u * 0.32)
  const T = 16 * u
  const bob = o.walk !== null ? -Math.abs(Math.sin(o.walk)) * 0.7 * u : 0
  const sw = 6.5 * u * t.bodyW
  const headR = 4.2 * u * t.headScale
  const headY = -T - 1.8 * u - headR * 1.05

  ctx.save()
  ctx.translate(o.x, o.baseY + bob)
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.lineWidth = lw
  ctx.strokeStyle = ink

  const fillStroke = (fill: string) => {
    ctx.fillStyle = fill
    ctx.fill()
    ctx.stroke()
  }

  /* Legs (only for the standing "you" figure) */
  if (o.you) {
    const L = 19 * u
    ctx.beginPath()
    ctx.moveTo(-sw * 0.9, 0)
    ctx.lineTo(-sw * 0.98, L - 1.5 * u)
    ctx.lineTo(-0.7 * u, L - 1.5 * u)
    ctx.lineTo(-0.3 * u, 4 * u)
    ctx.lineTo(0.3 * u, 4 * u)
    ctx.lineTo(0.7 * u, L - 1.5 * u)
    ctx.lineTo(sw * 0.98, L - 1.5 * u)
    ctx.lineTo(sw * 0.9, 0)
    ctx.closePath()
    fillStroke(ink)
    // crease lines
    ctx.strokeStyle = paper
    ctx.lineWidth = lw * 0.6
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(s * sw * 0.5, 3 * u)
      ctx.lineTo(s * sw * 0.55, L - 3 * u)
      ctx.stroke()
    }
    ctx.strokeStyle = ink
    ctx.lineWidth = lw
    // sneakers
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.ellipse(s * sw * 0.52, L - 0.9 * u, 2.7 * u, 1.1 * u, 0, 0, TAU)
      fillStroke(accent)
    }
  }

  /* Behind-head hair */
  if (t.hair === HAIR.LONG) {
    ctx.beginPath()
    ctx.roundRect(-headR * 1.15, headY - headR * 0.9, headR * 2.3, -T + 6 * u - (headY - headR * 0.9), headR * 0.9)
    fillStroke(ink)
  }
  if (t.hair === HAIR.PONY) {
    ctx.beginPath()
    ctx.ellipse(headR * 1.05, headY + headR * 0.4, headR * 0.32, headR * 0.95, -0.25, 0, TAU)
    fillStroke(ink)
  }

  /* Arms */
  const sleeve = t.shirt === 1 ? ink : paper
  const swing = o.walk !== null ? Math.sin(o.walk) * 0.14 : 0
  for (const side of [-1, 1]) {
    const sx = side * (sw - 1.4 * u)
    const sy = -T + 2.4 * u
    const len = o.you ? 11 * u : 13 * u
    const a = side * (o.you ? 0.16 : 0.1) + swing * side
    const ex = sx + Math.sin(a) * len
    const ey = sy + Math.cos(a) * len
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(ex, ey)
    ctx.lineWidth = 3.4 * u + lw * 2
    ctx.strokeStyle = ink
    ctx.stroke()
    ctx.lineWidth = 3.4 * u
    ctx.strokeStyle = sleeve
    ctx.stroke()
    ctx.lineWidth = lw
    ctx.strokeStyle = ink
    if (!o.you) {
      ctx.beginPath()
      ctx.arc(ex, ey + 0.6 * u, 1.3 * u, 0, TAU)
      fillStroke(paper)
    }
  }

  /* Torso */
  const torso = new Path2D()
  torso.moveTo(-sw * 0.95, 3 * u)
  torso.lineTo(-sw * 0.98, -T + 3 * u)
  torso.quadraticCurveTo(-sw, -T, -sw + 3 * u, -T)
  torso.lineTo(sw - 3 * u, -T)
  torso.quadraticCurveTo(sw, -T, sw * 0.98, -T + 3 * u)
  torso.lineTo(sw * 0.95, 3 * u)
  torso.closePath()
  ctx.fillStyle = t.shirt === 1 ? ink : paper
  ctx.fill(torso)
  if (t.shirt === 2 || t.shirt === 3) {
    ctx.save()
    ctx.clip(torso)
    ctx.fillStyle = ink
    if (t.shirt === 2) {
      for (let y = -T + 2 * u; y < 3 * u; y += 2.2 * u) ctx.fillRect(-sw, y, sw * 2, 0.8 * u)
    } else {
      for (let y = -T + 2 * u, r = 0; y < 3 * u; y += 2.4 * u, r++) {
        for (let x = -sw + (r % 2) * 1.2 * u; x < sw; x += 2.4 * u) {
          ctx.beginPath()
          ctx.arc(x, y, 0.38 * u, 0, TAU)
          ctx.fill()
        }
      }
    }
    ctx.restore()
  }
  ctx.stroke(torso)

  /* Neck */
  ctx.fillStyle = paper
  ctx.fillRect(-1.3 * u, -T - 2.6 * u, 2.6 * u, 3 * u)
  ctx.beginPath()
  ctx.moveTo(-1.3 * u, -T - 2.6 * u)
  ctx.lineTo(-1.3 * u, -T)
  ctx.moveTo(1.3 * u, -T - 2.6 * u)
  ctx.lineTo(1.3 * u, -T)
  ctx.stroke()

  /* Collar */
  const detail = t.shirt === 1 ? paper : ink
  switch (t.collar) {
    case 0: // crew
    case 2: // hoodie
      ctx.beginPath()
      ctx.arc(0, -T, 2.4 * u, 0, Math.PI)
      ctx.fillStyle = paper
      ctx.fill()
      ctx.stroke()
      if (t.collar === 2) {
        ctx.strokeStyle = detail
        ctx.beginPath()
        ctx.moveTo(-1.1 * u, -T + 2.4 * u)
        ctx.lineTo(-1.3 * u, -T + 6.5 * u)
        ctx.moveTo(1.1 * u, -T + 2.4 * u)
        ctx.lineTo(1.3 * u, -T + 6.5 * u)
        ctx.stroke()
        ctx.strokeStyle = ink
        ctx.beginPath()
        ctx.ellipse(0, -T - 0.2 * u, 4.4 * u, 1.4 * u, 0, Math.PI * 0.05, Math.PI * 0.95, true)
        ctx.stroke()
      }
      break
    case 1: {
      // shirt collar + buttons
      ctx.beginPath()
      ctx.moveTo(-2.6 * u, -T)
      ctx.lineTo(0, -T + 3 * u)
      ctx.lineTo(2.6 * u, -T)
      ctx.closePath()
      fillStroke(paper)
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(s * 2.7 * u, -T - 0.3 * u)
        ctx.lineTo(s * 3.4 * u, -T + 2.4 * u)
        ctx.lineTo(s * 0.4 * u, -T + 2.6 * u)
        ctx.closePath()
        fillStroke(t.shirt === 1 ? ink : paper)
      }
      ctx.fillStyle = detail
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(0, -T + (5 + i * 3) * u, 0.35 * u, 0, TAU)
        ctx.fill()
      }
      break
    }
    case 3: {
      // open jacket with contrasting inner tee
      ctx.save()
      ctx.clip(torso)
      ctx.fillStyle = t.shirt === 1 ? paper : ink
      ctx.fillRect(-2.2 * u, -T, 4.4 * u, T + 4 * u)
      ctx.restore()
      ctx.beginPath()
      ctx.arc(0, -T, 1.8 * u, 0, Math.PI)
      fillStroke(paper)
      ctx.strokeStyle = detail
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(s * 2.8 * u, -T)
        ctx.lineTo(s * 3.6 * u, -T + 5 * u)
        ctx.lineTo(s * 2.3 * u, -T + 7 * u)
        ctx.stroke()
      }
      ctx.strokeStyle = ink
      break
    }
    default: {
      // v-neck
      ctx.beginPath()
      ctx.moveTo(-2.4 * u, -T)
      ctx.lineTo(0, -T + 3.4 * u)
      ctx.lineTo(2.4 * u, -T)
      ctx.closePath()
      fillStroke(paper)
    }
  }

  /* Straps */
  if (t.straps === 1) {
    ctx.fillStyle = ink
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(s * (sw - 3.2 * u), -T)
      ctx.lineTo(s * (sw - 1.9 * u), -T)
      ctx.lineTo(s * (sw - 1.6 * u), 3 * u)
      ctx.lineTo(s * (sw - 2.9 * u), 3 * u)
      ctx.closePath()
      ctx.fill()
    }
  } else if (t.straps === 2) {
    ctx.beginPath()
    ctx.moveTo(-sw + 2.6 * u, -T + 0.2 * u)
    ctx.lineTo(sw - 1 * u, 3 * u)
    ctx.lineWidth = 1.3 * u
    ctx.strokeStyle = t.shirt === 1 ? paper : ink
    ctx.stroke()
    ctx.lineWidth = lw
    ctx.strokeStyle = ink
  }

  /* Ears */
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.ellipse(s * headR * 0.92, headY + 0.4 * u, 0.9 * u, 1.3 * u, 0, 0, TAU)
    fillStroke(paper)
  }

  /* Head */
  ctx.beginPath()
  ctx.ellipse(0, headY, headR * 0.92, headR * 1.05, 0, 0, TAU)
  fillStroke(paper)

  /* Front hair */
  const cap = () => {
    ctx.beginPath()
    ctx.ellipse(0, headY - 0.3 * u, headR * 0.98, headR * 0.98, 0, Math.PI, TAU)
    ctx.quadraticCurveTo(headR * 0.2, headY - headR * 0.15, -headR * 0.98, headY - 0.3 * u)
    fillStroke(ink)
  }
  switch (t.hair) {
    case HAIR.SHORT:
    case HAIR.PONY:
      cap()
      break
    case HAIR.LONG:
      cap()
      ctx.fillStyle = ink
      ctx.fillRect(-headR * 1.0, headY - 0.5 * u, headR * 0.28, headR * 1.3)
      ctx.fillRect(headR * 0.72, headY - 0.5 * u, headR * 0.28, headR * 1.3)
      break
    case HAIR.BUN:
      cap()
      ctx.beginPath()
      ctx.arc(0, headY - headR * 1.12, headR * 0.45, 0, TAU)
      fillStroke(ink)
      break
    case HAIR.CURLY:
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI + (i / 8) * Math.PI
        ctx.beginPath()
        ctx.arc(Math.cos(a) * headR * 0.85, headY - 0.2 * u + Math.sin(a) * headR * 0.92, headR * 0.34, 0, TAU)
        fillStroke(ink)
      }
      cap()
      break
    case HAIR.CAP:
      ctx.beginPath()
      ctx.ellipse(0, headY - 0.6 * u, headR * 0.98, headR * 0.92, 0, Math.PI, TAU)
      ctx.closePath()
      fillStroke(paper)
      ctx.beginPath()
      ctx.ellipse(0, headY - 0.6 * u, headR * 1.2, headR * 0.24, 0, 0, TAU)
      fillStroke(ink)
      break
    case HAIR.SPIKY: {
      // messy, swept tufts with strands falling over the forehead
      const tufts: [number, number, number][] = [
        // [angle, length, sweep]
        [1.0, 1.18, -0.35],
        [1.12, 1.32, -0.3],
        [1.25, 1.26, -0.2],
        [1.38, 1.38, -0.1],
        [1.5, 1.3, 0.05],
        [1.62, 1.4, 0.2],
        [1.75, 1.28, 0.3],
        [1.88, 1.22, 0.35],
        [2.0, 1.12, 0.4],
      ]
      ctx.beginPath()
      ctx.moveTo(-headR * 1.0, headY + headR * 0.1)
      for (const [a, len, sweep] of tufts) {
        const ang = a * Math.PI
        const bx = Math.cos(ang) * headR * 0.98
        const by = headY - 0.3 * u + Math.sin(ang) * headR * 0.98
        const tx = Math.cos(ang + sweep) * headR * len
        const ty = headY - 0.3 * u + Math.sin(ang + sweep) * headR * len
        ctx.quadraticCurveTo(bx, by, tx, ty)
        ctx.lineTo(bx + headR * 0.05, by + headR * 0.08)
      }
      ctx.lineTo(headR * 1.0, headY + headR * 0.15)
      // fringe: uneven strands over the forehead
      ctx.lineTo(headR * 0.7, headY - headR * 0.1)
      ctx.lineTo(headR * 0.45, headY + headR * 0.12)
      ctx.lineTo(headR * 0.2, headY - headR * 0.12)
      ctx.lineTo(-headR * 0.1, headY + headR * 0.18)
      ctx.lineTo(-headR * 0.35, headY - headR * 0.1)
      ctx.lineTo(-headR * 0.65, headY + headR * 0.08)
      ctx.closePath()
      fillStroke(ink)
      break
    }
  }

  /* Face */
  const ey = headY + headR * 0.22
  const ex = headR * 0.38
  ctx.fillStyle = ink
  for (const s of [-1, 1]) {
    if (o.blink) {
      ctx.beginPath()
      ctx.moveTo(s * ex - headR * 0.12, ey)
      ctx.lineTo(s * ex + headR * 0.12, ey)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(s * ex, ey, headR * 0.11, 0, TAU)
      ctx.fill()
    }
    if (t.hair !== HAIR.SPIKY) {
      ctx.beginPath()
      ctx.moveTo(s * ex - headR * 0.14, ey - headR * 0.3)
      ctx.lineTo(s * ex + headR * 0.14, ey - headR * 0.33)
      ctx.stroke()
    }
  }
  // nose
  ctx.beginPath()
  ctx.moveTo(0, headY + headR * 0.3)
  ctx.lineTo(-headR * 0.1, headY + headR * 0.46)
  ctx.lineTo(headR * 0.03, headY + headR * 0.48)
  ctx.stroke()
  // mouth
  const my = headY + headR * 0.68
  ctx.beginPath()
  switch (t.mouth) {
    case 0:
      ctx.arc(0, my - headR * 0.14, headR * 0.22, Math.PI * 0.2, Math.PI * 0.8)
      ctx.stroke()
      break
    case 1:
      ctx.moveTo(-headR * 0.15, my)
      ctx.lineTo(headR * 0.15, my)
      ctx.stroke()
      break
    case 2:
      ctx.arc(0, my - headR * 0.06, headR * 0.2, 0, Math.PI)
      ctx.closePath()
      ctx.fill()
      break
    default:
      ctx.arc(0, my, headR * 0.09, 0, TAU)
      ctx.stroke()
  }
  // glasses
  if (t.glasses || o.you) {
    ctx.strokeStyle = o.you ? accent : ink
    ctx.lineWidth = o.you ? lw * 1.6 : lw
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(s * ex, ey, headR * 0.24, 0, TAU)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(-ex + headR * 0.24, ey)
    ctx.lineTo(ex - headR * 0.24, ey)
    ctx.stroke()
    ctx.strokeStyle = ink
    ctx.lineWidth = lw
  }
  // headphones
  if (t.headphones) {
    ctx.beginPath()
    ctx.arc(0, headY, headR * 1.12, Math.PI * 1.02, Math.PI * 1.98)
    ctx.lineWidth = 1.1 * u
    ctx.stroke()
    ctx.lineWidth = lw
    for (const s of [-1, 1]) {
      ctx.beginPath()
      ctx.roundRect(s * headR * 1.0 - 0.9 * u, headY - 1.2 * u, 1.8 * u, 3.2 * u, 0.8 * u)
      fillStroke(ink)
    }
  }

  ctx.restore()
}

/* ─── The "you" figure ──────────────────────────────────────── */
const YOU: Traits = {
  hair: HAIR.SPIKY,
  shirt: 1,
  collar: 0,
  mouth: 1,
  glasses: true,
  headphones: false,
  straps: 0,
  headScale: 1,
  bodyW: 1,
}


/* ─── Sprites ───────────────────────────────────────────────── */
// Generated by `npm run crowd:prep` from images in art/crowd/.
// Until it lists sprites, the scene falls back to the coded people above.
const MANIFEST_URL = "/footer/crowd/manifest.json"

interface SpriteEntry {
  src: string
  w: number
  h: number
}

interface Manifest {
  portrait: SpriteEntry | null
  crowd: SpriteEntry[]
}

const PAL: Palette = { ink: "#141414", paper: "#ffffff", accent: "#4c6fff" }
const GAP = 0.74 // neighbour overlap: lower = tighter crowd
// How walkers are posed: turn = horizontal squash for a 3/4 view, tilt = depth skew,
// lean = forward lean toward the walking direction, sway = extra lean per step.
const WALK = { turn: 0.86, tilt: 0.035, lean: 0.07, sway: 0.015 }
const WAIST_CROP = 0.04 // share of each sprite's height cut off the bottom (the drawn waist line)
const WAIST_SINK = 0.06 // how far below the row's edge the cut sits, to cover bob and tilt

interface Person {
  x: number
  w: number
  size: number
  dy: number
  z: number
  sprite: HTMLImageElement | null
  ratio: number
  traits: Traits
  phase: number
  nextBlink: number
  blinkUntil: number
}

interface Lane {
  row: Row
  dir: 1 | -1
  people: Person[] // index 0 = furthest along (closest to the exit edge)
  recent: number[]
  wave: number // phase of the height wave, advanced per person
  groupLeft: number // people left in the current walking group
}

// Heights follow a wave that travels with the walkers, and people come in small
// groups with gaps between them. amp = how far a person can sink (share of row height),
// step = wave phase per person (radians), group = people per group, gap = space between
// groups (share of a person's width).
const WAVE = { amp: 0.2, step: [0.55, 0.85], group: [3, 6], gap: [0.35, 1.1] } as const

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

/* ─── Component ─────────────────────────────────────────────── */
interface CrowdSceneProps {
  /** Giant word behind the crowd (willx.tech uses "WILL.") */
  name?: string
  /** Full name for the copyright line and the screen-reader description */
  owner?: string
  heading?: string
  caption?: string
}

export default function CrowdScene({
  name = "NAME.",
  owner = "Your Name",
  heading = "See you around.",
  caption = "Rush hour on my website. I'm the one not moving.",
}: CrowdSceneProps) {
  const wrapRef = useRef<HTMLButtonElement>(null)
  // Two canvas layers: the back row, then you + the front row. The name sits behind both.
  const backRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const backCanvas = backRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas || !backCanvas) return
    const ctx = canvas.getContext("2d")
    const backCtx = backCanvas.getContext("2d")
    if (!ctx || !backCtx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let W = 0
    let H = 0
    let sprites: HTMLImageElement[] = []
    let portrait: HTMLImageElement | null = null
    let lanes: Lane[] = []
    let raf = 0
    let last = performance.now()
    let visible = true
    let disposed = false
    let youBlinkUntil = 0
    let youNextBlink = performance.now() + 2500

    const rowGeom = (row: Row) =>
      row === "back" ? { base: H * 0.58, h: H * 0.54 } : { base: H, h: H * 0.64 }
    const speed = () => Math.min(130, Math.max(60, W * 0.1))

    const makePerson = (lane: Lane): Person => {
      const { h } = rowGeom(lane.row)
      const size = rand(0.9, 1.06)
      let sprite: HTMLImageElement | null = null
      let ratio = 0.62
      if (sprites.length) {
        let i = pick(sprites.length)
        for (let tries = 0; tries < 6 && lane.recent.includes(i); tries++) i = pick(sprites.length)
        lane.recent = [i, ...lane.recent].slice(0, Math.min(3, sprites.length - 1))
        sprite = sprites[i]
        ratio = sprite.naturalWidth / sprite.naturalHeight
      }
      const w = sprite ? h * size * ratio * WALK.turn : (17 * h * size) / 27.6
      lane.wave += rand(WAVE.step[0], WAVE.step[1])
      const crest = (1 - Math.cos(lane.wave)) / 2 // 0 at the top of the wave, 1 at the bottom
      return {
        x: 0,
        w,
        size,
        dy: crest * h * WAVE.amp + rand(0, h * 0.03),
        z: Math.random(),
        sprite,
        ratio,
        traits: randomTraits(),
        phase: rand(0, TAU),
        nextBlink: performance.now() + rand(500, 5000),
        blinkUntil: 0,
      }
    }

    // Keep a lane packed: drop people past the exit edge, add people at the entry edge.
    const fillLane = (lane: Lane) => {
      const { dir, people } = lane
      while (people.length && (dir === 1 ? people[0].x - people[0].w / 2 > W : people[0].x + people[0].w / 2 < 0)) {
        people.shift()
      }
      if (!people.length) {
        const p = makePerson(lane)
        p.x = dir === 1 ? W : 0
        people.push(p)
      }
      for (;;) {
        const tail = people[people.length - 1]
        const tailEdge = dir === 1 ? tail.x - tail.w / 2 : tail.x + tail.w / 2
        if (dir === 1 ? tailEdge < -40 : tailEdge > W + 40) break
        const p = makePerson(lane)
        let space = (tail.w / 2 + p.w / 2) * GAP
        if (--lane.groupLeft <= 0) {
          lane.groupLeft = Math.round(rand(WAVE.group[0], WAVE.group[1]))
          space += p.w * rand(WAVE.gap[0], WAVE.gap[1])
        }
        p.x = tail.x - dir * space
        people.push(p)
      }
    }

    const build = () => {
      lanes = [
        { row: "back", dir: 1, people: [], recent: [], wave: rand(0, TAU), groupLeft: 0 },
        { row: "front", dir: -1, people: [], recent: [], wave: rand(0, TAU), groupLeft: 0 },
      ]
      lanes.forEach(fillLane)
    }

    const drawLane = (lane: Lane, now: number, ctx: CanvasRenderingContext2D) => {
      const { base, h } = rowGeom(lane.row)
      ctx.save()
      if (lane.row === "back") {
        ctx.beginPath()
        ctx.rect(0, 0, W, base)
        ctx.clip()
      }
      const ordered = [...lane.people].sort((a, b) => a.z - b.z)
      for (const p of ordered) {
        if (p.sprite) {
          const ph = h * p.size
          const pw = ph * p.ratio
          const bob = reduced ? 0 : -Math.abs(Math.sin(p.phase)) * ph * 0.025
          // Turn each walker toward where they're heading: narrow the body (3/4 view),
          // tilt it slightly in depth and lean the head forward, swaying with each step.
          const lean = lane.dir * (WALK.lean + (reduced ? 0 : Math.sin(p.phase * 2) * WALK.sway))
          // Drop the drawn waist line and sink the figure below the edge, so the cut-off
          // never shows while bobbing or tilting.
          const sw = p.sprite.naturalWidth
          const sh = p.sprite.naturalHeight * (1 - WAIST_CROP)
          const dh = ph * (1 - WAIST_CROP)
          ctx.save()
          ctx.translate(p.x, base + p.dy + bob + ph * WAIST_SINK)
          ctx.transform(WALK.turn, lane.dir * WALK.tilt, -lean, 1, 0, 0)
          ctx.drawImage(p.sprite, 0, 0, sw, sh, -pw / 2, -dh, pw, dh)
          ctx.restore()
        } else {
          const u = (h * p.size) / 27.6
          drawPerson(ctx, {
            x: p.x,
            baseY: base + 2 * u + p.dy,
            u,
            t: p.traits,
            walk: reduced ? null : p.phase,
            blink: now < p.blinkUntil,
            pal: PAL,
          })
        }
      }
      ctx.restore()
    }

    const drawYou = (now: number) => {
      const ph = H * 0.97
      if (portrait) {
        const pw = ph * (portrait.naturalWidth / portrait.naturalHeight)
        ctx.drawImage(portrait, W / 2 - pw / 2, H - 4 - ph, pw, ph)
        return
      }
      const u = ph / 48
      const breathe = reduced ? 0 : Math.sin(now / 900) * 0.15 * u
      drawPerson(ctx, {
        x: W / 2,
        baseY: H - 12 - 19 * u + breathe,
        u,
        t: YOU,
        walk: null,
        blink: now < youBlinkUntil,
        pal: PAL,
        you: true,
      })
    }

    const draw = (now: number) => {
      backCtx.clearRect(0, 0, W, H)
      ctx.clearRect(0, 0, W, H)
      drawLane(lanes[0], now, backCtx)
      drawYou(now)
      drawLane(lanes[1], now, ctx)
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!pausedRef.current && visible) {
        const v = speed()
        for (const lane of lanes) {
          const lv = lane.row === "back" ? v * 0.85 : v
          for (const p of lane.people) {
            p.x += lane.dir * lv * dt
            p.phase += lv * dt * 0.09
            if (now > p.nextBlink) {
              p.blinkUntil = now + 130
              p.nextBlink = now + rand(2500, 6500)
            }
          }
          fillLane(lane)
        }
        if (now > youNextBlink) {
          youBlinkUntil = now + 140
          youNextBlink = now + rand(2500, 5000)
        }
        draw(now)
      }
      raf = requestAnimationFrame(tick)
    }

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const changed = Math.abs(r.width - W) > 2 || Math.abs(r.height - H) > 2
      W = r.width
      H = r.height
      for (const [c, cx] of [[canvas, ctx], [backCanvas, backCtx]] as const) {
        c.width = Math.round(W * dpr)
        c.height = Math.round(H * dpr)
        cx.setTransform(dpr, 0, 0, dpr, 0, 0)
        cx.imageSmoothingQuality = "high"
      }
      if (changed || !lanes.length) build()
      draw(performance.now())
    }

    // Load artwork if it exists, then rebuild lanes with it
    fetch(MANIFEST_URL)
      .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
      .catch(() => null)
      .then(async (m) => {
        if (!m || disposed) return
        const [crowd, you] = await Promise.all([
          Promise.all(m.crowd.map((s) => loadImage(s.src))),
          m.portrait ? loadImage(m.portrait.src) : Promise.resolve(null),
        ])
        if (disposed) return
        sprites = crowd.filter((i): i is HTMLImageElement => i !== null)
        portrait = you
        if (sprites.length || portrait) {
          build()
          draw(performance.now())
        }
      })

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      last = performance.now()
    })
    io.observe(wrap)

    if (!reduced) raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  const toggle = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  return (
    <div className="w-full bg-background text-foreground font-sans pt-10 transition-colors">
      <div className="flex items-center justify-between gap-5 px-6 md:px-10">
        <p className="m-0 font-medium leading-[1.15] tracking-[-0.03em] text-[clamp(26px,3vw,42px)]">
          {heading}
        </p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex min-h-11 items-center gap-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to top <ArrowUp size={16} />
        </button>
      </div>

      <p id="crowd-desc" className="sr-only">
        A dense crowd of illustrated pedestrians streams past in two rows, moving in opposite
        directions. {owner} stands still in the middle of them while people pass in front of and
        behind.
      </p>
      <button
        ref={wrapRef}
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        aria-label={paused ? `${name} Resume crowd animation` : `${name} Pause crowd animation`}
        aria-describedby="crowd-desc"
        className="relative isolate mt-3.5 block w-full h-[clamp(320px,34vw,560px)] overflow-hidden cursor-pointer select-none bg-white [touch-action:pan-y_pinch-zoom] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#141414]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 text-center font-extrabold leading-none tracking-[-0.04em] text-[#141414] whitespace-nowrap text-[30vw] sm:text-[clamp(100px,22.7vw,370px)]"
        >
          {name}
        </span>
        <canvas ref={backRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply"
          style={{ backgroundImage: GRAIN }}
        />
      </button>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 md:px-10 pt-4 pb-24 text-xs text-muted-foreground">
        <small className="text-xs">{caption}</small>
        <span className="flex items-center gap-3 whitespace-nowrap">
          <span>© {new Date().getFullYear()} {owner}</span>
          <span className="opacity-40">·</span>
          <a
            href="/copyright"
            className="underline underline-offset-4 decoration-border hover:text-foreground hover:decoration-foreground transition-colors"
          >
            All Rights Reserved
          </a>
        </span>
      </div>
    </div>
  )
}
