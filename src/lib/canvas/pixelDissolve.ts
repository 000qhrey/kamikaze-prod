interface PixelBlock {
  x: number
  y: number
  originX: number
  originY: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  imageData: ImageData
}

export class PixelDissolveTransition {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private blocks: PixelBlock[] = []
  private blockSize = 32
  private phase: 'idle' | 'scatter' | 'flash' | 'assemble' = 'idle'
  private animationFrame: number | null = null
  private sigilFrames: HTMLImageElement[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx
    this.resize()
  }

  setSigilFrames(frames: HTMLImageElement[]): void {
    this.sigilFrames = frames
  }

  private resize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  async captureElement(element: HTMLElement): Promise<ImageData> {
    // Use html2canvas-like approach with native canvas
    // For simplicity, we'll create a solid color representation
    // In production, use html2canvas library

    const rect = element.getBoundingClientRect()
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = rect.width
    tempCanvas.height = rect.height
    const tempCtx = tempCanvas.getContext('2d')!

    // Capture computed styles and approximate render
    // This is a simplified version - real implementation would use html2canvas
    tempCtx.fillStyle = '#000000'
    tempCtx.fillRect(0, 0, rect.width, rect.height)

    return tempCtx.getImageData(0, 0, rect.width, rect.height)
  }

  createBlocks(imageData: ImageData, scatter: boolean = true): void {
    this.blocks = []
    const { width, height } = imageData

    const cols = Math.ceil(width / this.blockSize)
    const rows = Math.ceil(height / this.blockSize)

    const offsetX = (this.canvas.width - width) / 2
    const offsetY = (this.canvas.height - height) / 2

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * this.blockSize
        const y = row * this.blockSize
        const blockWidth = Math.min(this.blockSize, width - x)
        const blockHeight = Math.min(this.blockSize, height - y)

        // Extract block image data
        const blockData = this.ctx.createImageData(blockWidth, blockHeight)
        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const srcIdx = ((y + by) * width + (x + bx)) * 4
            const dstIdx = (by * blockWidth + bx) * 4
            blockData.data[dstIdx] = imageData.data[srcIdx]
            blockData.data[dstIdx + 1] = imageData.data[srcIdx + 1]
            blockData.data[dstIdx + 2] = imageData.data[srcIdx + 2]
            blockData.data[dstIdx + 3] = imageData.data[srcIdx + 3]
          }
        }

        const targetX = offsetX + x
        const targetY = offsetY + y

        const angle = Math.random() * Math.PI * 2
        const speed = 300 + Math.random() * 400

        this.blocks.push({
          x: scatter ? targetX : targetX + Math.cos(angle) * 1000,
          y: scatter ? targetY : targetY + Math.sin(angle) * 1000,
          originX: targetX,
          originY: targetY,
          targetX,
          targetY,
          vx: scatter ? Math.cos(angle) * speed : 0,
          vy: scatter ? Math.sin(angle) * speed : 0,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 360,
          imageData: blockData,
        })
      }
    }
  }

  private async scatter(duration: number = 400): Promise<void> {
    return new Promise((resolve) => {
      this.phase = 'scatter'
      const startTime = performance.now()

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // ease out cubic

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.blocks.forEach((block) => {
          const x = block.originX + block.vx * easeProgress
          const y = block.originY + block.vy * easeProgress
          const rotation = block.rotation + block.rotationSpeed * easeProgress

          this.ctx.save()
          this.ctx.translate(x + this.blockSize / 2, y + this.blockSize / 2)
          this.ctx.rotate((rotation * Math.PI) / 180)
          this.ctx.globalAlpha = 1 - progress
          this.ctx.putImageData(
            block.imageData,
            -this.blockSize / 2,
            -this.blockSize / 2
          )
          this.ctx.restore()
        })

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      this.animationFrame = requestAnimationFrame(animate)
    })
  }

  private async flash(duration: number = 83): Promise<void> {
    return new Promise((resolve) => {
      this.phase = 'flash'

      // Clear to black
      this.ctx.fillStyle = '#000000'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      // Draw sigil at 80% opacity if available
      if (this.sigilFrames.length > 0) {
        const frame = this.sigilFrames[0]
        this.ctx.globalAlpha = 0.8
        const scale = Math.min(
          this.canvas.width / frame.width,
          this.canvas.height / frame.height
        ) * 0.6
        const x = (this.canvas.width - frame.width * scale) / 2
        const y = (this.canvas.height - frame.height * scale) / 2
        this.ctx.drawImage(frame, x, y, frame.width * scale, frame.height * scale)
        this.ctx.globalAlpha = 1
      }

      setTimeout(() => {
        // Clear back to black
        this.ctx.fillStyle = '#000000'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        resolve()
      }, duration)
    })
  }

  private async assemble(duration: number = 400): Promise<void> {
    return new Promise((resolve) => {
      this.phase = 'assemble'
      const startTime = performance.now()

      // Randomize starting positions for assembly
      this.blocks.forEach((block) => {
        const angle = Math.random() * Math.PI * 2
        const distance = 800 + Math.random() * 400
        block.x = block.targetX + Math.cos(angle) * distance
        block.y = block.targetY + Math.sin(angle) * distance
        block.rotation = Math.random() * 360
      })

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // ease out cubic

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.blocks.forEach((block) => {
          const x = block.x + (block.targetX - block.x) * easeProgress
          const y = block.y + (block.targetY - block.y) * easeProgress
          const rotation = block.rotation * (1 - easeProgress)

          this.ctx.save()
          this.ctx.translate(x + this.blockSize / 2, y + this.blockSize / 2)
          this.ctx.rotate((rotation * Math.PI) / 180)
          this.ctx.globalAlpha = progress
          this.ctx.putImageData(
            block.imageData,
            -this.blockSize / 2,
            -this.blockSize / 2
          )
          this.ctx.restore()
        })

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate)
        } else {
          this.phase = 'idle'
          resolve()
        }
      }

      this.animationFrame = requestAnimationFrame(animate)
    })
  }

  async transition(fromImageData: ImageData, toImageData: ImageData): Promise<void> {
    this.resize()

    // Scatter current view
    this.createBlocks(fromImageData, true)
    await this.scatter()

    // Flash sigil
    await this.flash()

    // Assemble new view
    this.createBlocks(toImageData, false)
    await this.assemble()

    this.clear()
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.blocks = []
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}
