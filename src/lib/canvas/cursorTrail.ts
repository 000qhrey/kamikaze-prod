interface TrailPoint {
  x: number
  y: number
  age: number
  opacity: number
}

export class CursorTrailRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private points: TrailPoint[] = []
  private maxPoints = 5
  private decayTime = 300
  private animationFrame: number | null = null
  private lastTime = 0
  private color = '#CC0000'
  private dotSize = 4

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

  addPoint(x: number, y: number): void {
    this.points.push({ x, y, age: 0, opacity: 1 })

    // Keep only maxPoints
    while (this.points.length > this.maxPoints) {
      this.points.shift()
    }
  }

  private update(deltaTime: number): void {
    this.points = this.points
      .map((point) => ({
        ...point,
        age: point.age + deltaTime,
        opacity: 1 - point.age / this.decayTime,
      }))
      .filter((point) => point.opacity > 0)
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.points.forEach((point) => {
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, this.dotSize, 0, Math.PI * 2)
      this.ctx.fillStyle = this.color
      this.ctx.globalAlpha = point.opacity * 0.8
      this.ctx.fill()
    })

    this.ctx.globalAlpha = 1
  }

  private animate = (timestamp: number): void => {
    const deltaTime = timestamp - this.lastTime
    this.lastTime = timestamp

    this.update(deltaTime)
    this.render()

    this.animationFrame = requestAnimationFrame(this.animate)
  }

  start(): void {
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.lastTime = performance.now()
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    window.removeEventListener('resize', () => this.resize())
  }

  setColor(color: string): void {
    this.color = color
  }

  setMaxPoints(count: number): void {
    this.maxPoints = count
  }
}
