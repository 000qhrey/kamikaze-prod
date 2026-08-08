'use client'

/**
 * logo.glb — sigil spinning clockwise inside the hero sun.
 * Material breathes through theme shades (Pacific reds / Heatmap thermal).
 *
 * Orientation: logo.glb mesh "front" is already face-on in XY (thin Z),
 * same as SigilScene3D — no ±π/2 remap needed. Nested groups keep the
 * fixed resting pose separate from the Z spin.
 *
 * Perf: capped DPR, no AA on mobile, pause when offscreen / tab hidden,
 * shared material (no per-mesh clones), dispose on unmount.
 */

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  MathUtils,
  Vector3,
  type Object3D,
} from 'three'
import { getAssetPath } from '@/lib/basePath'
import {
  CHANNEL_TINT_MS,
  getChannelTint,
  onAudioChange,
} from '@/hooks/useAudioEngine'
import { useTheme, type SiteTheme } from '@/providers/ThemeProvider'
import { useIsMobile } from '@/hooks/useIsMobile'

useGLTF.setDecoderPath(getAssetPath('/draco/'))

const MODEL_PATH = getAssetPath('/logo.glb')

/** Pacific Punk — deep → bright → ink → deep */
const RED_SHADES = [
  new Color('#3a0507'),
  new Color('#7a0c10'),
  new Color('#b30e12'),
  new Color('#e01a17'),
  new Color('#8c1114'),
  new Color('#5c080c'),
]

/** Heatmap — indigo → magenta → orange → yellow core */
const HEAT_SHADES = [
  new Color('#2a1858'),
  new Color('#8a1a6a'),
  new Color('#e01a7a'),
  new Color('#ff6a1a'),
  new Color('#ffe14a'),
  new Color('#c04080'),
]

const SPIN_SPEED = 0.35 // rad/s, clockwise on screen (view axis)

/** Face-on remap — 0: GLB already faces +Z (XY plane). */
const FACE_X = 0
/** Slight pitch so the sigil reads dimensional / can catch light. */
const TILT_X = 0.26
const TILT_Y = -0.1
/** In-plane diagonal rest (~45°): wing toward top-left / bottom-right. */
const START_Z = Math.PI / 4
/**
 * World diameter of logo.glb is ~100 units after node scale.
 * Camera z=8.2 / fov 32 → ~4.7 units tall — full radial with margin;
 * canvas inset is negative so spikes can extend past the sun rim.
 */
const SCALE = 0.045

/** Material shade updates — every N frames (spin still every frame). */
const MATERIAL_FRAME_STRIDE = 2

function shadesFor(theme: SiteTheme) {
  return theme === 'heatmap' ? HEAT_SHADES : RED_SHADES
}

function LogoModel({
  reduced,
  hovered = false,
  theme,
  active,
}: {
  reduced: boolean
  hovered?: boolean
  theme: SiteTheme
  active: boolean
}) {
  const spinRef = useRef<Group>(null!)
  const meshesRef = useRef<Mesh[]>([])
  const shadeA = useRef(new Color())
  const shadeB = useRef(new Color())
  const tintColor = useRef(new Color())
  const frameCount = useRef(0)
  const themeRef = useRef(theme)
  themeRef.current = theme
  const { scene } = useGLTF(MODEL_PATH, true)
  const { invalidate } = useThree()

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: RED_SHADES[2].clone(),
        emissive: RED_SHADES[2].clone(),
        emissiveIntensity: 0.55,
        metalness: 0.75,
        roughness: 0.28,
      }),
    [],
  )

  const cloned = useMemo(() => {
    const clone = scene.clone(true)
    // Center so spin/tilt orbit the sigil, not the export origin offset
    const box = new Box3().setFromObject(clone)
    const center = box.getCenter(new Vector3())
    clone.position.sub(center)

    clone.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        mesh.material = material
        mesh.castShadow = false
        mesh.receiveShadow = false
        mesh.frustumCulled = true
      }
    })
    return clone
  }, [scene, material])

  useEffect(() => {
    const meshes: Mesh[] = []
    cloned.traverse((child) => {
      if ((child as Mesh).isMesh) meshes.push(child as Mesh)
    })
    meshesRef.current = meshes
    return () => {
      // Only dispose our material — clone shares geometries with the GLTF cache
      material.dispose()
    }
  }, [cloned, material])

  // Snap material toward theme shades when mode flips
  useEffect(() => {
    const shades = shadesFor(theme)
    const target = shades[theme === 'heatmap' ? 3 : 2]
    meshesRef.current.forEach((mesh) => {
      const mat = mesh.material as MeshStandardMaterial
      mat.color.copy(target)
      mat.emissive.copy(target)
      mat.emissiveIntensity = theme === 'heatmap' ? 0.85 : 0.55
      mat.metalness = theme === 'heatmap' ? 0.45 : 0.75
      mat.roughness = theme === 'heatmap' ? 0.35 : 0.28
    })
    invalidate()
  }, [theme, invalidate])

  // Demand frameloop (reduced motion / paused) still needs frames while channel tint eases
  useEffect(() => {
    if (!reduced && active) return
    let raf = 0
    let stopAt = 0
    const tick = () => {
      invalidate()
      if (performance.now() < stopAt) {
        raf = requestAnimationFrame(tick)
      }
    }
    const unsub = onAudioChange(() => {
      if (getChannelTint().strength <= 0) return
      stopAt = performance.now() + CHANNEL_TINT_MS + 50
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    })
    return () => {
      unsub()
      cancelAnimationFrame(raf)
    }
  }, [reduced, active, invalidate])

  useFrame((state, delta) => {
    if (!spinRef.current || !active) return

    if (!reduced) {
      // Clockwise when viewed from the camera (+Z looking toward origin)
      spinRef.current.rotation.z -= delta * SPIN_SPEED
    }

    frameCount.current += 1
    const tint = getChannelTint()
    // Always update while tinting; otherwise stride material work
    if (
      tint.strength <= 0 &&
      frameCount.current % MATERIAL_FRAME_STRIDE !== 0 &&
      !hovered
    ) {
      return
    }

    const shades = shadesFor(themeRef.current)
    const t = state.clock.getElapsedTime()
    // Cycle through shades (~8s full loop)
    const cycle = (t * 0.125) % 1
    const seg = shades.length
    const idx = Math.floor(cycle * seg) % seg
    const next = (idx + 1) % seg
    const local = (cycle * seg) % 1
    // Ease mid-blend so each shade sits a moment
    const blend = local * local * (3 - 2 * local)

    shadeA.current.copy(shades[idx])
    shadeB.current.copy(shades[next])
    const mixed = shadeA.current.lerp(shadeB.current, blend)

    if (tint.strength > 0) {
      tintColor.current.set(tint.color)
      mixed.lerp(tintColor.current, tint.strength)
    }

    const heatBoost = themeRef.current === 'heatmap' ? 0.22 : 0
    const pulse = 0.4 + Math.sin(t * 1.4) * 0.18 + tint.strength * 0.35 + heatBoost
    const targetIntensity = pulse + (hovered ? 0.32 : 0)
    // Reduced motion: apply tint immediately (no slow material lerp), still eases via strength
    const colorLerp = reduced ? 1 : tint.strength > 0 ? 0.22 : 0.08
    const intensityLerp = hovered ? 0.14 : 0.06

    // Single shared material — update once
    material.color.lerp(mixed, colorLerp)
    material.emissive.lerp(mixed, colorLerp)
    material.emissiveIntensity = MathUtils.lerp(
      material.emissiveIntensity,
      targetIntensity,
      intensityLerp,
    )
  })

  return (
    <group ref={spinRef} scale={SCALE}>
      {/* Fixed resting pose: face-on + diagonal + slight 3D tilt */}
      <group rotation={[FACE_X + TILT_X, TILT_Y, START_Z]}>
        <primitive object={cloned} />
      </group>
    </group>
  )
}

function FallbackDisc({ theme }: { theme: SiteTheme }) {
  const color = theme === 'heatmap' ? '#ff6a1a' : '#b30e12'
  return (
    <mesh scale={0.55}>
      <ringGeometry args={[0.55, 0.9, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  )
}

function useCanvasActive(containerRef: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: '40px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [containerRef])

  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === 'visible')
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return visible && pageVisible
}

export function SunLogo3D({
  reduced = false,
  hovered = false,
}: {
  reduced?: boolean
  hovered?: boolean
}) {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const active = useCanvasActive(containerRef)

  const keyLight = theme === 'heatmap' ? '#ffe8a0' : '#ffd0c8'
  const fillLight = theme === 'heatmap' ? '#ff6a55' : '#ff6a55'
  const rimLight = theme === 'heatmap' ? '#e01a7a' : undefined

  // Mobile: hard-cap DPR at 1; desktop: [1, 1.5]
  const dpr: number | [number, number] = isMobile ? 1 : [1, 1.5]
  const frameloop = active && !reduced ? 'always' : 'demand'

  return (
    <div ref={containerRef} className="k-hero-sun-logo" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 8.2], fov: 32 }}
        dpr={dpr}
        frameloop={frameloop}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
          // Avoid preserveDrawingBuffer cost
          preserveDrawingBuffer: false,
        }}
        // Skip shadows entirely (none cast)
        shadows={false}
      >
        <ambientLight intensity={theme === 'heatmap' ? 0.4 : 0.55} />
        <directionalLight position={[2.5, 3, 5]} intensity={0.9} color={keyLight} />
        {/* Drop rim light on mobile — one less pass */}
        {!isMobile && (
          <directionalLight position={[-3, -1, 2]} intensity={0.45} color={fillLight} />
        )}
        {!isMobile && rimLight && (
          <directionalLight position={[0, -2, 3]} intensity={0.55} color={rimLight} />
        )}
        {isMobile && (
          <directionalLight position={[-3, -1, 2]} intensity={0.35} color={fillLight} />
        )}
        <Suspense fallback={<FallbackDisc theme={theme} />}>
          <LogoModel
            reduced={reduced}
            hovered={hovered}
            theme={theme}
            active={active}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_PATH, true)

export default SunLogo3D
