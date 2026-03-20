const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}|/'

export interface ScrambleConfig {
  element: HTMLElement
  duration?: number
  interval?: number
  resolveToColor?: string
  finalColor?: string
  onComplete?: () => void
}

export function scrambleText(config: ScrambleConfig): () => void {
  const {
    element,
    duration = 400,
    interval = 30,
    resolveToColor = '#CC0000',
    finalColor = '#EFEFEF',
    onComplete,
  } = config

  const original = element.textContent || ''
  const chars = original.split('')
  let elapsed = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]

  intervalId = setInterval(() => {
    elapsed += interval

    if (elapsed >= duration) {
      // Resolve to original text
      element.textContent = original
      element.style.color = resolveToColor

      // Fade to final color
      setTimeout(() => {
        element.style.transition = 'color 0.3s ease'
        element.style.color = finalColor
        onComplete?.()
      }, 100)

      if (intervalId) clearInterval(intervalId)
      return
    }

    // Scramble characters
    const progress = elapsed / duration
    const scrambled = chars.map((char, i) => {
      // Keep spaces
      if (char === ' ') return ' '
      // Gradually lock in characters from left to right
      if (i < chars.length * progress * 0.5) return char
      return randomChar()
    })

    element.textContent = scrambled.join('')
  }, interval)

  // Return cleanup function
  return () => {
    if (intervalId) clearInterval(intervalId)
    element.textContent = original
    element.style.color = finalColor
  }
}

// React-friendly version that returns a promise
export function scrambleTextAsync(config: ScrambleConfig): Promise<void> {
  return new Promise((resolve) => {
    scrambleText({
      ...config,
      onComplete: () => {
        config.onComplete?.()
        resolve()
      },
    })
  })
}
