import { useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

type Edge = [number, number]

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

/** Loose spiral — the "organized" shape particles settle into as you scroll. */
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

/** Precompute each node's 2 nearest neighbors once, from the scatter layout. */
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

type ParticleFieldProps = {
  /** 0 = scattered cloud, 1 = fully organized spiral. Written by scroll. */
  morphProgress: RefObject<number>
  count?: number
  reduceMotion: boolean
}

export function ParticleField({ morphProgress, count = 480, reduceMotion }: ParticleFieldProps) {
  const viewport = useThree((state) => state.viewport)
  const width = viewport.width
  const height = viewport.height
  const scale = Math.min(width, height)

  const scatter = useMemo(() => buildScatterPositions(count, width, height), [count, width, height])
  const spiral = useMemo(() => buildSpiralPositions(count, width, height), [count, width, height])
  const edges = useMemo(() => buildEdges(scatter, count, scale * 0.16), [scatter, count, scale])
  const seeds = useMemo(
    () => Float32Array.from({ length: count }, () => Math.random() * Math.PI * 2),
    [count],
  )

  // Working buffers mutated in place every frame — avoids per-frame allocation.
  const positions = useMemo(() => new Float32Array(scatter), [scatter])
  const linePositions = useMemo(() => new Float32Array(edges.length * 2 * 3), [edges])

  const pointsGeometryRef = useRef<THREE.BufferGeometry>(null)
  const linesGeometryRef = useRef<THREE.BufferGeometry>(null)
  const pointerWorld = useRef(new THREE.Vector2(0, 0))

  useFrame((state, delta) => {
    const progress = morphProgress.current ?? 0
    const time = reduceMotion ? 0 : state.clock.elapsedTime

    pointerWorld.current.x += (state.pointer.x * width * 0.5 - pointerWorld.current.x) * Math.min(delta * 4, 1)
    pointerWorld.current.y += (state.pointer.y * height * 0.5 - pointerWorld.current.y) * Math.min(delta * 4, 1)

    const driftStrength = reduceMotion ? 0 : (1 - progress) * scale * 0.02
    const repelStrength = (1 - progress * 0.6) * scale * 0.09
    const repelRadius = scale * 0.22

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const baseX = THREE.MathUtils.lerp(scatter[i3], spiral[i3], progress)
      const baseY = THREE.MathUtils.lerp(scatter[i3 + 1], spiral[i3 + 1], progress)
      const baseZ = THREE.MathUtils.lerp(scatter[i3 + 2], spiral[i3 + 2], progress)

      const seed = seeds[i]
      let x = baseX + Math.sin(time * 0.4 + seed) * driftStrength
      let y = baseY + Math.cos(time * 0.35 + seed * 1.7) * driftStrength
      const z = baseZ

      const dx = x - pointerWorld.current.x
      const dy = y - pointerWorld.current.y
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

    const pointsAttr = pointsGeometryRef.current?.attributes.position as
      | THREE.BufferAttribute
      | undefined
    if (pointsAttr) pointsAttr.needsUpdate = true

    const linesGeometry = linesGeometryRef.current
    if (linesGeometry) {
      let cursor = 0
      for (const [a, b] of edges) {
        linePositions[cursor++] = positions[a * 3]
        linePositions[cursor++] = positions[a * 3 + 1]
        linePositions[cursor++] = positions[a * 3 + 2]
        linePositions[cursor++] = positions[b * 3]
        linePositions[cursor++] = positions[b * 3 + 1]
        linePositions[cursor++] = positions[b * 3 + 2]
      }
      const linesAttr = linesGeometry.attributes.position as THREE.BufferAttribute
      linesAttr.needsUpdate = true
    }
  })

  return (
    <group>
      <points>
        <bufferGeometry ref={pointsGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={scale * 0.006}
          color="#8b5cf6"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry ref={linesGeometryRef}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
