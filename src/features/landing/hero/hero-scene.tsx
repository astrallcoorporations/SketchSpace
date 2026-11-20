import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { addInkDrop, createInkShaderMaterial, type InkPalette } from './ink-shader-material'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/use-media-query'

type Edge = [number, number]
type PointerWorld = THREE.Vector2 & { userData: { targetX: number; targetY: number } }

function buildScatterPositions(count: number, width: number, height: number) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const r = Math.sqrt(Math.random())
    const theta = Math.random() * Math.PI * 2
    positions[i3] = Math.cos(theta) * r * width * 0.5
    positions[i3 + 1] = Math.sin(theta) * r * height * 0.5
    positions[i3 + 2] = (Math.random() - 0.5) * Math.min(width, height) * 0.25
  }
  return positions
}

function buildSpiralPositions(count: number, width: number, height: number) {
  const positions = new Float32Array(count * 3)
  const turns = 3.2
  const maxRadius = Math.min(width, height) * 0.42
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const t = i / count
    const angle = t * Math.PI * 2 * turns
    const radius = t * maxRadius
    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = Math.sin(angle) * radius
    positions[i3 + 2] = Math.sin(angle * 2) * maxRadius * 0.08
  }
  return positions
}

function buildEdges(positions: Float32Array, count: number, maxDistance: number): Edge[] {
  const edgeSet = new Set<string>()
  const edges: Edge[] = []
  const maxDistSq = maxDistance * maxDistance

  for (let i = 0; i < count; i++) {
    const ix = positions[i * 3]
    const iy = positions[i * 3 + 1]
    const iz = positions[i * 3 + 2]
    const candidates: { j: number; distSq: number }[] = []

    for (let j = 0; j < count; j++) {
      if (j === i) continue
      const dx = positions[j * 3] - ix
      const dy = positions[j * 3 + 1] - iy
      const dz = positions[j * 3 + 2] - iz
      const distSq = dx * dx + dy * dy + dz * dz
      if (distSq < maxDistSq) candidates.push({ j, distSq })
    }

    candidates.sort((a, b) => a.distSq - b.distSq)
    for (const { j } of candidates.slice(0, 2)) {
      const a = Math.min(i, j)
      const b = Math.max(i, j)
      const key = `${a}-${b}`
      if (!edgeSet.has(key)) {
        edgeSet.add(key)
        edges.push([a, b])
      }
    }
  }

  return edges
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const renderable = child as THREE.Object3D & {
      geometry?: THREE.BufferGeometry
      material?: THREE.Material | THREE.Material[]
    }

    renderable.geometry?.dispose()
    if (Array.isArray(renderable.material)) {
      renderable.material.forEach((material) => material.dispose())
    } else {
      renderable.material?.dispose()
    }
  })
}

function createParticleField(count: number, viewport: { width: number; height: number }) {
  const { width, height } = viewport
  const scale = Math.min(width, height)
  const scatter = buildScatterPositions(count, width, height)
  const spiral = buildSpiralPositions(count, width, height)
  const edges = buildEdges(scatter, count, scale * 0.16)
  const seeds = Float32Array.from({ length: count }, () => Math.random() * Math.PI * 2)
  const positions = new Float32Array(scatter)
  const linePositions = new Float32Array(edges.length * 2 * 3)

  const pointsGeometry = new THREE.BufferGeometry()
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

  const points = new THREE.Points(
    pointsGeometry,
    new THREE.PointsMaterial({
      size: scale * 0.006,
      color: '#e879f9',
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )

  const lines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: '#e879f9',
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )

  const group = new THREE.Group()
  group.add(points, lines)

  function update({
    delta,
    elapsed,
    morph,
    pointer,
    reduceMotion,
  }: {
    delta: number
    elapsed: number
    morph: number
    pointer: PointerWorld
    reduceMotion: boolean
  }) {
    const driftStrength = reduceMotion ? 0 : (1 - morph) * scale * 0.02
    const repelStrength = (1 - morph * 0.6) * scale * 0.09
    const repelRadius = scale * 0.22
    const smoothing = Math.min(delta * 4, 1)

    pointer.x += (pointer.userData.targetX - pointer.x) * smoothing
    pointer.y += (pointer.userData.targetY - pointer.y) * smoothing

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const baseX = THREE.MathUtils.lerp(scatter[i3], spiral[i3], morph)
      const baseY = THREE.MathUtils.lerp(scatter[i3 + 1], spiral[i3 + 1], morph)
      const baseZ = THREE.MathUtils.lerp(scatter[i3 + 2], spiral[i3 + 2], morph)

      const seed = seeds[i]
      let x = baseX + Math.sin(elapsed * 0.4 + seed) * driftStrength
      let y = baseY + Math.cos(elapsed * 0.35 + seed * 1.7) * driftStrength
      const z = baseZ

      const dx = x - pointer.x
      const dy = y - pointer.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < repelRadius) {
        const push = (1 - dist / repelRadius) * repelStrength
        const safeDist = dist || 0.001
        x += (dx / safeDist) * push
        y += (dy / safeDist) * push
      }

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
    }

    pointsGeometry.attributes.position.needsUpdate = true

    let cursor = 0
    for (const [a, b] of edges) {
      linePositions[cursor++] = positions[a * 3]
      linePositions[cursor++] = positions[a * 3 + 1]
      linePositions[cursor++] = positions[a * 3 + 2]
      linePositions[cursor++] = positions[b * 3]
      linePositions[cursor++] = positions[b * 3 + 1]
      linePositions[cursor++] = positions[b * 3 + 2]
    }
    lineGeometry.attributes.position.needsUpdate = true
  }

  function markDirty() {
    pointsGeometry.attributes.position.needsUpdate = true
    lineGeometry.attributes.position.needsUpdate = true
  }

  return { group, update, markDirty }
}

type Viewport = { width: number; height: number }

function getViewport(camera: THREE.PerspectiveCamera, width: number, height: number): Viewport {
  const aspect = width / Math.max(height, 1)
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z
  return { width: h * aspect, height: h }
}

/**
 * The ink flow field is the expensive part (16 simplex-noise samples per pixel), but it drifts very slowly.
 * So it is drawn into a small off-screen target at a low rate, and the main scene just shows that texture
 * through a one-sample quad. Same look, a fraction of the GPU time.
 */
function createInkLayer(palette?: InkPalette) {
  const material = createInkShaderMaterial(palette)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1)
  const inkQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  inkQuad.frustumCulled = false
  scene.add(inkQuad)

  const target = new THREE.WebGLRenderTarget(2, 2, {
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  })

  const displayMaterial = new THREE.ShaderMaterial({
    uniforms: { tMap: { value: target.texture } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tMap;
      varying vec2 vUv;
      void main() { gl_FragColor = texture2D(tMap, vUv); }
    `,
    depthTest: false,
    depthWrite: false,
  })
  const display = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), displayMaterial)
  display.frustumCulled = false
  display.renderOrder = -1

  return {
    material,
    scene,
    camera,
    target,
    display,
    dispose() {
      inkQuad.geometry.dispose()
      material.dispose()
      display.geometry.dispose()
      displayMaterial.dispose()
      target.dispose()
    },
  }
}

/** Ink target resolution as a fraction of the canvas, and a ceiling so wide monitors stay cheap. */
const INK_SCALE = 0.5
const INK_MAX_WIDTH = 900

export function HeroScene({ morphProgress, palette }: { morphProgress: RefObject<number>; palette?: InkPalette }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  const isCompact = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const hostElement = host

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.set(0, 0, 5)

    // No MSAA: the full-screen layer is a soft texture and the points/lines are tiny, so it buys nothing.
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'default' })
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    hostElement.appendChild(renderer.domElement)

    const ink = createInkLayer(palette)
    scene.add(ink.display)

    const timer = new THREE.Timer()
    timer.connect(document)
    timer.update()

    const pointer = new THREE.Vector2(0, 0) as PointerWorld
    pointer.userData = { targetX: 0, targetY: 0 }

    // Quality tiers: 0 = full, 1 = ink at 12 fps and DPR 1, 2 = ink nearly still. Only ever steps down.
    let tier = 0
    let pixelRatioCap = isCompact ? 1 : 1.5
    let inkInterval = 1 / 24
    let inkClock = 0
    let inkDirty = true
    let dropsActiveUntil = 0
    let frameMsAverage = 16
    let framesSinceCheck = 0

    let width = 1
    let height = 1
    let viewport: Viewport = { width: 1, height: 1 }
    let particles: ReturnType<typeof createParticleField> | null = null

    let rafId = 0
    let visible = true
    let contextLost = false
    let resizeTimer = 0
    let firstObserverCall = true

    function applyPixelRatio() {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap))
    }

    function resizeRenderer() {
      const rect = hostElement.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      applyPixelRatio()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      viewport = getViewport(camera, width, height)

      const scale = Math.min(INK_SCALE * (tier >= 1 ? 0.75 : 1), INK_MAX_WIDTH / width)
      ink.target.setSize(Math.max(2, Math.round(width * scale)), Math.max(2, Math.round(height * scale)))
      inkDirty = true
    }

    function rebuildParticles() {
      if (particles) {
        scene.remove(particles.group)
        disposeObject(particles.group)
      }
      particles = createParticleField(isCompact ? 160 : 360, viewport)
      scene.add(particles.group)
    }

    function renderInk() {
      renderer.setRenderTarget(ink.target)
      renderer.render(ink.scene, ink.camera)
      renderer.setRenderTarget(null)
    }

    function drawStatic() {
      if (contextLost) return
      renderInk()
      renderer.render(scene, camera)
    }

    // Canvas UV maps into the ink plane UV through the same 1.4x margin the shader uses.
    function canvasUvToPlaneUv(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      const u = (event.clientX - rect.left) / Math.max(rect.width, 1)
      const v = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1)
      return { u: 0.5 + (u - 0.5) / 1.4, v: 0.5 + (v - 0.5) / 1.4 }
    }

    const lastTrailDrop = { u: -1, v: -1 }

    function dropAt(u: number, v: number, strength: number) {
      addInkDrop(ink.material, u, v, strength)
      inkDirty = true
      dropsActiveUntil = timer.getElapsed() + 4
    }

    function updatePointer(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1
      const y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1)
      pointer.userData.targetX = x * viewport.width * 0.5
      pointer.userData.targetY = y * viewport.height * 0.5

      // Dragging draws an ink trail: light drops spaced out along the path.
      if (!reduceMotion && (event.buttons & 1) === 1) {
        const { u, v } = canvasUvToPlaneUv(event)
        const du = u - lastTrailDrop.u
        const dv = v - lastTrailDrop.v
        if (du * du + dv * dv > 0.012) {
          dropAt(u, v, 0.4)
          lastTrailDrop.u = u
          lastTrailDrop.v = v
        }
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (reduceMotion) return
      const { u, v } = canvasUvToPlaneUv(event)
      dropAt(u, v, 1)
      lastTrailDrop.u = u
      lastTrailDrop.v = v
    }

    function resetPointer() {
      pointer.userData.targetX = 0
      pointer.userData.targetY = 0
    }

    function stepDownQuality() {
      if (tier >= 2) return
      tier += 1
      pixelRatioCap = 1
      inkInterval = tier === 1 ? 1 / 12 : 1 / 4
      resizeRenderer()
    }

    function frame(timestamp?: number) {
      rafId = requestAnimationFrame(frame)
      timer.update(timestamp)
      const delta = Math.min(timer.getDelta(), 0.1)
      const elapsed = timer.getElapsed()
      const morph = THREE.MathUtils.clamp(morphProgress.current ?? 0, 0, 1)

      ink.material.uniforms.uTime.value += delta
      const pointerUniform = ink.material.uniforms.uPointer.value
      pointerUniform.x += (pointer.x / Math.max(viewport.width, 1) + 0.5 - pointerUniform.x) * 0.03
      pointerUniform.y += (pointer.y / Math.max(viewport.height, 1) + 0.5 - pointerUniform.y) * 0.03

      inkClock += delta
      const interval = elapsed < dropsActiveUntil && tier < 2 ? Math.min(inkInterval, 1 / 30) : inkInterval
      if (inkDirty || inkClock >= interval) {
        inkClock = 0
        inkDirty = false
        renderInk()
      }

      particles?.update({ delta, elapsed, morph, pointer, reduceMotion: false })
      renderer.render(scene, camera)

      // Watch the real frame time and drop quality if this machine cannot keep up.
      frameMsAverage = frameMsAverage * 0.94 + delta * 1000 * 0.06
      if (++framesSinceCheck >= 90) {
        framesSinceCheck = 0
        if (frameMsAverage > 26) stepDownQuality()
      }
    }

    // Only animate while the canvas is on screen, the tab is visible and the context is alive.
    function sync() {
      const shouldRun = visible && !document.hidden && !contextLost && !reduceMotion
      if (shouldRun && !rafId) {
        timer.update()
        rafId = requestAnimationFrame(frame)
      } else if (!shouldRun && rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    }

    function handleContextLost(event: Event) {
      event.preventDefault()
      contextLost = true
      sync()
    }

    function handleContextRestored() {
      contextLost = false
      renderer.resetState()
      ink.material.needsUpdate = true
      inkDirty = true
      sync()
      if (reduceMotion) drawStatic()
    }

    resizeRenderer()
    rebuildParticles()
    if (reduceMotion) drawStatic()
    else sync()

    const resizeObserver = new ResizeObserver(() => {
      if (firstObserverCall) {
        firstObserverCall = false
        return
      }
      resizeRenderer()
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        rebuildParticles()
        if (!rafId) drawStatic()
      }, 150)
    })
    resizeObserver.observe(hostElement)

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { rootMargin: '120px' },
    )
    intersection.observe(hostElement)

    document.addEventListener('visibilitychange', sync)
    const canvas = renderer.domElement
    canvas.addEventListener('pointermove', updatePointer)
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointerleave', resetPointer)
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      cancelAnimationFrame(rafId)
      rafId = 0
      window.clearTimeout(resizeTimer)
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', sync)
      canvas.removeEventListener('pointermove', updatePointer)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointerleave', resetPointer)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      timer.dispose()
      if (particles) disposeObject(particles.group)
      ink.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }, [isCompact, morphProgress, reduceMotion, palette])

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />
}
