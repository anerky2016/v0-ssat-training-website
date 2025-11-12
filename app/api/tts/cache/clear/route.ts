import { NextRequest, NextResponse } from 'next/server'
import { clearCache, clearOldCache } from '@/lib/audio-cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { daysOld } = body

    let deletedCount: number

    if (daysOld && typeof daysOld === 'number') {
      // Clear files older than specified days
      deletedCount = clearOldCache(daysOld)
      console.log(`🗑️  Cleared ${deletedCount} files older than ${daysOld} days`)
    } else {
      // Clear all cache
      deletedCount = clearCache()
      console.log(`🗑️  Cleared all ${deletedCount} cache files`)
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: daysOld
        ? `Deleted ${deletedCount} files older than ${daysOld} days`
        : `Deleted all ${deletedCount} cache files`
    })
  } catch (error) {
    console.error('❌ Failed to clear cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
