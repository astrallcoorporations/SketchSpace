import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { PAPER_HEX, drawStroke, mulberry32, passColor, passStrokes, type InkName } from './marker-ink'

type MarkerSwatchProps = {
  ink: InkName
  /** How many passes of marker have gone down. 0 is blank paper. */
  passes: number
  seed?: number
  /** Lay the passes down one by one the first time the swatch scrolls into view. */
  animate?: boolean
  className?: string
}

const STROKE_MS = 70

/**
 * A hand-filled marker swatch on paper, drawn in canvas. More passes multiply
 * into deeper colour; the ends stay ragged the way a real swatch chart does.
 */
export function MarkerSwatch({ ink, passes, seed = 1, animate = false, className }: MarkerSwatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let started = false
    let shown = !animate || reduce

    const plan = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const rand = mulberry32(seed * 7919 + passes)
      const layers = Array.from({ length: passes }, (_, i) => passStrokes(width, height, rand, i))
      return { width, height, layers }
    }

    let current = plan()

    const paint = (upto: number) => {
      const { width, height, layers } = current
      ctx.fillStyle = PAPER_HEX
      ctx.fillRect(0, 0, width, height)
      const color = passColor(ink)
      let count = 0
      for (const layer of layers) {
        for (const s of layer) {
          if (count >= upto) return
          const p = Math.min(1, upto - count)
          drawStroke(ctx, s, color, p)
          count += 1
        }
      }
    }

    const total = () => current.layers.reduce((n, l) => n + l.length, 0)

    const run = () => {
      if (started) return
      started = true
      const n = total()
      const t0 = performance.now()
      const tick = (t: number) => {
        const done = (t - t0) / STROKE_MS
        paint(done)
        if (done < n) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    const ro = new ResizeObserver(() => {
      current = plan()
      if (shown || started) paint(Infinity)
      else paint(0)
    })
    ro.observe(canvas)

    let io: IntersectionObserver | undefined
    if (!shown) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            shown = true
            run()
            io?.disconnect()
          }
        },
        { threshold: 0.4 },
      )
      io.observe(canvas)
    }

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io?.disconnect()
    }
  }, [ink, passes, seed, animate])

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('block size-full', className)} />
}
