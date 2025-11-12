import { NextResponse } from 'next/server'
import { getCacheStats } from '@/lib/audio-cache'

export async function GET() {
  try {
    const stats = getCacheStats()

    // Format total size in human-readable format
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
    }

    return NextResponse.json({
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize,
      totalSizeFormatted: formatBytes(stats.totalSize),
      files: stats.files.map(f => ({
        name: f.name,
        size: f.size,
        sizeFormatted: formatBytes(f.size),
        modified: f.modified.toISOString()
      }))
    })
  } catch (error) {
    console.error('❌ Failed to get cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    )
  }
}
