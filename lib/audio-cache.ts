// Audio cache for TTS to avoid repeated API calls
class AudioCache {
  private cache: Map<string, ArrayBuffer>
  private maxSize: number

  constructor(maxSize: number = 500) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  // Generate a cache key from text
  private getCacheKey(text: string): string {
    return text.toLowerCase().trim()
  }

  // Get audio from cache
  get(text: string): ArrayBuffer | null {
    const key = this.getCacheKey(text)
    const audio = this.cache.get(key)

    if (audio) {
      // Move to end (LRU cache)
      this.cache.delete(key)
      this.cache.set(key, audio)
    }

    return audio || null
  }

  // Store audio in cache
  set(text: string, audioBuffer: ArrayBuffer): void {
    const key = this.getCacheKey(text)

    // If cache is full, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, audioBuffer)
  }

  // Check if audio exists in cache
  has(text: string): boolean {
    const key = this.getCacheKey(text)
    return this.cache.has(key)
  }

  // Clear cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }
}

// Export singleton instance
export const audioCache = new AudioCache()
