'use client'

import { TextareaHTMLAttributes, forwardRef, useState } from 'react'
import clsx from 'clsx'

interface TornTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const TornTextarea = forwardRef<HTMLTextAreaElement, TornTextareaProps>(
  ({ label, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className={clsx('relative', className)}>
        {label && (
          <label className="block font-mono text-xs text-white/70 mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={clsx(
              'w-full bg-transparent font-mono text-white py-3 px-0 min-h-[120px]',
              'border-0 border-b border-grey-mid/50 resize-none',
              'placeholder:text-white/40',
              'focus:outline-none focus:border-transparent',
              'transition-colors duration-300'
            )}
          />
          {/* Torn bottom border */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-grey-mid/60"
            style={{
              clipPath: `polygon(
                0% 0%, 2% 100%, 5% 0%, 8% 100%, 12% 0%, 15% 100%, 20% 0%,
                25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%,
                55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%,
                85% 100%, 90% 0%, 95% 100%, 100% 0%
              )`,
            }}
          />
          {/* Red bleed on focus */}
          <div
            className={clsx(
              'absolute bottom-0 left-0 h-[2px] bg-red-bright',
              'transition-all duration-300 ease-out'
            )}
            style={{
              width: isFocused ? '100%' : '0%',
            }}
          />
        </div>
      </div>
    )
  }
)

TornTextarea.displayName = 'TornTextarea'
