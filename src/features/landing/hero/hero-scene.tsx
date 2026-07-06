import { Suspense, useEffect, useRef, type RefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ShaderBackground } from './shader-background'
import { ParticleField } from './particle-field'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/use-media-query'

/**
 * Attach webglcontextlost / webglcontextrestored event listeners to the
 * R3F canvas so a GPU context crash doesn't permanently freeze the hero.
 * Pauses the render loop on loss, resumes on restore.
 */
function useWebGLContextLifecycle() {
  const gl = useThree((s) => s.gl)
  const setFrameloop = useThree((s) => s.set)
  const contextLost = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement

    function onLost(event: Event) {
      event.preventDefault() // tell the browser we'll handle recovery
      contextLost.current = true
      setFrameloop({ frameloop: 'never' })
    }

    function onRestored() {
      contextLost.current = false
      // Force renderer state reset after context restore — the GPU lost
      // all textures, programs, etc. so we need to let R3F re-initialise.
      gl.resetState()
      setFrameloop({ frameloop: 'always' })
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [gl, setFrameloop])
}

/**
 * Disposes Three.js objects when this component unmounts to prevent leaking
 * GPU memory and WebGL contexts across route navigations.
 */
function useCleanupOnUnmount() {
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    return () => {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          const mat = obj.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat?.dispose()
        }
      })
      gl.dispose()
    }
  }, [gl, scene])
}

/** Inner scene that lives inside the R3F Canvas and can use R3F hooks. */
function SceneContent({
  morphProgress,
  isCompact,
  reduceMotion,
}: {
  morphProgress: RefObject<number>
  isCompact: boolean
  reduceMotion: boolean
}) {
  useWebGLContextLifecycle()
  useCleanupOnUnmount()

  return (
    <Suspense fallback={null}>
      <ShaderBackground reduceMotion={reduceMotion} />
      <ParticleField
        morphProgress={morphProgress}
        count={isCompact ? 220 : 480}
        reduceMotion={reduceMotion}
      />
    </Suspense>
  )
}

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
      <SceneContent
        morphProgress={morphProgress}
        isCompact={isCompact}
        reduceMotion={reduceMotion}
      />
    </Canvas>
  )
}
