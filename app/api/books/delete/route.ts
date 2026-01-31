import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')
    const userId = searchParams.get('userId')

    if (!bookId || !userId) {
      return NextResponse.json(
        { error: 'Book ID and User ID are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Set user context for RLS
    await supabase.rpc('set_config', {
      setting: 'app.current_user_id',
      value: userId
    })

    // Get book to find storage path
    const { data: book, error: fetchError } = await supabase
      .from('uploaded_books')
      .select('storage_path')
      .eq('id', bookId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('books')
      .remove([book.storage_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('uploaded_books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', userId)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return NextResponse.json(
        { error: 'Failed to delete book' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
