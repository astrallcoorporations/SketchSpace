import { Suspense, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { ShaderBackground } from './shader-background'
import { ParticleField } from './particle-field'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/use-media-query'

export function HeroScene({ morphProgress }: { morphProgress: RefObject<number> }) {
  const reduceMotion = usePrefersReducedMotion()
  const isCompact = useMediaQuery('(max-width: 768px)')

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, isCompact ? 1.5 : 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <Suspense fallback={null}>
        <ShaderBackground reduceMotion={reduceMotion} />
        <ParticleField
          morphProgress={morphProgress}
          count={isCompact ? 220 : 480}
          reduceMotion={reduceMotion}
        />
      </Suspense>
    </Canvas>
  )
}
