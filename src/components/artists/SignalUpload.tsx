'use client'

import { useState, FormEvent, useEffect } from 'react'
import clsx from 'clsx'

type UploadState = 'idle' | 'uploading' | 'success'

interface LogEntry {
  text: string
  type: 'info' | 'success' | 'data'
}

export function SignalUpload() {
  const [state, setState] = useState<UploadState>('idle')
  const [soundcloudLink, setSoundcloudLink] = useState('')
  const [artistAlias, setArtistAlias] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentLogIndex, setCurrentLogIndex] = useState(0)

  const uploadLogs: LogEntry[] = [
    { text: 'INITIALIZING_UPLOAD_PROTOCOL...', type: 'info' },
    { text: 'VALIDATING_SOUNDCLOUD_ENDPOINT...', type: 'info' },
    { text: 'PACKET_RECEIVED.', type: 'success' },
    { text: 'SIGNAL_INTEGRATED_INTO_FUTURE_OPERATIONS.', type: 'success' },
    { text: 'KAMIKAZE_MAY_ACTIVATE_IN_YOUR_CITY.', type: 'data' },
  ]

  // Animate logs one by one
  useEffect(() => {
    if (state !== 'uploading' || currentLogIndex >= uploadLogs.length) {
      if (currentLogIndex >= uploadLogs.length && state === 'uploading') {
        setState('success')
      }
      return
    }

    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, uploadLogs[currentLogIndex]])
      setCurrentLogIndex((prev) => prev + 1)
    }, 400 + Math.random() * 300)

    return () => clearTimeout(timer)
  }, [state, currentLogIndex])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!soundcloudLink.trim()) return

    setState('uploading')
    setLogs([])
    setCurrentLogIndex(0)
  }

  const handleReset = () => {
    setState('idle')
    setSoundcloudLink('')
    setArtistAlias('')
    setLogs([])
    setCurrentLogIndex(0)
  }

  return (
    <section className="relative mt-16">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/30">
        <span className="font-mono text-xs text-arterial tracking-widest">
          [SYSTEM_UPLOAD]
        </span>
        <div className="flex-1 h-px bg-white/10" />
        <span className="font-mono text-xs text-white/50">
          SUBMIT_SIGNAL
        </span>
      </div>

      {/* Terminal container */}
      <div className="relative border border-white/30 bg-black/50 backdrop-blur-sm">
        {/* Terminal top bar */}
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
              {/* SoundCloud Link Input */}
              <div>
                <label className="block font-mono text-xs text-white/70 mb-2">
                  <span className="text-arterial">INPUT://</span> SOUNDCLOUD_LINK
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

              {/* Artist Alias Input */}
              <div>
                <label className="block font-mono text-xs text-white/70 mb-2">
                  <span className="text-arterial">INPUT://</span> ARTIST_ALIAS{' '}
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

              {/* Submit Button */}
              <button
                type="submit"
                className={clsx(
                  'relative w-full py-4 border border-arterial/50 bg-arterial/10',
                  'font-mono text-sm tracking-widest text-arterial',
                  'hover:bg-arterial/20 hover:border-arterial',
                  'focus:ring-2 focus:ring-arterial focus:outline-none',
                  'transition-all duration-200',
                  'group'
                )}
              >
                {/* Glitch effect layers */}
                <span
                  className="absolute inset-0 flex items-center justify-center text-cyan-400/30 opacity-0 group-hover:opacity-100"
                  style={{ transform: 'translate(-2px, -1px)' }}
                >
                  [ UPLOAD SIGNAL ]
                </span>
                <span
                  className="absolute inset-0 flex items-center justify-center text-red-500/30 opacity-0 group-hover:opacity-100"
                  style={{ transform: 'translate(2px, 1px)' }}
                >
                  [ UPLOAD SIGNAL ]
                </span>
                <span className="relative">[ UPLOAD SIGNAL ]</span>
              </button>
            </form>
          )}

          {(state === 'uploading' || state === 'success') && (
            <div className="space-y-2 font-mono text-sm">
              {/* Log entries */}
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

              {/* Cursor while uploading */}
              {state === 'uploading' && (
                <div className="flex items-start gap-2 text-white/70">
                  <span className="text-white/50">{'>'}</span>
                  <span className="animate-pulse">_</span>
                </div>
              )}

              {/* Reset button after success */}
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
        </div>

        {/* Scan line overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.1) 2px,
              rgba(255, 255, 255, 0.1) 4px
            )`,
          }}
        />
      </div>

      {/* Disclaimer */}
      <p className="mt-4 font-mono text-xs text-white/50 leading-relaxed">
        BY UPLOADING, YOU ACKNOWLEDGE THAT KAMIKAZE MAY FEATURE YOUR SIGNAL IN
        FUTURE BROADCASTS. NO GUARANTEES. NO PROMISES. JUST SOUND.
      </p>
    </section>
  )
}
