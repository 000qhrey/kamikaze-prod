'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef, useEffect, useMemo, useState, Suspense } from 'react'
import { Color, Group, Mesh, MeshStandardMaterial, MathUtils } from 'three'
import { getAssetPath } from '@/lib/basePath'
import { useIsMobile } from '@/hooks/useIsMobile'

// Configure Draco decoder (local for faster loading)
useGLTF.setDecoderPath(getAssetPath('/draco/'))

// Cached colors to avoid creating new objects every frame
const ARTERIAL_RED = new Color('#CC0000')
const SIGNAL_GREEN = new Color('#00ff41')
const TEMP_COLOR = new Color()

interface CyberFanModelProps {
  progress: number // 0-1 countdown progress
}

function CyberFanModel({ progress }: CyberFanModelProps) {
  const group = useRef<Group>(null!)
  const modelPath = getAssetPath('/cyberfan.glb')

  const { scene } = useGLTF(modelPath, true)

  // Smoothed values
  const smoothProgress = useRef(0)
  const smoothEmissive = useRef(0)

  // Create ritual materials - void black base with arterial red emission
  const ritualMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#0a0a0a', // void black
        emissive: '#CC0000', // arterial red
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.2,
      }),
    []
  )

  // Clone scene and apply materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        mesh.material = ritualMaterial.clone()
      }
    })
    return clone
  }, [scene, ritualMaterial])

  // Store meshes for material updates
  const meshesRef = useRef<Mesh[]>([])
  useEffect(() => {
    const meshes: Mesh[] = []
    clonedScene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        meshes.push(child as Mesh)
      }
    })
    meshesRef.current = meshes
  }, [clonedScene])

  useFrame((state, delta) => {
    if (!group.current) return

    const t = state.clock.getElapsedTime()

    // Smooth progress for lerping
    smoothProgress.current = MathUtils.lerp(smoothProgress.current, progress, 0.05)

    // Slow ritual rotation - speed increases with progress
    const rotationSpeed = 0.1 + smoothProgress.current * 0.2
    group.current.rotation.y += delta * rotationSpeed

    // Subtle breathing/float
    const breathe = Math.sin(t * 0.5) * 0.1
    group.current.position.y = breathe

    // Pulse rate increases with progress (for emissive intensity)
    const pulseSpeed = 1 + smoothProgress.current * 2
    const pulse = Math.sin(t * pulseSpeed) * 0.5 + 0.5

    // Emissive intensity increases with progress
    const baseEmissive = 0.2 + smoothProgress.current * 0.8
    const targetEmissive = baseEmissive + pulse * smoothProgress.current * 0.5
    smoothEmissive.current = MathUtils.lerp(smoothEmissive.current, targetEmissive, 0.1)

    // Update materials - shift toward signal green as progress approaches 1
    // Use cached colors to avoid GC pressure
    TEMP_COLOR.copy(ARTERIAL_RED).lerp(SIGNAL_GREEN, smoothProgress.current * 0.3)

    meshesRef.current.forEach((mesh) => {
      const mat = mesh.material as MeshStandardMaterial
      mat.emissiveIntensity = smoothEmissive.current
      mat.emissive.lerp(TEMP_COLOR, 0.02)
    })
  })

  return <primitive ref={group} object={clonedScene} scale={2} />
}

// Removed heavy post-processing (Bloom/Vignette) for performance
// The emissive materials provide sufficient glow effect

function LoadingFallback() {
  return (
    <mesh>
      <torusGeometry args={[1, 0.1, 8, 32]} />
      <meshStandardMaterial color="#CC0000" wireframe />
    </mesh>
  )
}

function Scene({ progress }: { progress: number }) {
  return (
    <>
      {/* Ambient - slightly increased to compensate for removed Environment */}
      <ambientLight intensity={0.25} />

      {/* Key light - arterial red */}
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#CC0000" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#400000" />

      {/* Progress-reactive accent light */}
      <pointLight
        position={[0, 3, 0]}
        intensity={progress * 0.5}
        color="#CC0000"
      />

      <CyberFanModel progress={progress} />
    </>
  )
}

interface CyberFanSigilProps {
  progress: number // 0-1 countdown progress
  className?: string
}

export function CyberFanSigil({ progress, className }: CyberFanSigilProps) {
  const [canRender, setCanRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        setCanRender(true)
      }
    } catch {
      console.warn('[CyberFanSigil] WebGL not available')
    }
  }, [])

  // Lazy render - only when in viewport
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (!canRender) {
    // Fallback for no WebGL - show simple CSS sigil
    return (
      <div
        ref={containerRef}
        className={`w-64 h-64 flex items-center justify-center ${className || ''}`}
      >
        <div
          className="w-32 h-32 border border-arterial/50 rotate-45"
          style={{
            boxShadow: `0 0 ${20 + progress * 30}px rgba(204, 0, 0, ${0.3 + progress * 0.3})`,
          }}
        />
      </div>
    )
  }

  // Mobile: lower DPR, no antialiasing | Desktop: full quality
  const dpr: [number, number] = isMobile ? [1, 1] : [1, 1.5]

  return (
    <div
      ref={containerRef}
      className={`w-80 h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] ${className || ''}`}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={dpr}
        frameloop={isVisible ? 'always' : 'demand'}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload model
useGLTF.preload(getAssetPath('/cyberfan.glb'), true)
