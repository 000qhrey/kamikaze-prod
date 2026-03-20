'use client'

export function PerspectiveGrid() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[200px] pointer-events-none overflow-hidden"
      style={{ perspective: '500px' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--grey-dark) 1px, transparent 1px),
            linear-gradient(90deg, var(--grey-dark) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'center bottom',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, var(--black) 0%, transparent 30%, transparent 70%, var(--black) 100%)',
        }}
      />
    </div>
  )
}
