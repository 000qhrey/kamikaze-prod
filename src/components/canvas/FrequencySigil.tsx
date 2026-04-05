'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useState, useEffect, Suspense } from 'react'
import {
  Points,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
} from 'three'
import { Genre, GENRE_FREQUENCIES } from '@/data/signals'
import { useIsMobile } from '@/hooks/useIsMobile'

// Shared state for cross-component communication
let activeGenre: Genre | null = null
let isHovering = false
const listeners: Set<() => void> = new Set()

export function setActiveFrequency(genre: Genre | null, hover: boolean) {
  activeGenre = genre
  isHovering = hover
  listeners.forEach((fn) => fn())
}

function getActiveFrequency() {
  return { genre: activeGenre, isHovering }
}

interface WaveformParticlesProps {
  count?: number
}

function WaveformParticles({ count = 2000 }: WaveformParticlesProps) {
  const points = useRef<Points>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)

  // Current animation state
  const state = useRef({
    curl: 1.5,
    speed: 0.5,
    color: new Color('#cc0000'),
    intensity: 0.5,
    targetCurl: 1.5,
    targetSpeed: 0.5,
    targetColor: new Color('#cc0000'),
    targetIntensity: 0.5,
    shake: 0,
  })

  // Listen for frequency changes
  useEffect(() => {
    const update = () => {
      const { genre, isHovering } = getActiveFrequency()
      if (genre && GENRE_FREQUENCIES[genre]) {
        const freq = GENRE_FREQUENCIES[genre]
        state.current.targetCurl = freq.curl
        state.current.targetSpeed = freq.speed
        state.current.targetColor.set(freq.color)
        state.current.targetIntensity = freq.intensity
        state.current.shake = isHovering ? 1.0 : 0
      } else {
        // Default idle state
        state.current.targetCurl = 1.5
        state.current.targetSpeed = 0.5
        state.current.targetColor.set('#cc0000')
        state.current.targetIntensity = 0.5
        state.current.shake = 0
      }
    }
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  // Create particle positions in a ring/wave pattern
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Arrange in multiple concentric rings
      const ring = Math.floor(i / (count / 5))
      const angle = (i / (count / 5)) * Math.PI * 2
      const radius = 2 + ring * 0.8

      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5
      pos[i * 3 + 2] = Math.sin(angle) * radius

      // Random velocity for curl noise
      vel[i * 3] = (Math.random() - 0.5) * 0.1
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.1
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }

    return [pos, vel]
  }, [count])

  // Shader material for particles
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color('#cc0000') },
        uIntensity: { value: 0.5 },
        uSize: { value: 3.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        attribute vec3 velocity;
        varying float vAlpha;

        void main() {
          vec3 pos = position;

          // Add wave motion
          float wave = sin(pos.x * 0.5 + uTime * 2.0) * 0.3;
          wave += cos(pos.z * 0.5 + uTime * 1.5) * 0.2;
          pos.y += wave;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = uSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          // Alpha based on position
          vAlpha = 0.3 + abs(sin(pos.x + pos.z + uTime)) * 0.7;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying float vAlpha;

        void main() {
          // Circular point with glow
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;

          float alpha = (1.0 - d * 2.0) * vAlpha * uIntensity;
          vec3 color = uColor + vec3(0.2) * (1.0 - d * 2.0);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame((_, delta) => {
    if (!points.current || !materialRef.current) return

    const s = state.current
    const t = materialRef.current.uniforms.uTime.value + delta

    // Lerp current values toward targets
    s.curl = MathUtils.lerp(s.curl, s.targetCurl, 0.1)
    s.speed = MathUtils.lerp(s.speed, s.targetSpeed, 0.1)
    s.intensity = MathUtils.lerp(s.intensity, s.targetIntensity, 0.1)
    s.color.lerp(s.targetColor, 0.1)
    s.shake *= 0.95 // Decay shake

    // Update uniforms
    materialRef.current.uniforms.uTime.value = t * s.speed
    materialRef.current.uniforms.uColor.value = s.color
    materialRef.current.uniforms.uIntensity.value = s.intensity

    // Animate particle positions with curl noise
    const posAttr = points.current.geometry.attributes.position
    const posArray = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2

      // Original ring position
      const ring = Math.floor(i / (count / 5))
      const angle = (i / (count / 5)) * Math.PI * 2 + t * 0.2
      const baseRadius = 2 + ring * 0.8

      // Curl noise displacement
      const noiseX = Math.sin(angle * s.curl + t) * 0.3
      const noiseZ = Math.cos(angle * s.curl + t) * 0.3
      const noiseY = Math.sin(t * 2 + i * 0.01) * 0.2 * s.intensity

      // Shake effect
      const shakeX = s.shake > 0.01 ? (Math.random() - 0.5) * s.shake * 0.5 : 0
      const shakeY = s.shake > 0.01 ? (Math.random() - 0.5) * s.shake * 0.3 : 0
      const shakeZ = s.shake > 0.01 ? (Math.random() - 0.5) * s.shake * 0.5 : 0

      posArray[ix] = Math.cos(angle) * baseRadius + noiseX + shakeX
      posArray[iy] = noiseY + shakeY
      posArray[iz] = Math.sin(angle) * baseRadius + noiseZ + shakeZ
    }

    posAttr.needsUpdate = true

    // Rotate entire system slowly
    points.current.rotation.y += delta * 0.1
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-velocity" args={[velocities, 3]} />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  )
}

function FrequencyRing() {
  const ringRef = useRef<Mesh>(null!)
  const state = useRef({
    color: new Color('#cc0000'),
    targetColor: new Color('#cc0000'),
    intensity: 0.3,
    targetIntensity: 0.3,
  })

  useEffect(() => {
    const update = () => {
      const { genre } = getActiveFrequency()
      if (genre && GENRE_FREQUENCIES[genre]) {
        const freq = GENRE_FREQUENCIES[genre]
        state.current.targetColor.set(freq.color)
        state.current.targetIntensity = freq.intensity * 0.5
      } else {
        state.current.targetColor.set('#cc0000')
        state.current.targetIntensity = 0.3
      }
    }
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  useFrame((_, delta) => {
    if (!ringRef.current) return

    const s = state.current
    s.color.lerp(s.targetColor, 0.1)
    s.intensity = MathUtils.lerp(s.intensity, s.targetIntensity, 0.1)

    const mat = ringRef.current.material as MeshBasicMaterial
    mat.color = s.color
    mat.opacity = s.intensity

    ringRef.current.rotation.z += delta * 0.05
  })

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[5.5, 5.7, 64]} />
      <meshBasicMaterial
        color="#cc0000"
        transparent
        opacity={0.3}
        side={DoubleSide}
      />
    </mesh>
  )
}

function Scene({ isMobile }: { isMobile: boolean }) {
  // Mobile: 500 particles | Desktop: 1500 particles
  const particleCount = isMobile ? 500 : 1500

  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.1} />
      <WaveformParticles count={particleCount} />
      <FrequencyRing />
    </>
  )
}

function LoadingFallback() {
  return null
}

export default function FrequencySigil() {
  const [canRender, setCanRender] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        setCanRender(true)
      }
    } catch {
      console.warn('[FrequencySigil] WebGL not available')
    }
  }, [])

  if (!canRender) {
    return null
  }

  // Mobile: lower DPR, no antialiasing | Desktop: full quality
  const dpr: [number, number] = isMobile ? [1, 1] : [1, 1.5]

  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <Canvas
        camera={{ position: [0, 8, 0], fov: 50 }}
        dpr={dpr}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
