export class GlitchTransition {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  private resize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  // Simple chromatic aberration flash out
  async glitchOut(duration: number = 200): Promise<void> {
    return new Promise((resolve) => {
      const { width, height } = this.canvas
      const startTime = performance.now()

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height)

        // Chromatic aberration intensity - peaks in middle, fades at end
        const intensity = Math.sin(progress * Math.PI) * 0.6

        if (intensity > 0.05) {
          // Red channel - offset left
          this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.4})`
          this.ctx.fillRect(0, 0, width * 0.4, height)

          // Cyan channel - offset right
          this.ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.4})`
          this.ctx.fillRect(width * 0.6, 0, width * 0.4, height)

          // Horizontal glitch lines
          const lineCount = Math.floor(intensity * 8)
          for (let i = 0; i < lineCount; i++) {
            const y = Math.random() * height
            const lineHeight = 2 + Math.random() * 4
            const offset = (Math.random() - 0.5) * 20 * intensity

            this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.6})`
            this.ctx.fillRect(offset, y, width, lineHeight)

            this.ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.6})`
            this.ctx.fillRect(-offset, y + 2, width, lineHeight)
          }

          // Edge glow
          this.ctx.fillStyle = `rgba(204, 0, 0, ${intensity * 0.5})`
          this.ctx.fillRect(0, 0, 4, height)
          this.ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.5})`
          this.ctx.fillRect(width - 4, 0, 4, height)
        }

        // Fade to black at end
        if (progress > 0.7) {
          const fadeProgress = (progress - 0.7) / 0.3
          this.ctx.fillStyle = `rgba(0, 0, 0, ${fadeProgress})`
          this.ctx.fillRect(0, 0, width, height)
        }

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate)
        } else {
          // End with black screen
          this.ctx.fillStyle = '#000'
          this.ctx.fillRect(0, 0, width, height)
          resolve()
        }
      }

      this.animationFrame = requestAnimationFrame(animate)
    })
  }

  // Simple chromatic aberration flash in (from black)
  async glitchIn(duration: number = 150): Promise<void> {
    return new Promise((resolve) => {
      const { width, height } = this.canvas
      const startTime = performance.now()

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Start from black, fade out
        const blackOpacity = 1 - progress

        this.ctx.clearRect(0, 0, width, height)

        // Chromatic aberration - strongest at start, fades out
        const intensity = (1 - progress) * 0.4

        if (intensity > 0.05) {
          // Red channel - offset left
          this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.3})`
          this.ctx.fillRect(0, 0, width * 0.3, height)

          // Cyan channel - offset right
          this.ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.3})`
          this.ctx.fillRect(width * 0.7, 0, width * 0.3, height)

          // Quick glitch lines at start
          if (progress < 0.3) {
            const lineCount = Math.floor((1 - progress / 0.3) * 5)
            for (let i = 0; i < lineCount; i++) {
              const y = Math.random() * height
              const offset = (Math.random() - 0.5) * 15

              this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity})`
              this.ctx.fillRect(offset, y, width, 2)

              this.ctx.fillStyle = `rgba(0, 255, 255, ${intensity})`
              this.ctx.fillRect(-offset, y + 1, width, 2)
            }
          }
        }

        // Black overlay fading out
        if (blackOpacity > 0.05) {
          this.ctx.fillStyle = `rgba(0, 0, 0, ${blackOpacity})`
          this.ctx.fillRect(0, 0, width, height)
        }

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate)
        } else {
          this.clear()
          resolve()
        }
      }

      this.animationFrame = requestAnimationFrame(animate)
    })
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}
