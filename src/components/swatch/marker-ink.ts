/**
 * Marker ink model. Alcohol-marker dye is transparent: every pass multiplies
 * over the paper and over the passes below it, so the colour deepens with
 * each layer. Everything here is deterministic for a given seed, so a swatch
 * looks the same on every render.
 */

export type InkName = 'pink' | 'magenta' | 'violet'

export const INK_HEX: Record<InkName, string> = {
  pink: '#ec4899',
  magenta: '#c026d3',
  violet: '#8b5cf6',
}

export const PAPER_HEX = '#fbf8fd'

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** One pass of dye: the marker colour diluted toward white by `strength`. */
export function passColor(ink: InkName, strength = 0.52) {
  const [r, g, b] = hexToRgb(INK_HEX[ink])
  const mix = (c: number) => Math.round(255 - (255 - c) * strength)
  return `rgb(${mix(r)} ${mix(g)} ${mix(b)})`
}

type Stroke = { x0: number; x1: number; y: number; w: number; tilt: number }

/** The strokes of one pass across a w×h cell: overlapping chisel sweeps with ragged ends. */
export function passStrokes(w: number, h: number, rand: () => number, pass = 0): Stroke[] {
  // artists alternate the sweep angle between passes so the seams cross
  const lean = (pass % 2 === 0 ? -1 : 1) * Math.min(0.12, (0.04 + rand() * 0.05) * (h / Math.max(w, 1)) * 3)
  // a real chisel nib is a fixed size, so big swatches take many more strokes
  const nib = Math.min(30, Math.max(6, h * (0.26 + rand() * 0.08)))
  const step = nib * 0.8
  const strokes: Stroke[] = []
  for (let y = -nib * 0.3 + rand() * nib * 0.3; y < h + nib * 0.4; y += step * (0.9 + rand() * 0.2)) {
    strokes.push({
      x0: w * (0.01 + rand() * 0.05),
      x1: w * (0.94 + rand() * 0.05),
      y,
      w: nib * (0.9 + rand() * 0.2),
      tilt: lean + (rand() - 0.5) * 0.04,
    })
  }
  return strokes
}

/** Draw one stroke with pooled edges: the dye collects where the nib lifts. */
export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, color: string, progress = 1) {
  const x1 = s.x0 + (s.x1 - s.x0) * progress
  const dy = (x1 - s.x0) * s.tilt
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(s.x0, s.y - s.w / 2)
  ctx.lineTo(x1, s.y - s.w / 2 + dy)
  ctx.quadraticCurveTo(x1 + s.w * 0.18, s.y + dy, x1, s.y + s.w / 2 + dy)
  ctx.lineTo(s.x0, s.y + s.w / 2)
  ctx.quadraticCurveTo(s.x0 - s.w * 0.14, s.y, s.x0, s.y - s.w / 2)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.globalAlpha = 0.55
  ctx.lineWidth = Math.max(0.8, s.w * 0.06)
  ctx.beginPath()
  ctx.moveTo(s.x0, s.y + s.w / 2)
  ctx.lineTo(x1, s.y + s.w / 2 + dy)
  ctx.stroke()
  ctx.restore()
}
