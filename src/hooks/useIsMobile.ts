'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect mobile devices for performance optimization
 * Uses both touch detection and viewport width
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isTouchDevice || isSmallScreen)
    }

    checkMobile()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Non-hook version for use in effects or outside React components
 * Call only on client side
 */
export function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth < 768
  return isTouchDevice || isSmallScreen
}
