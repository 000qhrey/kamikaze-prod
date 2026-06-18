'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContactConstellation } from '@/components/contact/ContactConstellation'
import { ContactForm } from '@/components/contact/ContactForm'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import clsx from 'clsx'
import { CONTACT } from '@/data/siteCopy'

const DEFAULT_TEXT = CONTACT.pageTitle
const HINT_TEXT = CONTACT.pageTitleHover
const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789'

export default function ContactPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [displayText, setDisplayText] = useState<string>(DEFAULT_TEXT)
  const [isHovered, setIsHovered] = useState(false)

  // Entry delay effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoaded(true)
    }, 800)

    return () => clearTimeout(timeout)
  }, [])

  // Scramble effect on hover
  const scrambleTo = useCallback((targetText: string) => {
    let frame = 0
    const maxFrames = 12
    const interval = setInterval(() => {
      frame++

      if (frame >= maxFrames) {
        setDisplayText(targetText)
        clearInterval(interval)
        return
      }

      // Progressively reveal target text
      const revealed = Math.floor((frame / maxFrames) * targetText.length)
      const scrambled = targetText
        .split('')
        .map((char, i) => {
          if (char === '[' || char === ']') return char
          if (i < revealed) return targetText[i]
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        })
        .join('')

      setDisplayText(scrambled)
    }, 40)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isHovered) {
      return scrambleTo(HINT_TEXT)
    } else {
      return scrambleTo(DEFAULT_TEXT)
    }
  }, [isHovered, scrambleTo])

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Loading overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black z-50 transition-opacity duration-500',
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      />

      <div className="pt-24 pb-16 px-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8 text-center">
            <span className="font-mono text-xs text-arterial/60 tracking-[0.4em] block mb-2">
              {CONTACT.eyebrow}
            </span>
            <h1
              className={clsx(
                'font-display text-4xl md:text-6xl tracking-wider cursor-pointer transition-colors duration-300',
                isHovered ? 'text-arterial' : 'text-white'
              )}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {displayText}
            </h1>
            <p className="font-mono text-sm text-white/60 mt-4 max-w-lg mx-auto leading-relaxed">
              {CONTACT.intro}
            </p>
          </header>

          {/* Constellation */}
          <ContactConstellation />

          {/* Form Section */}
          <section className="mt-24">
            <h2 className="font-mono text-sm text-white/60 uppercase tracking-widest mb-8 text-center">
              {CONTACT.formSection}
            </h2>
            <div className="max-w-md mx-auto">
              <ContactForm />
            </div>
          </section>
        </div>
      </div>

      <PerspectiveGrid />
    </div>
  )
}
