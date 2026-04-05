'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useRef, useMemo, useState, useEffect, Suspense } from 'react'
import {
  Points,
  ShaderMaterial,
  Color,
  AdditiveBlending,
  MathUtils,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  DoubleSide,
  Vector2,
  LineSegments,
} from 'three'
import { getScrollVelocity, getRawScrollVelocity } from '@/hooks/useScrollStore'
import { getBass, getMids, getHighs, getIsSwitching } from '@/hooks/useAudioEngine'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Genre, GENRE_FREQUENCIES } from '@/data/signals'

// ============================================
// SHARED STATE FOR GENRE FREQUENCY
// ============================================
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

// ============================================
// DATA DUST PARTICLE STREAM
// Thousands of 1px particles flowing with scroll velocity
// ============================================
interface DataDustProps {
  count?: number
}

function DataDust({ count = 4000 }: DataDustProps) {
  const points = useRef<Points>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)

  // Particle state
  const state = useRef({
    baseSpeed: 0.3,
    scrollMultiplier: 0,
    color: new Color('#00cccc'),
    targetColor: new Color('#00cccc'),
  })

  // Listen for genre changes
  useEffect(() => {
    const update = () => {
      const { genre } = getActiveFrequency()
      if (genre && GENRE_FREQUENCIES[genre]) {
        state.current.targetColor.set(GENRE_FREQUENCIES[genre].color)
      } else {
        state.current.targetColor.set('#00cccc')
      }
    }
    listeners.add(update)
    return () => { listeners.delete(update) }
  }, [])

  // Create particle positions distributed in a cylinder around the camera
  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count * 4) // xyz for variation, w for "ping" probability

    for (let i = 0; i < count; i++) {
      // Distribute in a cylinder: some near camera, some far
      const angle = Math.random() * Math.PI * 2
      const radius = 1 + Math.random() * 8 // 1-9 units from center
      const depth = (Math.random() - 0.5) * 30 // -15 to +15 Z (before and behind camera)

      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10 // Y spread
      pos[i * 3 + 2] = depth

      // Seeds for variation
      seed[i * 4] = Math.random()
      seed[i * 4 + 1] = Math.random()
      seed[i * 4 + 2] = Math.random()
      seed[i * 4 + 3] = Math.random() // Ping probability (rare = < 0.02)
    }

    return [pos, seed]
  }, [count])

  // Shader for data dust
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color('#00cccc') },
        uScrollVelocity: { value: 0 },
        uBass: { value: 0 },
        uPointSize: { value: 2.0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uScrollVelocity;
        uniform float uPointSize;
        uniform float uBass;
        attribute vec4 seed;
        varying float vAlpha;
        varying float vPing;

        void main() {
          vec3 pos = position;

          // Base drift motion (slow ambient flow)
          float drift = uTime * 0.5 + seed.x * 6.28;
          pos.x += sin(drift + seed.y * 10.0) * 0.3;
          pos.y += cos(drift * 0.7 + seed.z * 10.0) * 0.2;

          // Scroll-driven Z motion (the "lightspeed" effect)
          // Positive velocity = scrolling down = particles fly toward camera
          float scrollSpeed = uScrollVelocity * 15.0;
          pos.z += scrollSpeed;

          // Wrap particles that go too far (creates infinite stream)
          float wrapRange = 30.0;
          pos.z = mod(pos.z + wrapRange * 0.5, wrapRange) - wrapRange * 0.5;

          // Bass pulse - particles expand outward on kick
          float bassExpand = uBass * 0.5;
          pos.xy *= 1.0 + bassExpand * (0.5 + seed.w);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          // Size: closer = larger, with scroll stretch
          float baseSize = uPointSize;
          float stretchFactor = 1.0 + abs(uScrollVelocity) * 3.0;
          gl_PointSize = baseSize * stretchFactor * (200.0 / -mvPosition.z);

          gl_Position = projectionMatrix * mvPosition;

          // Alpha: distance fade + occasional ping
          float distFade = smoothstep(15.0, 3.0, -mvPosition.z);
          vAlpha = distFade * (0.3 + seed.x * 0.4);

          // Ping effect: rare particles flash white when near center
          vPing = step(0.98, seed.w) * step(abs(pos.x), 0.5) * step(abs(pos.y), 0.5) * uBass;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        varying float vPing;

        void main() {
          // Circular point
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;

          // Soft edge
          float alpha = (1.0 - d * 2.0) * vAlpha;

          // Color: red base, white ping
          vec3 color = mix(uColor, vec3(1.0), vPing);

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
    const uniforms = materialRef.current.uniforms

    // Update time
    uniforms.uTime.value += delta

    // Get scroll velocity (drives the "lightspeed" effect)
    const scrollVel = getScrollVelocity()
    s.scrollMultiplier = MathUtils.lerp(s.scrollMultiplier, scrollVel, 0.15)
    uniforms.uScrollVelocity.value = s.scrollMultiplier

    // Get bass for pulse effect
    const bass = getBass()
    uniforms.uBass.value = bass

    // Lerp color toward target
    s.color.lerp(s.targetColor, 0.1)
    uniforms.uColor.value = s.color

    // Slow rotation of entire particle system
    points.current.rotation.y += delta * 0.02
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-seed" args={[seeds, 4]} />
      </bufferGeometry>
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  )
}

// ============================================
// RADAR MESH FLOOR
// Circular grid that glitches on bass
// ============================================
function RadarMesh() {
  const meshRef = useRef<LineSegments>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)

  // Create circular radar grid geometry
  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    const positions: number[] = []

    // Concentric circles
    const ringCount = 12
    const segments = 64
    for (let r = 1; r <= ringCount; r++) {
      const radius = r * 0.8
      for (let s = 0; s < segments; s++) {
        const angle1 = (s / segments) * Math.PI * 2
        const angle2 = ((s + 1) / segments) * Math.PI * 2
        positions.push(Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius)
        positions.push(Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius)
      }
    }

    // Radial lines (like a radar sweep)
    const radialCount = 24
    for (let r = 0; r < radialCount; r++) {
      const angle = (r / radialCount) * Math.PI * 2
      positions.push(0, 0, 0)
      positions.push(Math.cos(angle) * ringCount * 0.8, 0, Math.sin(angle) * ringCount * 0.8)
    }

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  // Shader for the radar with bass glitch
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uColor: { value: new Color('#1a4a4a') },
        uGlitchOffset: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBass;
        uniform float uGlitchOffset;

        varying float vDistance;

        void main() {
          vec3 pos = position;

          // Distance from center for fade
          vDistance = length(pos.xz);

          // Bass ripple: wave propagates outward from center
          float ripple = sin(vDistance * 2.0 - uTime * 8.0) * uBass * 0.3;
          pos.y += ripple;

          // Glitch offset: horizontal jitter on bass hit
          float glitchAmount = uGlitchOffset * step(0.7, uBass);
          pos.x += sin(pos.z * 20.0 + uTime * 50.0) * glitchAmount;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uBass;
        varying float vDistance;

        void main() {
          // Fade with distance from center
          float alpha = smoothstep(10.0, 2.0, vDistance) * 0.3;

          // Brighten on bass
          alpha *= 1.0 + uBass * 0.5;

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame((_, delta) => {
    if (!materialRef.current) return

    const uniforms = materialRef.current.uniforms
    uniforms.uTime.value += delta

    const bass = getBass()
    uniforms.uBass.value = bass

    // Random glitch offset on strong bass hit
    if (bass > 0.6) {
      uniforms.uGlitchOffset.value = (Math.random() - 0.5) * 0.3
    } else {
      uniforms.uGlitchOffset.value *= 0.9
    }
  })

  return (
    <lineSegments
      ref={meshRef}
      geometry={geometry}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
    >
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </lineSegments>
  )
}

// ============================================
// 3D TOROIDAL PULSES
// Rings that exist in 3D space, passing through the scene
// ============================================
function ToroidalPulses() {
  const groupRef = useRef<Group>(null!)
  const ringsRef = useRef<Mesh[]>([])

  // Create multiple rings at different phases
  const ringCount = 5
  const rings = useMemo(() => {
    return Array.from({ length: ringCount }, (_, i) => ({
      phase: i / ringCount, // Stagger phases
      baseRadius: 2,
      maxRadius: 12,
      speed: 0.8 + Math.random() * 0.4,
    }))
  }, [])

  // Shared ring material
  const ringMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: 0 },
        uBass: { value: 0 },
        uColor: { value: new Color('#00cccc') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vAngle;

        void main() {
          vUv = uv;
          // Calculate angle for scale marks
          vAngle = atan(position.y, position.x);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uPhase;
        uniform float uBass;
        varying vec2 vUv;
        varying float vAngle;

        void main() {
          // Ring fades as it expands (phase-based)
          float fadeOut = 1.0 - uPhase;
          float alpha = fadeOut * 0.6;

          // Scale marks: thin lines at regular intervals
          float marks = step(0.98, fract(vAngle * 8.0 / 3.14159));
          alpha += marks * fadeOut * 0.3;

          // Bass brightens
          alpha *= 1.0 + uBass * 0.5;

          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    })
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const t = state.clock.getElapsedTime()
    const bass = getBass()

    rings.forEach((ring, i) => {
      const mesh = ringsRef.current[i]
      if (!mesh) return

      // Animate phase (0 to 1 loop)
      ring.phase = (ring.phase + delta * ring.speed * 0.3) % 1

      // Scale based on phase (small -> large)
      const scale = ring.baseRadius + ring.phase * (ring.maxRadius - ring.baseRadius)
      mesh.scale.set(scale, scale, 1)

      // Move in Z to create depth (rings pass through the scene)
      mesh.position.z = -5 + ring.phase * 15 // -5 to +10

      // Update material uniforms
      const mat = mesh.material as ShaderMaterial
      if (mat.uniforms) {
        mat.uniforms.uPhase.value = ring.phase
        mat.uniforms.uBass.value = bass
        mat.uniforms.uTime.value = t
      }

      // Slight wobble rotation
      mesh.rotation.x = Math.sin(t * 0.5 + i) * 0.1
      mesh.rotation.y = Math.cos(t * 0.3 + i) * 0.1
    })

    // Slow group rotation
    groupRef.current.rotation.z += delta * 0.05
  })

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el }}
        >
          <ringGeometry args={[0.95, 1, 64]} />
          <primitive object={ringMaterial.clone()} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

// ============================================
// ATMOSPHERE SHADER (Background plane)
// Scanlines, vignette, bass strobe
// ============================================
function AtmospherePlane() {
  const meshRef = useRef<Mesh>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)

  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uResolution: { value: new Vector2(1920, 1080) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uBass;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
          // Base "dirty black" - not pure black
          vec3 color = vec3(0.02);

          // Vignette: edges darker than center
          float vignette = distance(vUv, vec2(0.5));
          vignette = smoothstep(0.2, 0.8, vignette);
          color -= vignette * 0.015;

          // Scanlines: subtle moving horizontal lines
          float scanline = sin(vUv.y * uResolution.y * 0.5 + uTime * 2.0) * 0.5 + 0.5;
          scanline = smoothstep(0.3, 0.7, scanline);
          color -= scanline * 0.008;

          // Bass strobe: slight brightness pulse on kick
          float strobe = uBass * 0.03;
          color += strobe;

          // Clamp to prevent negative
          color = max(color, vec3(0.0));

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    })
  }, [])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    materialRef.current.uniforms.uTime.value += delta
    materialRef.current.uniforms.uBass.value = getBass()
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -20]} renderOrder={-1000}>
      <planeGeometry args={[100, 100]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  )
}

// ============================================
// POST-PROCESSING
// Downsampled bloom for performance
// Desktop: Full effects | Mobile: Minimal
// ============================================
function PostProcessing({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    // Mobile: Just bloom and vignette
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.1}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.2}
          mipmapBlur
          radius={0.2}
        />
        <Vignette darkness={0.3} offset={0.3} />
      </EffectComposer>
    )
  }

  // Desktop: Full effects
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.15}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.3}
      />
      <ChromaticAberration
        offset={new Vector2(0.0005, 0.0005)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
      <Vignette darkness={0.4} offset={0.3} />
    </EffectComposer>
  )
}

// ============================================
// MAIN SCENE
// Desktop: Full effects | Mobile: Reduced particles
// ============================================
function Scene({ isMobile }: { isMobile: boolean }) {
  // Mobile: 200 particles | Desktop: 600 particles
  const particleCount = isMobile ? 200 : 600

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 8, 30]} />

      {/* Ambient light - very dim */}
      <ambientLight intensity={0.05} />

      {/* Main red point light */}
      <pointLight position={[0, 3, 5]} color="#00cccc" intensity={1.5} distance={20} />
      <pointLight position={[0, -3, -5]} color="#004040" intensity={0.8} distance={15} />

      {/* Atmosphere background */}
      <AtmospherePlane />

      {/* Data Dust particle stream - reduced on mobile */}
      <DataDust count={particleCount} />

      {/* Radar mesh floor - disable on mobile for performance */}
      {!isMobile && <RadarMesh />}

      {/* 3D Toroidal pulses - disabled, too organic */}
      {/* <ToroidalPulses /> */}

      {/* Post-processing */}
      <PostProcessing isMobile={isMobile} />
    </>
  )
}

// ============================================
// MAIN COMPONENT EXPORT
// ============================================
export default function NeuralVoid() {
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
      console.warn('[NeuralVoid] WebGL not available')
    }
  }, [])

  if (!canRender) {
    return null
  }

  // Mobile: lower DPR | Desktop: standard
  const dpr: [number, number] = isMobile ? [1, 1] : [1, 1.5]

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={dpr}
        gl={{
          antialias: false, // Disable for perf (bloom will hide jaggies)
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <Suspense fallback={null}>
          <Scene isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
