"use client"

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, ContactShadows, Html } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useRef, useEffect, useMemo, useState, Suspense } from 'react'
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PointLight,
  SpotLight,
  Vector2,
  Vector3,
  Color,
  MathUtils,
  LoopRepeat,
  AdditiveBlending,
} from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { getAssetPath } from '@/lib/basePath'
import { getScrollProgress, getScrollSection } from '@/hooks/useScrollStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { getGlitchIntensity } from '@/hooks/useSigilGlitch'
import { getBass, getMids, getHighs, getIsSwitching, getCurrentChannel } from '@/hooks/useAudioEngine'

// Configure drei's useGLTF to use local Draco decoder (faster than CDN)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath(getAssetPath('/draco/'))
dracoLoader.preload()

// Set up the GLTF loader with Draco support
useGLTF.setDecoderPath(getAssetPath('/draco/'))

// Navigation labels that float around the sigil
const NAV_ITEMS = [
  { label: 'EVENTS', href: '/events', angle: -45, distance: 4.5 },
  { label: 'SIGNALS', href: '/artists', angle: 0, distance: 4.5 },
  { label: 'MANIFESTO', href: '/about', angle: 45, distance: 4.5 },
  { label: 'MERCH', href: '/merch', angle: 135, distance: 4.5 },
  { label: 'CONTACT', href: '/contact', angle: 225, distance: 4.5 },
]

function NavLabel({ label, href, angle, distance, hoveredNav, setHoveredNav }: {
  label: string
  href: string
  angle: number
  distance: number
  hoveredNav: string | null
  setHoveredNav: (nav: string | null) => void
}) {
  const ref = useRef<Group>(null!)
  const isHovered = hoveredNav === label

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()

    // Position in a circle around the sigil
    const rad = MathUtils.degToRad(angle + t * 5) // Slow orbit
    ref.current.position.x = Math.cos(rad) * distance
    ref.current.position.z = Math.sin(rad) * distance
    ref.current.position.y = Math.sin(t * 2 + angle) * 0.3 // Subtle bob

    // Always face camera
    ref.current.lookAt(state.camera.position)
  })

  return (
    <group ref={ref}>
      <Html
        center
        distanceFactor={10}
        style={{
          transition: 'all 0.2s ease',
          opacity: isHovered ? 1 : 0.6,
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        }}
      >
        <a
          href={href}
          className="block font-mono text-xs tracking-widest whitespace-nowrap select-none"
          style={{
            color: isHovered ? '#cc0000' : '#666',
            textShadow: isHovered ? '0 0 10px #cc0000' : 'none',
          }}
          onMouseEnter={() => setHoveredNav(label)}
          onMouseLeave={() => setHoveredNav(null)}
        >
          [ GOTO_{label} ]
        </a>
      </Html>
    </group>
  )
}

function SigilModel({ hoveredNav }: { hoveredNav: string | null }) {
  const group = useRef<Group>(null!)
  const modelPath = getAssetPath('/logo.glb')
  const { mouse } = useThree()

  const { scene, animations } = useGLTF(modelPath, true)
  const { actions, mixer } = useAnimations(animations, group)

  // Smoothed values for lerping
  const smoothMouse = useRef({ x: 0, y: 0 })
  const smoothBass = useRef(0)
  const smoothEmissive = useRef(0)

  // Create materials for different states
  const redChrome = useMemo(() => new MeshStandardMaterial({
    color: '#600000',
    emissive: '#400000',
    emissiveIntensity: 0.5,
    metalness: 1,
    roughness: 0.1,
  }), [])

  const silverChrome = useMemo(() => new MeshStandardMaterial({
    color: '#888888',
    emissive: '#222222',
    emissiveIntensity: 0.3,
    metalness: 1,
    roughness: 0.15,
  }), [])

  // Clone scene
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        mesh.material = redChrome.clone()
      }
    })
    return clone
  }, [scene, redChrome])

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

  // Play baked animation
  useEffect(() => {
    const animationNames = Object.keys(actions)
    if (animationNames.length > 0) {
      const action = actions[animationNames[0]]
      if (action) {
        action.reset().play()
        action.setLoop(LoopRepeat, Infinity)
      }
    }
  }, [actions])

  useFrame((state, delta) => {
    if (!group.current) return

    const t = state.clock.getElapsedTime()
    const scrollProgress = getScrollProgress()
    const section = getScrollSection()
    const glitchIntensity = getGlitchIntensity()

    // Get audio data
    const bass = getBass()
    const mids = getMids()

    // Smooth the bass for less jerky movement
    smoothBass.current = MathUtils.lerp(smoothBass.current, bass, 0.3)
    const smoothedBass = smoothBass.current

    // Smooth mouse tracking
    smoothMouse.current.x = MathUtils.lerp(smoothMouse.current.x, mouse.x, 0.1)
    smoothMouse.current.y = MathUtils.lerp(smoothMouse.current.y, mouse.y, 0.1)

    // Base rotation - constant slow spin
    const baseRotationSpeed = 0.3
    const scrollBoost = scrollProgress * 0.7
    const audioBoost = smoothedBass * 0.5
    group.current.rotation.y += delta * (baseRotationSpeed + scrollBoost + audioBoost)

    // Mouse-reactive tilt (the "lookAt" effect)
    const targetTiltX = smoothMouse.current.y * 0.4
    const targetTiltZ = -smoothMouse.current.x * 0.4
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, targetTiltX, 0.05)
    group.current.rotation.z = MathUtils.lerp(group.current.rotation.z, targetTiltZ, 0.05)

    // Breathing/float + audio pulse
    const breathe = Math.sin(t * 0.5) * 0.15
    const audioPulse = smoothedBass * 0.3
    group.current.position.y = breathe + audioPulse

    // Scale: base + scroll + audio pulse
    const baseScale = 2.5
    const scrollScale = 1 + scrollProgress * 0.6
    const audioScale = 1 + smoothedBass * 0.15 // Pulse on bass hit
    const targetScale = baseScale * scrollScale * audioScale

    group.current.scale.lerp(
      new Vector3(targetScale, targetScale, targetScale),
      0.1
    )

    // Glitch/shake effect - includes channel switching glitch
    const isSwitching = getIsSwitching()
    if (glitchIntensity > 0 || hoveredNav || isSwitching) {
      const intensity = isSwitching ? 1.0 : hoveredNav ? 0.3 : glitchIntensity
      group.current.position.x = (Math.random() - 0.5) * 0.5 * intensity
      group.current.position.z = (Math.random() - 0.5) * 0.3 * intensity
      // Extra violent shake on channel switch
      if (isSwitching) {
        group.current.rotation.x += (Math.random() - 0.5) * 0.1
        group.current.rotation.z += (Math.random() - 0.5) * 0.1
      }
    } else {
      group.current.position.x *= 0.9
      group.current.position.z *= 0.9
    }

    // Material: color shift + audio-reactive emissive
    const channel = getCurrentChannel()
    const targetMaterial = section === 'contact' ? silverChrome : redChrome
    const targetEmissive = isSwitching ? 3 : 0.5 + smoothedBass * 2 // Flash bright on switch

    smoothEmissive.current = MathUtils.lerp(smoothEmissive.current, targetEmissive, isSwitching ? 0.5 : 0.2)

    meshesRef.current.forEach((mesh) => {
      const mat = mesh.material as MeshStandardMaterial
      if (isSwitching) {
        // Flash channel color during switch
        const channelColor = new Color(channel.color)
        mat.emissive.lerp(channelColor, 0.3)
        mat.emissiveIntensity = smoothEmissive.current
      } else {
        mat.color.lerp(targetMaterial.color, 0.02)
        mat.emissive.lerp(targetMaterial.emissive, 0.02)
        mat.emissiveIntensity = smoothEmissive.current
      }
    })

    // Update animation mixer
    if (mixer) {
      mixer.update(delta)
    }
  })

  return <primitive ref={group} object={clonedScene} />
}

// Strobe light that pulses with bass
function StrobeLight() {
  const lightRef = useRef<PointLight>(null!)
  const smoothIntensity = useRef(0)

  useFrame(() => {
    if (!lightRef.current) return

    const bass = getBass()
    // Sharp attack, slow decay for strobe effect
    if (bass > 0.5) {
      smoothIntensity.current = bass * 5
    } else {
      smoothIntensity.current *= 0.85
    }

    lightRef.current.intensity = 1.5 + smoothIntensity.current
  })

  return (
    <pointLight
      ref={lightRef}
      position={[0, 5, 5]}
      color="#ff0000"
      intensity={1.5}
      distance={20}
    />
  )
}

// Floor light that creates a "light leak" effect on bass hits
function FloorLight() {
  const lightRef = useRef<SpotLight>(null!)
  const meshRef = useRef<Mesh>(null!)
  const smoothIntensity = useRef(0)

  useFrame(() => {
    if (!lightRef.current || !meshRef.current) return

    const bass = getBass()
    const highs = getHighs()

    // Light reacts to bass with slow decay
    if (bass > 0.3) {
      smoothIntensity.current = Math.min(1, smoothIntensity.current + bass * 0.5)
    } else {
      smoothIntensity.current *= 0.92
    }

    // Update spotlight
    lightRef.current.intensity = smoothIntensity.current * 8

    // Update floor glow mesh opacity
    const mat = meshRef.current.material as MeshBasicMaterial
    mat.opacity = smoothIntensity.current * 0.4
  })

  return (
    <group>
      {/* Spotlight pointing down at floor */}
      <spotLight
        ref={lightRef}
        position={[0, 3, 0]}
        angle={0.8}
        penumbra={1}
        intensity={0}
        color="#cc0000"
        distance={10}
        castShadow={false}
      />
      {/* Floor glow plane */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.4, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshBasicMaterial
          color="#cc0000"
          transparent
          opacity={0}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// Post-processing effects (static - refs cause React 19 circular JSON issues)
// Desktop: Full effects | Mobile: Reduced for performance
function PostProcessing({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    // Mobile: Minimal effects - just bloom and vignette
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.2}
        />
        <Vignette darkness={0.4} offset={0.3} />
      </EffectComposer>
    )
  }

  // Desktop: Full effects
  return (
    <EffectComposer>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new Vector2(0.003, 0.003)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      <Vignette darkness={0.5} offset={0.3} />
    </EffectComposer>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#600000" wireframe />
    </mesh>
  )
}

function Scene({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <color attach="background" args={['#050505']} />
      {/* Volumetric fog for depth */}
      <fog attach="fog" args={['#050505', 8, 25]} />
      <Environment preset="night" />
      <ambientLight intensity={0.2} />

      {/* Main light + strobe */}
      <StrobeLight />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#400000" />
      <pointLight position={[10, -5, 10]} intensity={0.3} color="#200000" />

      {/* Floor light leak - audio reactive */}
      <FloorLight />

      <SigilModel hoveredNav={null} />

      {/* ContactShadows: disable on mobile for performance */}
      {!isMobile && (
        <ContactShadows
          position={[0, -3.5, 0]}
          opacity={0.4}
          scale={15}
          blur={2}
          far={4.5}
        />
      )}

      {/* Post-processing effects */}
      <PostProcessing isMobile={isMobile} />
    </>
  )
}

export default function SigilScene3D() {
  const [canRender, setCanRender] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          console.log('[SigilScene3D] GPU:', renderer)
        }
        setCanRender(true)
      }
    } catch {
      console.warn('[SigilScene3D] WebGL not available')
    }
  }, [])

  if (!canRender) {
    return <div className="fixed inset-0 -z-10 bg-[#050505]" />
  }

  // Mobile: lower DPR, no antialiasing | Desktop: full quality
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2]

  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={dpr}
        gl={{
          antialias: !isMobile,
          alpha: false,
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

// Preload model
useGLTF.preload(getAssetPath('/logo.glb'), true)
