"use client"

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, ContactShadows, Html } from '@react-three/drei'
import { useRef, useEffect, useMemo, useState, Suspense } from 'react'
import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { getAssetPath } from '@/lib/basePath'
import { getScrollProgress, getScrollSection } from '@/hooks/useScrollStore'
import { getGlitchIntensity } from '@/hooks/useSigilGlitch'
import { getBass, getMids, getHighs, getIsSwitching, getCurrentChannel } from '@/hooks/useAudioEngine'

// Configure drei's useGLTF to use Draco decoder from CDN
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
dracoLoader.preload()

// Set up the GLTF loader with Draco support
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

// Navigation labels that float around the sigil
const NAV_ITEMS = [
  { label: 'EVENTS', href: '/events', angle: -30, distance: 4.5 },
  { label: 'ARTISTS', href: '/artists', angle: 30, distance: 4.5 },
  { label: 'MERCH', href: '/merch', angle: 150, distance: 4.5 },
  { label: 'CONTACT', href: '/contact', angle: 210, distance: 4.5 },
]

function NavLabel({ label, href, angle, distance, hoveredNav, setHoveredNav }: {
  label: string
  href: string
  angle: number
  distance: number
  hoveredNav: string | null
  setHoveredNav: (nav: string | null) => void
}) {
  const ref = useRef<THREE.Group>(null!)
  const isHovered = hoveredNav === label

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()

    // Position in a circle around the sigil
    const rad = THREE.MathUtils.degToRad(angle + t * 5) // Slow orbit
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
  const group = useRef<THREE.Group>(null!)
  const modelPath = getAssetPath('/logo.glb')
  const { mouse } = useThree()

  const { scene, animations } = useGLTF(modelPath, true)
  const { actions, mixer } = useAnimations(animations, group)

  // Smoothed values for lerping
  const smoothMouse = useRef({ x: 0, y: 0 })
  const smoothBass = useRef(0)
  const smoothEmissive = useRef(0)

  // Create materials for different states
  const redChrome = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#600000',
    emissive: '#400000',
    emissiveIntensity: 0.5,
    metalness: 1,
    roughness: 0.1,
  }), [])

  const silverChrome = useMemo(() => new THREE.MeshStandardMaterial({
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
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = redChrome.clone()
      }
    })
    return clone
  }, [scene, redChrome])

  // Store meshes for material updates
  const meshesRef = useRef<THREE.Mesh[]>([])
  useEffect(() => {
    const meshes: THREE.Mesh[] = []
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child as THREE.Mesh)
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
        action.setLoop(THREE.LoopRepeat, Infinity)
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
    smoothBass.current = THREE.MathUtils.lerp(smoothBass.current, bass, 0.3)
    const smoothedBass = smoothBass.current

    // Smooth mouse tracking
    smoothMouse.current.x = THREE.MathUtils.lerp(smoothMouse.current.x, mouse.x, 0.1)
    smoothMouse.current.y = THREE.MathUtils.lerp(smoothMouse.current.y, mouse.y, 0.1)

    // Base rotation - constant slow spin
    const baseRotationSpeed = 0.3
    const scrollBoost = scrollProgress * 0.7
    const audioBoost = smoothedBass * 0.5
    group.current.rotation.y += delta * (baseRotationSpeed + scrollBoost + audioBoost)

    // Mouse-reactive tilt (the "lookAt" effect)
    const targetTiltX = smoothMouse.current.y * 0.4
    const targetTiltZ = -smoothMouse.current.x * 0.4
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetTiltX, 0.05)
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetTiltZ, 0.05)

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
      new THREE.Vector3(targetScale, targetScale, targetScale),
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

    smoothEmissive.current = THREE.MathUtils.lerp(smoothEmissive.current, targetEmissive, isSwitching ? 0.5 : 0.2)

    meshesRef.current.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (isSwitching) {
        // Flash channel color during switch
        const channelColor = new THREE.Color(channel.color)
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
  const lightRef = useRef<THREE.PointLight>(null!)
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

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#600000" wireframe />
    </mesh>
  )
}

function Scene() {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  return (
    <>
      <color attach="background" args={['#050505']} />
      <Environment preset="night" />
      <ambientLight intensity={0.2} />

      {/* Main light + strobe */}
      <StrobeLight />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#400000" />
      <pointLight position={[10, -5, 10]} intensity={0.3} color="#200000" />

      <SigilModel hoveredNav={hoveredNav} />

      {/* Navigation labels orbiting the sigil */}
      {NAV_ITEMS.map((item) => (
        <NavLabel
          key={item.label}
          {...item}
          hoveredNav={hoveredNav}
          setHoveredNav={setHoveredNav}
        />
      ))}

      <ContactShadows
        position={[0, -3.5, 0]}
        opacity={0.4}
        scale={15}
        blur={2}
        far={4.5}
      />
    </>
  )
}

export default function SigilScene3D() {
  const [canRender, setCanRender] = useState(false)

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

  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload model
useGLTF.preload(getAssetPath('/logo.glb'), true)
