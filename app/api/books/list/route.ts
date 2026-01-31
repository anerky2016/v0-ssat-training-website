import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Set user context for RLS
    await supabase.rpc('set_config', {
      setting: 'app.current_user_id',
      value: userId
    })

    // Get all books for user, sorted by last_read_at (most recent first)
    const { data: books, error } = await supabase
      .from('uploaded_books')
      .select('*')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false, nullsFirst: false })
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching books:', error)
      return NextResponse.json(
        { error: 'Failed to fetch books' },
        { status: 500 }
      )
    }

    return NextResponse.json({ books: books || [] })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
