'use client'

import { useState, FormEvent } from 'react'
import { TornInput } from '@/components/ui/TornInput'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CornerBrackets } from '@/components/ui/CornerBrackets'
import { GlitchSlice } from '@/components/effects/GlitchSlice'
import clsx from 'clsx'

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
      setErrorMessage('INVALID FREQUENCY FORMAT // Expected: signal@domain.ext')
      setFormState('error')
      return
    }

    if (!EDGE_FUNCTION_URL) {
      setErrorMessage('UPLINK_OFFLINE // System not configured.')
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
        setErrorMessage('INVALID FREQUENCY FORMAT // Expected: signal@domain.ext')
        setFormState('error')
      } else {
        setErrorMessage('UPLINK_FAILED // Signal transmission error. Retry.')
        setFormState('error')
      }
    } catch {
      setErrorMessage('TRANSMISSION_ERROR // Network failure. Retry.')
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
              BINDING SEALED
            </div>
          </GlitchSlice>

          <div className="font-display text-2xl text-arterial mb-4">
            #{serialKey}
          </div>

          <p className="font-mono text-sm text-white/60 leading-relaxed">
            Your signal has been locked to this frequency.
            <br />
            When the ritual completes, you will be summoned.
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
            SIGNAL ALREADY BOUND
          </div>

          <div className="font-display text-xl text-white mb-4">
            #{serialKey}
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
            PRIORITY ACCESS FOR EARLY INITIATES
          </span>
        </div>
      </form>
    </CornerBrackets>
  )
}
