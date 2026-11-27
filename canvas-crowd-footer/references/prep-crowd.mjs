// Turns raw crowd illustrations into footer sprites.
//
//   art/crowd/you.*              → public/footer/crowd/you.webp (the still portrait)
//   art/crowd/sheet-*.png|jpg    → split into one sprite per person (crowd-XX.webp)
//   art/crowd/<anything else>    → one sprite each (crowd-XX.webp)
//   + public/footer/crowd/manifest.json
//
// White backgrounds are removed by flood-filling from the image edges, so white
// clothing inside an outline stays opaque. Run: npm run crowd:prep

import { readdir, mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const SRC = "art/crowd"
const OUT = "public/footer/crowd"
const CROWD_HEIGHT = 640
const PORTRAIT_HEIGHT = 1100
const WHITE = 232 // channel value treated as background white
const CELL = 4 // sheet splitting works on a CELL×CELL grid
const MIN_PERSON = 0.015 // a figure must cover at least this share of the sheet's area

/** Load an image as RGBA and make edge-connected near-white transparent. */
async function loadCleaned(file, closeBottoms = false) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const isBg = (i) => data[i + 3] < 20 || (data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE)

  // Sketchy outlines have small gaps (sleeve hems, collars) that would let the fill
  // leak into white clothing. Thicken the lines by SEAL px to close those gaps first.
  const SEAL = Math.max(3, Math.round(Math.min(w, h) / 140))
  const ink = new Uint8Array(w * h)
  for (let p = 0; p < w * h; p++) if (!isBg(p * 4)) ink[p] = 1
  const wall = new Uint8Array(w * h)
  const r2 = SEAL * SEAL
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!ink[y * w + x]) continue
      for (let dy = -SEAL; dy <= SEAL; dy++) {
        const ny = y + dy
        if (ny < 0 || ny >= h) continue
        for (let dx = -SEAL; dx <= SEAL; dx++) {
          const nx = x + dx
          if (nx >= 0 && nx < w && dx * dx + dy * dy <= r2) wall[ny * w + nx] = 1
        }
      }
    }
  }

  // Waist-up figures are often cut off without a closing line, which lets the fill
  // run up into white clothing. Close each figure's bottom with a wall between its
  // outermost lines.
  if (closeBottoms) {
    const comp = new Int32Array(w * h)
    let id = 0
    const minArea = w * h * MIN_PERSON * 0.3
    for (let start = 0; start < w * h; start++) {
      if (!wall[start] || comp[start]) continue
      id++
      const pixels = [start]
      comp[start] = id
      let bottom = 0
      for (let k = 0; k < pixels.length; k++) {
        const p = pixels[k]
        const x = p % w
        const y = (p - x) / w
        if (y > bottom) bottom = y
        for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
          if (q < 0 || q >= w * h || !wall[q] || comp[q]) continue
          comp[q] = id
          pixels.push(q)
        }
      }
      if (pixels.length < minArea) continue
      const band = bottom - SEAL * 3
      let x0 = w
      let x1 = -1
      for (const p of pixels) {
        const x = p % w
        if ((p - x) / w >= band && ink[p]) {
          if (x < x0) x0 = x
          if (x > x1) x1 = x
        }
      }
      for (let y = Math.max(0, bottom - SEAL); y <= bottom; y++) {
        for (let x = x0; x <= x1; x++) wall[y * w + x] = 1
      }
    }
  }

  const seen = new Uint8Array(w * h)
  let stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (seen[p] || wall[p]) return
    seen[p] = 1
    stack.push(p)
  }
  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }
  while (stack.length) {
    const p = stack.pop()
    const x = p % w
    const y = (p - x) / w
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }
  // Grow the background back up to the real outline (through white pixels only),
  // so the thickened walls don't leave a white rim around the figure.
  let frontier = []
  for (let p = 0; p < w * h; p++) if (seen[p]) frontier.push(p)
  for (let step = 0; step < SEAL + 1; step++) {
    const next = []
    for (const p of frontier) {
      const x = p % w
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
        if (q < 0 || q >= w * h || seen[q] || ink[q]) continue
        seen[q] = 1
        next.push(q)
      }
    }
    frontier = next
  }
  stack = frontier = null
  for (let p = 0; p < w * h; p++) {
    const i = p * 4
    if (seen[p]) {
      data[i + 3] = 0
      continue
    }
    // soften pixels touching the background so edges don't look jagged
    const x = p % w
    const touches = (x > 0 && seen[p - 1]) || (x < w - 1 && seen[p + 1]) || seen[p - w] || seen[p + w]
    if (touches) {
      const light = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i + 3] = Math.min(data[i + 3], Math.round(255 - Math.max(0, light - 120) * 1.4))
    }
  }
  return { data, w, h }
}

/**
 * Split a sheet into figures: find connected blobs of opaque pixels on a coarse
 * grid (dilated so stray hair strands stay attached), drop specks, and return
 * one RGBA image per figure with everything else made transparent.
 */
function splitSheet({ data, w, h }) {
  const gw = Math.ceil(w / CELL)
  const gh = Math.ceil(h / CELL)
  const solid = new Uint8Array(gw * gh)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 40) solid[((y / CELL) | 0) * gw + ((x / CELL) | 0)] = 1
    }
  }
  // dilate by 2 cells
  const grown = new Uint8Array(gw * gh)
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      if (!solid[y * gw + x]) continue
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < gw && ny < gh) grown[ny * gw + nx] = 1
        }
      }
    }
  }
  // label components
  const label = new Int32Array(gw * gh)
  const boxes = []
  for (let start = 0; start < gw * gh; start++) {
    if (!grown[start] || label[start]) continue
    const id = boxes.length + 1
    const box = { id, x0: gw, y0: gh, x1: 0, y1: 0, cells: 0 }
    const stack = [start]
    label[start] = id
    while (stack.length) {
      const p = stack.pop()
      const x = p % gw
      const y = (p - x) / gw
      box.cells++
      box.x0 = Math.min(box.x0, x)
      box.y0 = Math.min(box.y0, y)
      box.x1 = Math.max(box.x1, x)
      box.y1 = Math.max(box.y1, y)
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue
        const q = ny * gw + nx
        if (grown[q] && !label[q]) {
          label[q] = id
          stack.push(q)
        }
      }
    }
    boxes.push(box)
  }
  const minCells = gw * gh * MIN_PERSON
  const people = boxes.filter((b) => b.cells >= minCells)
  // reading order: rows (by vertical centre), then left to right
  const rowH = gh / 4
  people.sort((a, b) => {
    const ra = Math.round((a.y0 + a.y1) / 2 / rowH)
    const rb = Math.round((b.y0 + b.y1) / 2 / rowH)
    return ra - rb || a.x0 - b.x0
  })
  return people.map((b) => {
    const x0 = b.x0 * CELL
    const y0 = b.y0 * CELL
    const cw = Math.min(w, (b.x1 + 1) * CELL) - x0
    const ch = Math.min(h, (b.y1 + 1) * CELL) - y0
    const out = Buffer.alloc(cw * ch * 4)
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const sx = x0 + x
        const sy = y0 + y
        const si = (sy * w + sx) * 4
        const di = (y * cw + x) * 4
        if (label[((sy / CELL) | 0) * gw + ((sx / CELL) | 0)] !== b.id) continue
        out[di] = data[si]
        out[di + 1] = data[si + 1]
        out[di + 2] = data[si + 2]
        out[di + 3] = data[si + 3]
      }
    }
    return { data: out, w: cw, h: ch }
  })
}

async function writeSprite(img, outName, height) {
  const png = await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } }).png().toBuffer()
  const trimmed = await sharp(png).trim().toBuffer()
  const out = path.join(OUT, outName)
  const info = await sharp(trimmed)
    .resize({ height, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(out)
  return { src: "/" + out.replace(/\\/g, "/").replace(/^public\//, ""), w: info.width, h: info.height }
}

const files = (await readdir(SRC).catch(() => []))
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort()

if (!files.length) {
  console.error(`No images found in ${SRC}/. Add your illustrations there first.`)
  process.exit(1)
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

const manifest = { portrait: null, crowd: [] }
const nextName = () => `crowd-${String(manifest.crowd.length + 1).padStart(2, "0")}.webp`

for (const f of files) {
  const cleaned = await loadCleaned(path.join(SRC, f), !/^you\./i.test(f))
  if (/^you\./i.test(f)) {
    manifest.portrait = await writeSprite(cleaned, "you.webp", PORTRAIT_HEIGHT)
    console.log(`portrait   ${f}`)
  } else if (/^sheet/i.test(f)) {
    const people = splitSheet(cleaned)
    for (const person of people) manifest.crowd.push(await writeSprite(person, nextName(), CROWD_HEIGHT))
    console.log(`sheet      ${f}  → ${people.length} people`)
  } else {
    manifest.crowd.push(await writeSprite(cleaned, nextName(), CROWD_HEIGHT))
    console.log(`single     ${f}`)
  }
}

await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
console.log(
  `\n${manifest.crowd.length} crowd sprites${manifest.portrait ? " + portrait" : " (no you.* portrait yet)"} → ${OUT}/manifest.json`,
)
