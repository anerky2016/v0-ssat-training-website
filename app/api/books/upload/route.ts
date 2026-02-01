import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['application/pdf', 'application/epub+zip']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type) &&
        !file.name.endsWith('.pdf') &&
        !file.name.endsWith('.epub')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and EPUB files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Determine file type
    const fileType = file.name.endsWith('.epub') ? 'epub' : 'pdf'

    // Create Supabase client (service role for server-side operations)
    const supabase = createClient()

    // Generate unique file name
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${userId}/${timestamp}_${sanitizedFileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('books')
      .upload(storagePath, buffer, {
        contentType: file.type || `application/${fileType}`,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('books')
      .getPublicUrl(storagePath)

    // Save book metadata to database
    const { data: bookData, error: dbError } = await supabase
      .from('uploaded_books')
      .insert({
        user_id: userId,
        title: file.name.replace(/\.(pdf|epub)$/i, ''),
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        file_path: urlData.publicUrl,
        storage_path: storagePath
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('books').remove([storagePath])
      return NextResponse.json(
        { error: `Failed to save book metadata: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      book: bookData
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
