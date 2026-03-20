export class FilmGrainRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number | null = null
  private lastRender = 0
  private interval = 50 // ms between updates

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx
  }

  private resize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  private renderGrain(): void {
    const { width, height } = this.canvas
    const imageData = this.ctx.createImageData(width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255
      data[i] = noise     // R
      data[i + 1] = noise // G
      data[i + 2] = noise // B
      data[i + 3] = 8     // A (very low opacity)
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private animate = (timestamp: number): void => {
    if (timestamp - this.lastRender >= this.interval) {
      this.renderGrain()
      this.lastRender = timestamp
    }
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  start(): void {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    window.removeEventListener('resize', () => this.resize())
  }

  setInterval(ms: number): void {
    this.interval = ms
  }
}
