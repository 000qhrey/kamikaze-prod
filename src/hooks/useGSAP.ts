'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useGSAP(callback: (gsap: typeof import('gsap').gsap) => void, deps: unknown[] = []) {
  const contextRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    contextRef.current = gsap.context(() => {
      callback(gsap)
    })

    return () => {
      contextRef.current?.revert()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return contextRef
}

export { gsap, ScrollTrigger }
