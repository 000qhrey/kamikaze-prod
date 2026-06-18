'use client'

import { useState, FormEvent, useEffect } from 'react'
import clsx from 'clsx'
import { ARTISTS } from '@/data/siteCopy'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

interface LogEntry {
  text: string
  type: 'info' | 'success' | 'data' | 'error'
}

const UPLOAD_LOGS: LogEntry[] = [
  { text: 'Uploading your demo...', type: 'info' },
  { text: 'Checking SoundCloud link...', type: 'info' },
  { text: 'Transmitting to review queue...', type: 'info' },
  { text: 'Received.', type: 'success' },
  { text: 'Added to our review queue.', type: 'success' },
  { text: 'We may reach out about future events.', type: 'data' },
]

export function SignalUpload() {
  const [state, setState] = useState<UploadState>('idle')
  const [soundcloudLink, setSoundcloudLink] = useState('')
  const [artistAlias, setArtistAlias] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (state !== 'uploading' || currentLogIndex >= UPLOAD_LOGS.length) {
      return
    }

    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, UPLOAD_LOGS[currentLogIndex]])
      setCurrentLogIndex((prev) => prev + 1)
    }, 400 + Math.random() * 300)

    return () => clearTimeout(timer)
  }, [state, currentLogIndex])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!soundcloudLink.trim()) return

    setState('uploading')
    setLogs([])
    setCurrentLogIndex(0)
    setErrorMessage(null)

    try {
      if (!SUPABASE_URL) {
        throw new Error('UPLOAD_OFFLINE')
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soundcloudUrl: soundcloudLink.trim(),
          artistAlias: artistAlias.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'UPLOAD_FAILED')
      }

      setLogs(UPLOAD_LOGS)
      setCurrentLogIndex(UPLOAD_LOGS.length)
      setState('success')
    } catch (err) {
      const code = err instanceof Error ? err.message : 'UPLOAD_FAILED'
      setErrorMessage(
        code === 'UPLOAD_OFFLINE'
          ? ARTISTS.uploadOffline
          : ARTISTS.uploadFailed
      )
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setSoundcloudLink('')
    setArtistAlias('')
    setLogs([])
    setCurrentLogIndex(0)
    setErrorMessage(null)
  }

  return (
    <section className="relative mt-16">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/30">
        <span className="font-mono text-xs text-arterial tracking-widest">
          {ARTISTS.uploadSection}
        </span>
        <div className="flex-1 h-px bg-white/10" />
        <span className="font-mono text-xs text-white/50">SoundCloud demo</span>
      </div>

      <div className="relative border border-white/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border-b border-white/30">
          <div className="w-2 h-2 rounded-full bg-arterial/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
          <div className="w-2 h-2 rounded-full bg-signal/40" />
          <span className="ml-4 font-mono text-xs text-white/50 tracking-wider">
            UPLOAD_TERMINAL_v2.1.0
          </span>
        </div>

        <div className="p-6">
          {state === 'idle' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-mono text-xs text-white/70 mb-2">
                  <span className="text-arterial">Link:</span> SoundCloud URL
                </label>
                <input
                  type="url"
                  value={soundcloudLink}
                  onChange={(e) => setSoundcloudLink(e.target.value)}
                  placeholder="https://soundcloud.com/..."
                  required
                  className={clsx(
                    'w-full px-4 py-3 bg-black/60 border border-white/40',
                    'font-mono text-sm text-white placeholder:text-white/50',
                    'focus:outline-none focus:border-arterial/50 focus:ring-2 focus:ring-arterial/30',
                    'transition-colors duration-200'
                  )}
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-white/70 mb-2">
                  <span className="text-arterial">Name:</span> Artist name{' '}
                  <span className="text-white/50">(OPTIONAL)</span>
                </label>
                <input
                  type="text"
                  value={artistAlias}
                  onChange={(e) => setArtistAlias(e.target.value)}
                  placeholder="YOUR_ALIAS"
                  className={clsx(
                    'w-full px-4 py-3 bg-black/60 border border-white/40',
                    'font-mono text-sm text-white placeholder:text-white/50',
                    'focus:outline-none focus:border-arterial/50 focus:ring-2 focus:ring-arterial/30',
                    'transition-colors duration-200'
                  )}
                />
              </div>

              <button
                type="submit"
                className={clsx(
                  'relative w-full py-4 border border-arterial/50 bg-arterial/10',
                  'font-mono text-sm tracking-widest text-arterial',
                  'hover:bg-arterial/20 hover:border-arterial',
                  'focus:ring-2 focus:ring-arterial focus:outline-none',
                  'transition-all duration-200 group'
                )}
              >
                <span className="relative">[ {ARTISTS.uploadButton} ]</span>
              </button>
            </form>
          )}

          {(state === 'uploading' || state === 'success') && (
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={clsx(
                    'flex items-start gap-2',
                    log.type === 'success' && 'text-signal',
                    log.type === 'info' && 'text-white/70',
                    log.type === 'data' && 'text-arterial'
                  )}
                >
                  <span className="text-white/50">{'>'}</span>
                  <span>{log.text}</span>
                </div>
              ))}

              {state === 'uploading' && currentLogIndex < UPLOAD_LOGS.length && (
                <div className="flex items-start gap-2 text-white/70">
                  <span className="text-white/50">{'>'}</span>
                  <span className="animate-pulse">_</span>
                </div>
              )}

              {state === 'success' && (
                <div className="pt-6">
                  <button
                    onClick={handleReset}
                    className={clsx(
                      'px-6 py-3 min-h-[44px] border border-white/40',
                      'font-mono text-xs tracking-widest text-white/70 inline-flex items-center',
                      'hover:border-arterial/50 hover:text-arterial',
                      'focus:ring-2 focus:ring-arterial focus:outline-none',
                      'transition-all duration-200'
                    )}
                  >
                    [ NEW_UPLOAD ]
                  </button>
                </div>
              )}
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-4 font-mono text-sm">
              <p className="text-arterial">[ ERROR ] {errorMessage}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-white/40 text-white/70 hover:border-arterial/50 hover:text-arterial"
              >
                [ TRY AGAIN ]
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-white/50 leading-relaxed">
        Demos go straight to the KAMIKAZE team inbox for review. By uploading, you agree we may
        listen and contact you about future events. No guarantees — we listen to everything.
      </p>
    </section>
  )
}
