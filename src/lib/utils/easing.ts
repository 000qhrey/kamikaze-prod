// Custom easing functions

export const easing = {
  // Smooth deceleration
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),

  // Smooth acceleration
  easeInCubic: (t: number): number => t * t * t,

  // Smooth acceleration and deceleration
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Elastic bounce
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },

  // Overshoot
  easeOutBack: (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },

  // Exponential
  easeOutExpo: (t: number): number =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

  // Lenis-style smooth scroll easing
  lenis: (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
}

// Interpolate between values with easing
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
