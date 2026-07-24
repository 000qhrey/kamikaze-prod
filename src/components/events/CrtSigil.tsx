'use client'

/**
 * Tiny logo.glb for CRT bezel — red / white / black CRT palette.
 * Lite/mobile falls back to a red-tinted static sigil.
 */

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from 'three'
import Image from 'next/image'
import { getAssetPath } from '@/lib/basePath'
import { useSkipHeroWebGL } from '@/hooks/useLiteMode'

useGLTF.setDecoderPath(getAssetPath('/draco/'))

const MODEL_PATH = getAssetPath('/logo.glb')

const VOID = new Color('#0a0a0a')
const ARTERIAL = new Color('#CC0000')
const HOT_WHITE = new Color('#ffe8e8')

function paintSigilMaterials(root: Object3D) {
  root.traverse((child) => {
    if (!(child as Mesh).isMesh) return
    const mesh = child as Mesh
    mesh.material = new MeshStandardMaterial({
      color: VOID,
      emissive: ARTERIAL,
      emissiveIntensity: 0.85,
      metalness: 0.75,
      roughness: 0.28,
    })
  })
}

function SpinningLogo() {
  const group = useRef<Group>(null)
  const meshes = useRef<Mesh[]>([])
  const { scene } = useGLTF(MODEL_PATH, true)

  const cloned = useMemo(() => {
    const clone = scene.clone(true)
    paintSigilMaterials(clone)
    const list: Mesh[] = []
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) list.push(child as Mesh)
    })
    meshes.current = list
    return clone
  }, [scene])

  useFrame((state, dt) => {
    if (!group.current) return
    group.current.rotation.z -= dt * 0.35

    const t = state.clock.getElapsedTime()
    const pulse = 0.75 + (Math.sin(t * 2.4) * 0.5 + 0.5) * 0.5
    // Soft white-hot flash on the red phosphor
    const hot = (Math.sin(t * 1.15) * 0.5 + 0.5) * 0.4

    meshes.current.forEach((mesh) => {
      const mat = mesh.material as MeshStandardMaterial
      mat.emissive.copy(ARTERIAL).lerp(HOT_WHITE, hot)
      mat.emissiveIntensity = pulse
      mat.color.copy(VOID)
    })
  })

  return (
    <group ref={group} scale={0.038} rotation={[0.2, -0.08, MathUtils.degToRad(40)]}>
      <primitive object={cloned} />
    </group>
  )
}

function StaticSigil() {
  return (
    <Image
      src={getAssetPath('/logo-sigil.webp')}
      alt=""
      width={40}
      height={40}
      className="object-contain opacity-90"
      style={{
        // Push greyscale logo into arterial red / black
        filter: 'brightness(0.85) sepia(1) saturate(8) hue-rotate(-25deg) contrast(1.15)',
      }}
    />
  )
}

export function CrtSigil({ className }: { className?: string }) {
  const skip = useSkipHeroWebGL()

  if (skip) {
    return (
      <div className={className} aria-hidden>
        <StaticSigil />
      </div>
    )
  }

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 28 }}
        gl={{ antialias: false, alpha: true }}
        style={{ width: 44, height: 44 }}
      >
        <ambientLight intensity={0.18} color="#1a0505" />
        <directionalLight position={[2, 3, 4]} intensity={0.95} color="#ff6666" />
        <pointLight position={[-2, -1, 3]} intensity={0.75} color="#CC0000" />
        <Suspense fallback={null}>
          <SpinningLogo />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_PATH, true)
