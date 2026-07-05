import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { createInkShaderMaterial } from './ink-shader-material'

export function ShaderBackground({ reduceMotion }: { reduceMotion: boolean }) {
  const material = useMemo(() => createInkShaderMaterial(), [])
  const pointerTarget = useRef({ x: 0.5, y: 0.5 })
  const viewport = useThree((state) => state.viewport)

  useFrame((state, delta) => {
    if (!reduceMotion) {
      material.uniforms.uTime.value += delta
    }
    pointerTarget.current.x = state.pointer.x * 0.5 + 0.5
    pointerTarget.current.y = state.pointer.y * 0.5 + 0.5
    const pointer = material.uniforms.uPointer.value
    pointer.x += (pointerTarget.current.x - pointer.x) * 0.03
    pointer.y += (pointerTarget.current.y - pointer.y) * 0.03
  })

  return (
    <mesh scale={[viewport.width * 1.4, viewport.height * 1.4, 1]} position={[0, 0, -1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
