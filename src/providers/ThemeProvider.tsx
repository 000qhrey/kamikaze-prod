'use client'

/**
 * ThemeProvider — sitewide visual mode: Pacific Punk ↔ Heatmap.
 *
 * Sets `data-theme` on `<html>` so CSS variables (and homepage poster
 * styles) can retarget. Preference persists under `k-theme`. Default
 * is Pacific Punk (`pacific`).
 *
 * The footer kill switch is deliberately quiet — this provider only
 * owns state + persistence, not the control UI.
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

export type SiteTheme = 'pacific' | 'heatmap'

interface ThemeContextValue {
  theme: SiteTheme
  setTheme: (next: SiteTheme) => void
  toggle: () => void
}

const STORAGE_KEY = 'k-theme'
const DEFAULT_THEME: SiteTheme = 'pacific'

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function isTheme(value: string | null): value is SiteTheme {
  return value === 'pacific' || value === 'heatmap'
}

function applyTheme(theme: SiteTheme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({
  children,
  initial = DEFAULT_THEME,
}: {
  children: ReactNode
  initial?: SiteTheme
}) {
  const [theme, setThemeState] = useState<SiteTheme>(initial)

  // Hydrate from storage once on mount. Guard against SSR + privacy modes.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isTheme(stored)) {
        setThemeState(stored)
        applyTheme(stored)
      } else {
        applyTheme(initial)
      }
    } catch {
      applyTheme(initial)
    }
  }, [initial])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: SiteTheme) => {
    setThemeState(next)
    applyTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* no-op */
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'pacific' ? 'heatmap' : 'pacific')
  }, [theme, setTheme])

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
