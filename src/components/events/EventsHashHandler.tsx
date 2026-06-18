'use client'

import { useEffect } from 'react'

export function EventsHashHandler() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1)
      if (!hash) return

      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    scrollToHash()
    const timer = window.setTimeout(scrollToHash, 500)
    window.addEventListener('hashchange', scrollToHash)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [])

  return null
}
