'use client'

import { useState, FormEvent } from 'react'
import { TornInput } from '@/components/ui/TornInput'
import { TornTextarea } from '@/components/ui/TornTextarea'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CornerBrackets } from '@/components/ui/CornerBrackets'
import { GlitchSlice } from '@/components/effects/GlitchSlice'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isFormFocused, setIsFormFocused] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <CornerBrackets isActive={true}>
        <div className="text-center py-12">
          <GlitchSlice>
            <div className="font-mono text-signal text-xl mb-4">
              SIGNAL_SENT <span className="text-white"></span>
            </div>
            <p className="font-mono text-grey-mid text-sm">
              Your transmission has been received. We will respond.
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
          <div className="pt-4 flex justify-center">
            <TerminalButton
              loading={isSubmitting}
              success={isSubmitted}
              successText="SUCCESS"
            >
              TRANSMIT
            </TerminalButton>
          </div>
        </GlitchSlice>
      </form>
    </CornerBrackets>
  )
}
