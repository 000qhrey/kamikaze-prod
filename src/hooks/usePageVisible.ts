'use client'

import { useState, useEffect } from 'react'

/** True when the document tab is visible — pause animations when false */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return visible
}
