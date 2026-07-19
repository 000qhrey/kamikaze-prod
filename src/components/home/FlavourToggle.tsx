'use client'

/**
 * FLAVOUR — a small, tasteful language switch that lives in the footer.
 *
 * Two "chips" (JP · EN). Clicking either flips the active flavour; the
 * inactive one is dimmed. The whole switch is keyboard-focusable and
 * reads the active state via `aria-pressed`.
 *
 * Deliberately visual-quiet: mono type, a thin divider, and a red dot for
 * the active side. No animation on hover beyond a colour change.
 */

import { useFlavour } from '@/providers/FlavourProvider'
import { HOME_COPY } from './homeCopy'

export function FlavourToggle({ className = '' }: { className?: string }) {
  const { flavour, setFlavour, t } = useFlavour()

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase ${className}`}
      role="group"
      aria-label="Language flavour"
    >
      <span className="text-white/40">[ {t(HOME_COPY.footer.flavourLabel)} ]</span>

      <button
        type="button"
        onClick={() => setFlavour('jp')}
        aria-pressed={flavour === 'jp'}
        aria-label="Japanese"
        className={`transition-colors duration-200 ${
          flavour === 'jp'
            ? 'text-arterial'
            : 'text-white/50 hover:text-white'
        }`}
      >
        <span aria-hidden className="mr-1">
          {flavour === 'jp' ? '●' : '○'}
        </span>
        JP
      </button>

      <span className="text-white/25">/</span>

      <button
        type="button"
        onClick={() => setFlavour('en')}
        aria-pressed={flavour === 'en'}
        aria-label="English"
        className={`transition-colors duration-200 ${
          flavour === 'en'
            ? 'text-arterial'
            : 'text-white/50 hover:text-white'
        }`}
      >
        <span aria-hidden className="mr-1">
          {flavour === 'en' ? '●' : '○'}
        </span>
        EN
      </button>
    </div>
  )
}
