import { gsap } from 'gsap'

export interface BurnInConfig {
  element: HTMLElement
  duration?: number
  color?: string
  onComplete?: () => void
}

export function burnInText(config: BurnInConfig): gsap.core.Timeline {
  const {
    element,
    duration = 0.4,
    color = '#EFEFEF',
    onComplete,
  } = config

  const timeline = gsap.timeline({ onComplete })

  // Start with intense bloom
  timeline.fromTo(
    element,
    {
      filter: 'brightness(3)',
      textShadow: `0 0 40px ${color}, 0 0 80px ${color}, 0 0 120px ${color}`,
      opacity: 0,
    },
    {
      filter: 'brightness(1)',
      textShadow: 'none',
      opacity: 1,
      duration,
      ease: 'power2.out',
    }
  )

  return timeline
}

// Letter-by-letter burn in with red flash
export function letterBurnIn(
  element: HTMLElement,
  options: {
    stagger?: number
    flashColor?: string
    finalColor?: string
    onComplete?: () => void
  } = {}
): gsap.core.Timeline {
  const {
    stagger = 0.08,
    flashColor = '#CC0000',
    finalColor = '#EFEFEF',
    onComplete,
  } = options

  const text = element.textContent || ''
  element.textContent = ''
  element.style.display = 'inline-block'

  // Create spans for each letter
  const letters = text.split('').map((char) => {
    const span = document.createElement('span')
    span.textContent = char === ' ' ? '\u00A0' : char
    span.style.display = 'inline-block'
    span.style.opacity = '0'
    element.appendChild(span)
    return span
  })

  const timeline = gsap.timeline({ onComplete })

  letters.forEach((letter, i) => {
    timeline.to(
      letter,
      {
        opacity: 1,
        color: flashColor,
        filter: 'brightness(2)',
        textShadow: `0 0 20px ${flashColor}`,
        duration: 0.05,
      },
      i * stagger
    )
    timeline.to(
      letter,
      {
        color: finalColor,
        filter: 'brightness(1)',
        textShadow: 'none',
        duration: 0.15,
        ease: 'power2.out',
      },
      i * stagger + 0.05
    )
  })

  return timeline
}
