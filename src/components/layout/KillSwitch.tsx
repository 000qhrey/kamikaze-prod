'use client'

/**
 * Kill switch — discreet footer control for Pacific Punk ↔ Heatmap.
 *
 * Quiet typography: a pulse dot + 01/02. No "THEME" / "KILL SWITCH"
 * chrome. Accessible via aria-label only.
 */

import { useTheme } from '@/providers/ThemeProvider'

export function KillSwitch({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] uppercase ${className}`}
      role="group"
      aria-label="Visual mode"
    >
      <span
        aria-hidden
        className="text-[8px] leading-none"
        style={{ color: 'var(--k-accent, var(--arterial))' }}
      >
        ◉
      </span>

      <ModeChip
        code="01"
        active={theme === 'pacific'}
        onSelect={() => setTheme('pacific')}
        label="Pacific Punk"
      />

      <span className="text-white/20" aria-hidden>
        /
      </span>

      <ModeChip
        code="02"
        active={theme === 'heatmap'}
        onSelect={() => setTheme('heatmap')}
        label="Heatmap"
      />
    </div>
  )
}

function ModeChip({
  code,
  active,
  onSelect,
  label,
}: {
  code: string
  active: boolean
  onSelect: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Switch visual mode — ${label}`}
      className={`transition-colors duration-200 ${
        active
          ? 'text-[color:var(--k-accent,var(--arterial))]'
          : 'text-white/40 hover:text-white/70'
      }`}
    >
      {code}
    </button>
  )
}
