'use client'

import { useScrollProgress } from '@/hooks/useScrollProgress'

export function ScrollIndicator() {
  const progress = useScrollProgress()

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 w-[2px] h-[30vh] bg-grey-dark z-50"
      aria-hidden="true"
    >
      <div
        className="w-full bg-red-bright transition-all duration-100"
        style={{ height: `${progress * 100}%` }}
      />
    </div>
  )
}
