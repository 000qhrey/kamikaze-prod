'use client'

import { useState, FormEvent } from 'react'
import { TornInput } from '@/components/ui/TornInput'
import { TornTextarea } from '@/components/ui/TornTextarea'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CornerBrackets } from '@/components/ui/CornerBrackets'
import { GlitchSlice } from '@/components/effects/GlitchSlice'

import { CONTACT } from '@/data/siteCopy'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

function formatContactError(message: string) {
  if (message === 'SYSTEM_NOT_CONFIGURED') return CONTACT.systemOffline
  if (message === 'TRANSMISSION_FAILED' || message === 'TRANSMISSION_ERROR') {
    return CONTACT.sendFailed
  }
  return message
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isFormFocused, setIsFormFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    try {
      if (!SUPABASE_URL) {
        throw new Error('SYSTEM_NOT_CONFIGURED')
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'TRANSMISSION_FAILED')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(formatContactError(err instanceof Error ? err.message : CONTACT.sendFailed))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <CornerBrackets isActive={true}>
        <div className="text-center py-12">
          <GlitchSlice>
            <div className="font-mono text-signal text-xl mb-4">
              MESSAGE SENT
            </div>
            <p className="font-mono text-white/70 text-sm">
              {CONTACT.messageSentBody}
            </p>
          </GlitchSlice>
        </div>
      </CornerBrackets>
    )
  }

  return (
    <CornerBrackets isActive={isFormFocused}>
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        onFocus={() => setIsFormFocused(true)}
        onBlur={(e) => {
          // Only blur if focus is leaving the form entirely
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFormFocused(false)
          }
        }}
      >
        <GlitchSlice delay={0}>
          <TornInput
            label="Designation"
            name="name"
            placeholder="Your name"
            required
          />
        </GlitchSlice>

        <GlitchSlice delay={0.1}>
          <TornInput
            label="Signal"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </GlitchSlice>

        <GlitchSlice delay={0.2}>
          <TornInput
            label="Subject"
            name="subject"
            placeholder="What is this regarding?"
            required
          />
        </GlitchSlice>

        <GlitchSlice delay={0.3}>
          <TornTextarea
            label="Message"
            name="message"
            placeholder="Your message..."
            required
          />
        </GlitchSlice>

        <GlitchSlice delay={0.4}>
          <div className="pt-4 flex flex-col items-center gap-4">
            <TerminalButton
              loading={isSubmitting}
              success={isSubmitted}
              successText="SUCCESS"
            >
              TRANSMIT
            </TerminalButton>
            {error && (
              <div className="font-mono text-xs text-arterial animate-pulse">
                [ERROR] {error}
              </div>
            )}
          </div>
        </GlitchSlice>
      </form>
    </CornerBrackets>
  )
}
