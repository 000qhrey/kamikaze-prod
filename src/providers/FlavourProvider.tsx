'use client'

/**
 * FlavourProvider — homepage language toggle. Japanese is the primary
 * "flavour"; English is available as a secondary reading.
 *
 * The user-facing control lives in the footer as a small `FLAVOUR` switch,
 * so the surface for this provider is deliberately small: a `flavour` value,
 * a `toggle` function, and a `t()` helper that picks the right string from a
 * `{ jp, en }` pair.
 *
 * The choice persists to localStorage under `k-flavour`. If nothing is
 * stored, JP is the default — the design is Japanese-first.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Flavour = 'jp' | 'en'

export interface FlavourPair {
  jp: string
  en: string
}

interface FlavourContextValue {
  flavour: Flavour
  setFlavour: (next: Flavour) => void
  toggle: () => void
  t: (pair: FlavourPair) => string
}

const STORAGE_KEY = 'k-flavour'

const FlavourContext = createContext<FlavourContextValue>({
  flavour: 'jp',
  setFlavour: () => {},
  toggle: () => {},
  t: (pair) => pair.jp,
})

export function useFlavour() {
  return useContext(FlavourContext)
}

/** Convenience: read a single pair without pulling the whole context. */
export function useTranslate() {
  return useFlavour().t
}

export function FlavourProvider({
  children,
  initial = 'jp',
}: {
  children: ReactNode
  initial?: Flavour
}) {
  const [flavour, setFlavourState] = useState<Flavour>(initial)

  // Hydrate from storage once on mount. Guard against SSR + privacy modes.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'jp' || stored === 'en') setFlavourState(stored)
    } catch {
      /* no-op */
    }
  }, [])

  // Homepage-only: set <html lang> while mounted, restore on leave so
  // interior routes keep the root layout's `lang="en"`. Flavour styling
  // is scoped via `data-flavour` on `.k-home`, not on <html>.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const prev = document.documentElement.lang || 'en'
    document.documentElement.lang = flavour === 'jp' ? 'ja' : 'en'
    return () => {
      document.documentElement.lang = prev
    }
  }, [flavour])

  const setFlavour = useCallback((next: Flavour) => {
    setFlavourState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* no-op */
    }
  }, [])

  const toggle = useCallback(() => {
    setFlavour(flavour === 'jp' ? 'en' : 'jp')
  }, [flavour, setFlavour])

  const t = useCallback(
    (pair: FlavourPair) => (flavour === 'jp' ? pair.jp : pair.en),
    [flavour],
  )

  const value = useMemo(
    () => ({ flavour, setFlavour, toggle, t }),
    [flavour, setFlavour, toggle, t],
  )

  return <FlavourContext.Provider value={value}>{children}</FlavourContext.Provider>
}
