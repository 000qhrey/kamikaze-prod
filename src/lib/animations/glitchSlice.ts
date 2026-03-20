import { gsap } from 'gsap'

export interface GlitchSliceConfig {
  element: HTMLElement
  bands?: number
  maxOffset?: number
  duration?: number
  onComplete?: () => void
}

export function createGlitchSlice(config: GlitchSliceConfig): gsap.core.Timeline {
  const {
    element,
    bands = 4,
    maxOffset = 20,
    duration = 0.3,
    onComplete,
  } = config

  const timeline = gsap.timeline({ onComplete })

  // Store original styles
  const originalPosition = element.style.position
  const originalOverflow = element.style.overflow

  // Setup
  element.style.position = 'relative'
  element.style.overflow = 'hidden'

  // Create band containers
  const bandElements: HTMLDivElement[] = []
  const bandHeight = 100 / bands

  for (let i = 0; i < bands; i++) {
    const band = document.createElement('div')
    band.className = 'glitch-band'
    band.style.cssText = `
      position: absolute;
      inset: 0;
      clip-path: inset(${i * bandHeight}% 0 ${100 - (i + 1) * bandHeight}% 0);
    `

    // Clone the element's content into the band
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.position = 'relative'
    band.appendChild(clone)

    element.appendChild(band)
    bandElements.push(band)

    // Initial offset
    const randomOffset = (Math.random() - 0.5) * 2 * maxOffset
    gsap.set(band, { x: randomOffset })
  }

  // Hide original content (we're using bands now)
  const originalContent = Array.from(element.childNodes).filter(
    (node) => !bandElements.includes(node as HTMLDivElement)
  )
  originalContent.forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '0'
    }
  })

  // Animate bands to center
  timeline.to(bandElements, {
    x: 0,
    duration,
    ease: 'elastic.out(1, 0.5)',
    stagger: 0.02,
    onComplete: () => {
      // Cleanup: remove bands, restore original
      bandElements.forEach((band) => band.remove())
      originalContent.forEach((node) => {
        if (node instanceof HTMLElement) {
          node.style.opacity = '1'
        }
      })
      element.style.position = originalPosition
      element.style.overflow = originalOverflow
    },
  })

  return timeline
}

// Simpler CSS-only version for use with React
export function getGlitchSliceKeyframes(maxOffset: number = 20): Keyframe[] {
  return [
    {
      transform: `translateX(${(Math.random() - 0.5) * 2 * maxOffset}px)`,
      opacity: 0,
    },
    {
      transform: 'translateX(0)',
      opacity: 1,
    },
  ]
}
