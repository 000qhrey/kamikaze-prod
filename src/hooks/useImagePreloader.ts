'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAssetPath } from '@/lib/basePath'

interface UseImagePreloaderResult {
  images: HTMLImageElement[]
  progress: number
  isLoaded: boolean
  error: string | null
}

export function useImagePreloader(imagePaths: string[]): UseImagePreloaderResult {
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preloadImages = useCallback(async () => {
    if (imagePaths.length === 0) {
      setIsLoaded(true)
      return
    }

    const loadedImages: HTMLImageElement[] = new Array(imagePaths.length)
    let loadedCount = 0

    const loadImage = (src: string, index: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          loadedImages[index] = img
          loadedCount++
          setProgress(loadedCount / imagePaths.length)
          resolve()
        }
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${src}`))
        }
        img.src = src
      })
    }

    try {
      // Load images in batches to avoid overwhelming the browser
      const batchSize = 10
      for (let i = 0; i < imagePaths.length; i += batchSize) {
        const batch = imagePaths.slice(i, i + batchSize)
        await Promise.all(
          batch.map((src, batchIndex) => loadImage(src, i + batchIndex))
        )
      }

      setImages(loadedImages)
      setIsLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images')
    }
  }, [imagePaths])

  useEffect(() => {
    preloadImages()
  }, [preloadImages])

  return { images, progress, isLoaded, error }
}

// Generate frame paths for the sigil sequence
export function generateFramePaths(count: number = 120): string[] {
  return Array.from({ length: count }, (_, i) => getAssetPath(`/sequence/${i + 1}.png`))
}
