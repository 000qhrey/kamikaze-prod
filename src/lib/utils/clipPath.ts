// Generate a jagged polygon clip-path
export function generateJaggedClipPath(
  segments: number = 16,
  variance: number = 3
): string {
  const points: string[] = []

  // Top edge
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 100
    const y = i === 0 || i === segments ? 0 : Math.random() * variance
    points.push(`${x}% ${y}%`)
  }

  // Right edge
  for (let i = 1; i < segments; i++) {
    const x = 100 - Math.random() * variance
    const y = (i / segments) * 100
    points.push(`${x}% ${y}%`)
  }

  // Bottom edge (reversed)
  for (let i = segments; i >= 0; i--) {
    const x = (i / segments) * 100
    const y = i === 0 || i === segments ? 100 : 100 - Math.random() * variance
    points.push(`${x}% ${y}%`)
  }

  // Left edge
  for (let i = segments - 1; i > 0; i--) {
    const x = Math.random() * variance
    const y = (i / segments) * 100
    points.push(`${x}% ${y}%`)
  }

  return `polygon(${points.join(', ')})`
}

// Pre-defined jagged borders with consistent randomness
export const JAGGED_BORDERS = {
  card: `polygon(
    0% 2%, 3% 0%, 8% 3%, 15% 0%, 22% 2%, 28% 0%, 35% 1%, 42% 0%,
    48% 2%, 55% 0%, 62% 1%, 68% 0%, 75% 2%, 82% 0%, 88% 1%, 95% 0%,
    100% 2%, 100% 98%, 97% 100%, 92% 98%, 85% 100%, 78% 98%, 72% 100%,
    65% 99%, 58% 100%, 52% 98%, 45% 100%, 38% 99%, 32% 100%, 25% 98%,
    18% 100%, 12% 99%, 5% 100%, 0% 98%
  )`,

  torn: `polygon(
    0% 0%, 2% 100%, 5% 98%, 8% 100%, 12% 97%, 15% 100%, 20% 99%,
    25% 100%, 30% 98%, 35% 100%, 40% 97%, 45% 100%, 50% 99%,
    55% 100%, 60% 98%, 65% 100%, 70% 97%, 75% 100%, 80% 99%,
    85% 100%, 90% 98%, 95% 100%, 98% 97%, 100% 100%, 100% 0%
  )`,
}
