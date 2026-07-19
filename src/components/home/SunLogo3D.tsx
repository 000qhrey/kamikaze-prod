'use client'

/**
 * logo.glb — sigil spinning clockwise inside the hero red sun.
 * Small, contained; material breathes through deep → arterial reds.
 *
 * Orientation: logo.glb mesh "front" is already face-on in XY (thin Z),
 * same as SigilScene3D — no ±π/2 remap needed. Nested groups keep the
 * fixed resting pose separate from the Z spin.
 */

import { Suspense, useEffect, useMemo, useRef } from 'react'
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

useGLTF.setDecoderPath(getAssetPath('/draco/'))

const MODEL_PATH = getAssetPath('/logo.glb')

/** Red ladder — deep → bright → ink → deep */
const RED_SHADES = [
  new Color('#3a0507'),
  new Color('#7a0c10'),
  new Color('#b30e12'),
  new Color('#e01a17'),
  new Color('#8c1114'),
  new Color('#5c080c'),
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

function LogoModel({
  reduced,
  hovered = false,
}: {
  reduced: boolean
  hovered?: boolean
}) {
  const spinRef = useRef<Group>(null!)
  const meshesRef = useRef<Mesh[]>([])
  const shadeA = useRef(new Color())
  const shadeB = useRef(new Color())
  const tintColor = useRef(new Color())
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
      material.dispose()
    }
  }, [cloned, material])

  // Demand frameloop (reduced motion) still needs frames while channel tint eases
  useEffect(() => {
    if (!reduced) return
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
  }, [reduced, invalidate])

  useFrame((state, delta) => {
    if (!spinRef.current) return

    if (!reduced) {
      // Clockwise when viewed from the camera (+Z looking toward origin)
      spinRef.current.rotation.z -= delta * SPIN_SPEED
    }

    const t = state.clock.getElapsedTime()
    // Cycle through red shades (~8s full loop)
    const cycle = (t * 0.125) % 1
    const seg = RED_SHADES.length
    const idx = Math.floor(cycle * seg) % seg
    const next = (idx + 1) % seg
    const local = (cycle * seg) % 1
    // Ease mid-blend so each shade sits a moment
    const blend = local * local * (3 - 2 * local)

    shadeA.current.copy(RED_SHADES[idx])
    shadeB.current.copy(RED_SHADES[next])
    const mixed = shadeA.current.lerp(shadeB.current, blend)

    const tint = getChannelTint()
    if (tint.strength > 0) {
      tintColor.current.set(tint.color)
      mixed.lerp(tintColor.current, tint.strength)
    }

    const pulse = 0.4 + Math.sin(t * 1.4) * 0.18 + tint.strength * 0.35
    const targetIntensity = pulse + (hovered ? 0.32 : 0)
    // Reduced motion: apply tint immediately (no slow material lerp), still eases via strength
    const colorLerp = reduced ? 1 : tint.strength > 0 ? 0.22 : 0.08
    const intensityLerp = hovered ? 0.14 : 0.06

    meshesRef.current.forEach((mesh) => {
      const mat = mesh.material as MeshStandardMaterial
      mat.color.lerp(mixed, colorLerp)
      mat.emissive.lerp(mixed, colorLerp)
      mat.emissiveIntensity = MathUtils.lerp(
        mat.emissiveIntensity,
        targetIntensity,
        intensityLerp,
      )
    })
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

function FallbackDisc() {
  return (
    <mesh scale={0.55}>
      <ringGeometry args={[0.55, 0.9, 48]} />
      <meshBasicMaterial color="#b30e12" transparent opacity={0.35} />
    </mesh>
  )
}

export function SunLogo3D({
  reduced = false,
  hovered = false,
}: {
  reduced?: boolean
  hovered?: boolean
}) {
  return (
    <div className="k-hero-sun-logo" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 8.2], fov: 32 }}
        dpr={[1, 1.5]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[2.5, 3, 5]} intensity={0.9} color="#ffd0c8" />
        <directionalLight position={[-3, -1, 2]} intensity={0.45} color="#ff6a55" />
        <Suspense fallback={<FallbackDisc />}>
          <LogoModel reduced={reduced} hovered={hovered} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_PATH, true)

export default SunLogo3D
