import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { passColor, type InkName } from './marker-ink'

/**
 * A test-sheet overlay that takes a marker stroke from the pointer. Mouse and
 * pen draw on hover; touch draws only while pressed so the page still scrolls.
 * The stroke multiplies over whatever is under it and fades a moment after the
 * pointer rests.
 */
export function MarkerScribble({ ink = 'magenta', className }: { ink?: InkName; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const color = passColor(ink, 0.6)
    let last: { x: number; y: number } | null = null
    let lastMove = 0
    let frame = 0
    let pressed = false

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(canvas)

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && !pressed) return
      const p = local(e)
      if (last) {
        const dist = Math.hypot(p.x - last.x, p.y - last.y)
        if (dist > 80) {
          last = p
          return
        }
        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.strokeStyle = color
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        // chisel nib held at 30°: the line thickens on horizontal sweeps
        const angle = Math.atan2(p.y - last.y, p.x - last.x)
        ctx.lineWidth = 7 + 9 * Math.abs(Math.cos(angle - Math.PI / 6))
        ctx.beginPath()
        ctx.moveTo(last.x, last.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        ctx.restore()
      }
      last = p
      lastMove = performance.now()
    }
    const onLeave = () => {
      last = null
      pressed = false
    }
    const onDown = (e: PointerEvent) => {
      pressed = true
      last = local(e)
    }
    const onUp = () => {
      pressed = false
    }

    const fade = (t: number) => {
      if (t - lastMove > 1400) {
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgb(0 0 0 / 0.05)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
      frame = requestAnimationFrame(fade)
    }
    frame = requestAnimationFrame(fade)

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [ink])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('absolute inset-0 size-full cursor-crosshair touch-pan-y mix-blend-multiply', className)}
    />
  )
}
