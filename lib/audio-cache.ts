/**
 * Audio Cache Utilities
 * Handles both server-side file caching and client-side memory caching
 */

// Only import Node.js modules if we're on the server
let crypto: typeof import('crypto') | null = null
let fs: typeof import('fs') | null = null
let path: typeof import('path') | null = null

if (typeof window === 'undefined') {
  crypto = require('crypto')
  fs = require('fs')
  path = require('path')
}

// Cache directory path (relative to project root)
const CACHE_DIR = typeof window === 'undefined'
  ? path!.join(process.cwd(), 'public', 'audio', 'tts')
  : ''

/**
 * SERVER-SIDE FILE CACHE UTILITIES
 */

/**
 * Generate a unique cache key (filename) for given text
 * Uses MD5 hash for consistent, URL-safe filenames
 */
export function getCacheKey(text: string, voiceType?: string): string {
  if (!crypto) throw new Error('getCacheKey can only be used on the server')
  const normalizedText = text.toLowerCase().trim()
  const hashInput = voiceType ? `${normalizedText}:${voiceType}` : normalizedText
  const hash = crypto.createHash('md5').update(hashInput).digest('hex')
  return `${hash}.mp3`
}

/**
 * Get the full file path for a cached audio file
 */
export function getCachePath(cacheKey: string): string {
  if (!path) throw new Error('getCachePath can only be used on the server')
  return path.join(CACHE_DIR, cacheKey)
}

/**
 * Get the public URL for a cached audio file
 */
export function getCacheUrl(cacheKey: string): string {
  return `/audio/tts/${cacheKey}`
}

/**
 * Check if audio file exists in cache
 */
export function isCached(text: string, voiceType?: string): boolean {
  if (!fs) throw new Error('isCached can only be used on the server')
  const cacheKey = getCacheKey(text, voiceType)
  const cachePath = getCachePath(cacheKey)
  return fs.existsSync(cachePath)
}

/**
 * Save audio buffer to cache
 */
export async function saveToCache(
  text: string,
  audioBuffer: Buffer,
  voiceType?: string
): Promise<string> {
  if (!fs) throw new Error('saveToCache can only be used on the server')
  const cacheKey = getCacheKey(text, voiceType)
  const cachePath = getCachePath(cacheKey)

  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }

  // Write audio file
  fs.writeFileSync(cachePath, audioBuffer)

  console.log('💾 [Audio Cache] Saved to cache:', {
    text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
    cacheKey,
    size: audioBuffer.length,
    voiceType
  })

  return cacheKey
}

/**
 * Read audio from cache
 */
export function readFromCache(cacheKey: string): Buffer | null {
  if (!fs) throw new Error('readFromCache can only be used on the server')
  const cachePath = getCachePath(cacheKey)

  if (!fs.existsSync(cachePath)) {
    return null
  }

  return fs.readFileSync(cachePath)
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalFiles: number
  totalSize: number
  files: Array<{ name: string; size: number; modified: Date }>
} {
  if (!fs || !path) throw new Error('getCacheStats can only be used on the server')
  if (!fs.existsSync(CACHE_DIR)) {
    return { totalFiles: 0, totalSize: 0, files: [] }
  }

  const files = fs.readdirSync(CACHE_DIR)
    .filter(f => f.endsWith('.mp3'))
    .map(filename => {
      const filePath = path!.join(CACHE_DIR, filename)
      const stats = fs!.statSync(filePath)
      return {
        name: filename,
        size: stats.size,
        modified: stats.mtime
      }
    })

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  return {
    totalFiles: files.length,
    totalSize,
    files: files.sort((a, b) => b.modified.getTime() - a.modified.getTime())
  }
}

/**
 * Clear old cache files (older than specified days)
 */
export function clearOldCache(daysOld: number = 30): number {
  if (!fs || !path) throw new Error('clearOldCache can only be used on the server')
  if (!fs.existsSync(CACHE_DIR)) {
    return 0
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.mp3'))
  let deletedCount = 0

  for (const filename of files) {
    const filePath = path.join(CACHE_DIR, filename)
    const stats = fs.statSync(filePath)

    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath)
      deletedCount++
      console.log('🗑️  [Audio Cache] Deleted old file:', filename)
    }
  }

  return deletedCount
}

/**
 * Clear entire cache
 */
export function clearCache(): number {
  if (!fs || !path) throw new Error('clearCache can only be used on the server')
  if (!fs.existsSync(CACHE_DIR)) {
    return 0
  }

  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.mp3'))

  for (const filename of files) {
    fs.unlinkSync(path.join(CACHE_DIR, filename))
  }

  console.log('🗑️  [Audio Cache] Cleared all cache files:', files.length)
  return files.length
}

/**
 * CLIENT-SIDE MEMORY CACHE (for browser)
 */

class ClientAudioCache {
  private cache: Map<string, ArrayBuffer>
  private maxSize: number

  constructor(maxSize: number = 500) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  private getCacheKey(text: string): string {
    return text.toLowerCase().trim()
  }

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

  set(text: string, audioBuffer: ArrayBuffer): void {
    const key = this.getCacheKey(text)

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, audioBuffer)
  }

  has(text: string): boolean {
    const key = this.getCacheKey(text)
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Export singleton instance for client-side use
export const audioCache = new ClientAudioCache()
