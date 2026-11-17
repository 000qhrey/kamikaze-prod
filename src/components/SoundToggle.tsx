'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { DOOR, door_to, hit, isOn, seal, setSound } from '@/lib/sound'

const KEY = 'k-sound'
const OPEN = /^\/(pass)?\/?$/ // home and /pass/ open the door; everything else stays muffled

/** Header toggle for the "room next door" atmosphere. Off by default; the dot blinks on the beat as an invitation. */
export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const pathname = usePathname()

  // first visit: if they left it on, arm a one-time gesture to start (autoplay is blocked)
  useEffect(() => {
    let stored = false
    try {
      stored = localStorage.getItem(KEY) === '1'
    } catch {}
    if (!stored) return
    const start = () => {
      setSound(true)
      setOn(true)
      door_to(OPEN.test(pathname) ? DOOR.open : DOOR.read)
      removeEventListener('pointerdown', start)
      removeEventListener('keydown', start)
    }
    addEventListener('pointerdown', start, { once: true })
    addEventListener('keydown', start, { once: true })
    return () => {
      removeEventListener('pointerdown', start)
      removeEventListener('keydown', start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // accents on the existing sigil events while the room is on
  useEffect(() => {
    const onKick = () => hit(0.9)
    const onFlash = () => seal()
    addEventListener('sigil:kick', onKick)
    addEventListener('kamikaze:flash', onFlash)
    return () => {
      removeEventListener('sigil:kick', onKick)
      removeEventListener('kamikaze:flash', onFlash)
    }
  }, [])

  // the door follows the route
  useEffect(() => {
    if (isOn()) door_to(OPEN.test(pathname) ? DOOR.open : DOOR.read)
  }, [pathname])

  const toggle = () => {
    const next = !on
    setSound(next)
    setOn(next)
    if (next) door_to(OPEN.test(pathname) ? DOOR.open : DOOR.read)
    try {
      localStorage.setItem(KEY, next ? '1' : '0')
    } catch {}
  }

  return (
    <button type="button" aria-pressed={on} onClick={toggle} className="mono relative z-[2] flex min-h-[44px] items-center gap-2 px-1" title={on ? 'Mute the room' : 'Hear the room'}>
      <span className={`sound-dot ${on ? 'on' : ''}`} aria-hidden="true" />
      <span className="hidden sm:inline">{on ? 'Sound on' : 'Sound'}</span>
    </button>
  )
}
