'use client'

import { useState, FormEvent } from 'react'
import { TornInput } from '@/components/ui/TornInput'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CornerBrackets } from '@/components/ui/CornerBrackets'
import { GlitchSlice } from '@/components/effects/GlitchSlice'
import clsx from 'clsx'
import { MERCH } from '@/data/siteCopy'

type FormState = 'idle' | 'submitting' | 'success' | 'already_bound' | 'error'

// Construct Edge Function URL from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const EDGE_FUNCTION_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/join-waitlist`
  : ''

interface WaitlistResponse {
  success: boolean
  message: string
  serialKey?: string
}

export function BindingForm() {
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [isFormFocused, setIsFormFocused] = useState(false)
  const [serialKey, setSerialKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')

    // Basic client-side validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      setErrorMessage(MERCH.invalidEmail)
      setFormState('error')
      return
    }

    if (!EDGE_FUNCTION_URL) {
      setErrorMessage(MERCH.systemOffline)
      setFormState('error')
      return
    }

    setFormState('submitting')

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const result: WaitlistResponse = await response.json()

      if (result.success) {
        setSerialKey(result.serialKey || null)
        setFormState('success')
      } else if (result.message === 'SIGNAL_ALREADY_BOUND') {
        setSerialKey(result.serialKey || null)
        setFormState('already_bound')
      } else if (result.message === 'INVALID_FREQUENCY_FORMAT') {
        setErrorMessage(MERCH.invalidEmail)
        setFormState('error')
      } else {
        setErrorMessage(MERCH.submitError)
        setFormState('error')
      }
    } catch {
      setErrorMessage(MERCH.submitError)
      setFormState('error')
    }
  }

  // Success state
  if (formState === 'success') {
    return (
      <CornerBrackets isActive={true} className="w-full max-w-md mx-auto">
        <div className="text-center py-8">
          <GlitchSlice>
            <div className="font-mono text-signal text-xl mb-2">
              ON THE LIST
            </div>
          </GlitchSlice>

          <div className="font-display text-2xl text-arterial mb-4">
            #{serialKey}
          </div>

          <p className="font-mono text-sm text-white/60 leading-relaxed">
            {MERCH.waitlistSuccess}
            <br />
            We will email you when the drop goes live.
          </p>

          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="font-mono text-xs text-white/40">
              CHECK YOUR INBOX FOR CONFIRMATION
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
            ALREADY ON THE LIST
          </div>

          <div className="font-display text-xl text-white mb-4">
            #{serialKey}
          </div>

          <p className="font-mono text-sm text-white/60">
            This email is already registered for the waitlist.
          </p>

          <button
            onClick={() => {
              setFormState('idle')
              setEmail('')
            }}
            className="mt-6 font-mono text-xs text-white/50 hover:text-arterial transition-colors"
          >
            [{MERCH.bindDifferent}]
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
            {'>>>'} {MERCH.waitlistTitle}
          </h2>
          <p className="font-mono text-xs text-white/50 leading-relaxed">
            {MERCH.waitlistSubtitle}
          </p>
        </div>

        {/* Email input */}
        <GlitchSlice delay={0}>
          <TornInput
            label={MERCH.emailLabel}
            name="email"
            type="email"
            placeholder={MERCH.emailPlaceholder}
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
            PRIORITY ACCESS FOR EARLY INITIATES
          </span>
        </div>
      </form>
    </CornerBrackets>
  )
}
