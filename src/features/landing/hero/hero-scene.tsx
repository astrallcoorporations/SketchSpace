import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { createInkShaderMaterial, type InkShaderMaterial } from './ink-shader-material'
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

function getViewport(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
  const size = renderer.getSize(new THREE.Vector2())
  const aspect = size.x / Math.max(size.y, 1)
  const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z
  return { width: height * aspect, height }
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

function createShaderBackground(viewport: { width: number; height: number }) {
  const geometry = new THREE.PlaneGeometry(1, 1)
  const material = createInkShaderMaterial()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, -1)
  mesh.scale.set(viewport.width * 1.4, viewport.height * 1.4, 1)
  return mesh as THREE.Mesh<THREE.PlaneGeometry, InkShaderMaterial>
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
      color: '#d4a656',
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
      color: '#d4a656',
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

export function HeroScene({ morphProgress }: { morphProgress: RefObject<number> }) {
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

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.5 : 2))
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    hostElement.appendChild(renderer.domElement)

    const timer = new THREE.Timer()
    timer.connect(document)
    timer.update()

    const pointer = new THREE.Vector2(0, 0) as PointerWorld
    pointer.userData = { targetX: 0, targetY: 0 }

    let rafId = 0
    let running = true
    let contextLost = false
    let shaderBackground: ReturnType<typeof createShaderBackground> | null = null
    let particles: ReturnType<typeof createParticleField> | null = null

    function resizeRenderer() {
      const rect = hostElement.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    function rebuildSceneObjects() {
      if (shaderBackground) {
        scene.remove(shaderBackground)
        disposeObject(shaderBackground)
      }
      if (particles) {
        scene.remove(particles.group)
        disposeObject(particles.group)
      }

      const viewport = getViewport(camera, renderer)
      shaderBackground = createShaderBackground(viewport)
      particles = createParticleField(isCompact ? 220 : 480, viewport)
      scene.add(shaderBackground, particles.group)
    }

    function resize() {
      resizeRenderer()
      rebuildSceneObjects()
    }

    function updatePointer(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1
      const y = -(((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1)
      const viewport = getViewport(camera, renderer)
      pointer.userData.targetX = x * viewport.width * 0.5
      pointer.userData.targetY = y * viewport.height * 0.5
    }

    function resetPointer() {
      pointer.userData.targetX = 0
      pointer.userData.targetY = 0
    }

    function animate(timestamp?: number) {
      if (!running || contextLost) return

      rafId = requestAnimationFrame(animate)
      timer.update(timestamp)
      const delta = timer.getDelta()
      const elapsed = timer.getElapsed()
      const morph = THREE.MathUtils.clamp(morphProgress.current ?? 0, 0, 1)

      if (shaderBackground) {
        if (!reduceMotion) shaderBackground.material.uniforms.uTime.value += delta
        const pointerUniform = shaderBackground.material.uniforms.uPointer.value
        const viewport = getViewport(camera, renderer)
        const targetX = pointer.x / Math.max(viewport.width, 1) + 0.5
        const targetY = pointer.y / Math.max(viewport.height, 1) + 0.5
        pointerUniform.x += (targetX - pointerUniform.x) * 0.03
        pointerUniform.y += (targetY - pointerUniform.y) * 0.03
      }

      particles?.update({ delta, elapsed, morph, pointer, reduceMotion })
      renderer.render(scene, camera)
    }

    function handleContextLost(event: Event) {
      event.preventDefault()
      contextLost = true
      cancelAnimationFrame(rafId)
    }

    function handleContextRestored() {
      contextLost = false
      timer.reset()
      renderer.resetState()
      if (shaderBackground) {
        shaderBackground.material.needsUpdate = true
      }
      particles?.markDirty()
      animate()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(hostElement)
    resize()
    animate()

    const canvas = renderer.domElement
    canvas.addEventListener('pointermove', updatePointer)
    canvas.addEventListener('pointerleave', resetPointer)
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointermove', updatePointer)
      canvas.removeEventListener('pointerleave', resetPointer)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      timer.dispose()
      disposeObject(scene)
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }, [isCompact, morphProgress, reduceMotion])

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />
}
