'use client'

import { useMemo } from 'react'

interface Ember {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
}

interface EmberParticlesProps {
  count?: number
  className?: string
}

export function EmberParticles({ count = 15, className }: EmberParticlesProps) {
  const embers = useMemo<Ember[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 15,
      opacity: 0.3 + Math.random() * 0.5,
    }))
  }, [count])

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className || ''}`}>
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            left: `${ember.left}%`,
            bottom: '-10px',
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            backgroundColor: 'var(--arterial)',
            opacity: ember.opacity,
            filter: 'blur(1px)',
            animation: `ember-float ${ember.duration}s linear ${ember.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      <style jsx>{`
        @keyframes ember-float {
          0% {
            transform: translateY(0) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: var(--opacity, 0.5);
            transform: scale(1);
          }
          90% {
            opacity: var(--opacity, 0.5);
          }
          100% {
            transform: translateY(-110vh) translateX(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 30}px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
