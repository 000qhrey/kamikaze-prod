'use client'

import { useState, FormEvent, useEffect } from 'react'
import { TornInput } from '@/components/ui/TornInput'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CornerBrackets } from '@/components/ui/CornerBrackets'
import { GlitchSlice } from '@/components/effects/GlitchSlice'
import {
  addToWaitlist,
  isAlreadyBound,
  getWaitlistCount,
  isValidEmail,
  getEntry,
  WaitlistEntry,
} from '@/lib/waitlist'
import clsx from 'clsx'

type FormState = 'idle' | 'submitting' | 'success' | 'already_bound' | 'error'

export function BindingForm() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [isFormFocused, setIsFormFocused] = useState(false)
  const [initiateNumber, setInitiateNumber] = useState<number | null>(null)
  const [waitlistCount, setWaitlistCount] = useState(247)
  const [errorMessage, setErrorMessage] = useState('')

  // Load initial count
  useEffect(() => {
    setWaitlistCount(getWaitlistCount())
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')

    // Validate email
    if (!isValidEmail(email)) {
      setErrorMessage('INVALID FREQUENCY FORMAT // Expected: signal@domain.ext')
      setFormState('error')
      return
    }

    // Check if already bound
    const existingEntry = getEntry(email)
    if (existingEntry) {
      setInitiateNumber(existingEntry.initiateNumber)
      setFormState('already_bound')
      return
    }

    setFormState('submitting')

    // Simulate network delay for dramatic effect
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Add to waitlist
    const entry = addToWaitlist(email)
    if (entry) {
      setInitiateNumber(entry.initiateNumber)
      setWaitlistCount(entry.initiateNumber)
      setFormState('success')
    } else {
      setFormState('already_bound')
    }
  }

  // Success state
  if (formState === 'success') {
    return (
      <CornerBrackets isActive={true} className="w-full max-w-md mx-auto">
        <div className="text-center py-8">
          <GlitchSlice>
            <div className="font-mono text-signal text-xl mb-2">
              BINDING SEALED
            </div>
          </GlitchSlice>

          <div className="font-display text-2xl text-arterial mb-4">
            INITIATE #{initiateNumber}
          </div>

          <p className="font-mono text-sm text-white/60 leading-relaxed">
            Your signal has been locked to this frequency.
            <br />
            When the ritual completes, you will be summoned.
          </p>

          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="font-mono text-xs text-white/40">
              {waitlistCount} ENTITIES BOUND TO THIS FREQUENCY
            </span>
          </div>
        </div>
      </CornerBrackets>
    )
  }

  // Already bound state
  if (formState === 'already_bound') {
    return (
      <CornerBrackets isActive={true} className="w-full max-w-md mx-auto">
        <div className="text-center py-8">
          <div className="font-mono text-arterial text-lg mb-2">
            SIGNAL ALREADY BOUND
          </div>

          <div className="font-display text-xl text-white mb-4">
            INITIATE #{initiateNumber}
          </div>

          <p className="font-mono text-sm text-white/60">
            This frequency is already locked to the ritual.
            <br />
            Patience. The unveiling approaches.
          </p>

          <button
            onClick={() => {
              setFormState('idle')
              setEmail('')
            }}
            className="mt-6 font-mono text-xs text-white/50 hover:text-arterial transition-colors"
          >
            [BIND DIFFERENT SIGNAL]
          </button>
        </div>
      </CornerBrackets>
    )
  }

  // Form state
  return (
    <CornerBrackets isActive={isFormFocused} className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onFocus={() => setIsFormFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFormFocused(false)
          }
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl text-arterial mb-2 tracking-wider">
            {'>>>'} BIND YOUR SIGNAL
          </h2>
          <p className="font-mono text-xs text-white/50 italic leading-relaxed">
            &ldquo;Those who offer their coordinates
            <br />
            shall witness the unveiling first.&rdquo;
          </p>
        </div>

        {/* Email input */}
        <GlitchSlice delay={0}>
          <TornInput
            label="INPUT:// FREQUENCY"
            name="email"
            type="email"
            placeholder="your.signal@frequency.ext"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (formState === 'error') {
                setFormState('idle')
                setErrorMessage('')
              }
            }}
            required
            className={clsx(formState === 'error' && 'border-arterial')}
          />
        </GlitchSlice>

        {/* Error message */}
        {errorMessage && (
          <div className="font-mono text-xs text-arterial">
            [ERROR] {errorMessage}
          </div>
        )}

        {/* Submit button */}
        <GlitchSlice delay={0.1}>
          <div className="pt-2 flex justify-center">
            <TerminalButton
              loading={formState === 'submitting'}
              success={false}
            >
              [ SEAL BINDING ]
            </TerminalButton>
          </div>
        </GlitchSlice>

        {/* Social proof */}
        <div className="text-center pt-4 border-t border-white/10">
          <span className="font-mono text-xs text-white/40">
            {waitlistCount} INITIATES HAVE BOUND THEIR SIGNAL
          </span>
        </div>
      </form>
    </CornerBrackets>
  )
}
