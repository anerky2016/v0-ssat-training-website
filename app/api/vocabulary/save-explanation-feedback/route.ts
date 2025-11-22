import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { questionId, explanation, feedback, regenerationAttempt } = await request.json()

    console.log('📊 [Feedback] Received:', {
      questionId,
      feedback,
      regenerationAttempt: regenerationAttempt || 0,
      timestamp: new Date().toISOString()
    })

    // Get current user (if logged in)
    const userId = auth?.currentUser?.uid || null

    // Skip if Supabase is not configured
    if (!supabase) {
      console.log('Supabase not configured - skipping feedback storage')
      return NextResponse.json({ success: true, stored: false })
    }

    // Save feedback to database
    const { error } = await supabase
      .from('ai_explanation_feedback')
      .insert({
        user_id: userId,
        question_id: questionId,
        explanation,
        feedback,
        regeneration_attempt: regenerationAttempt || 0,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('❌ [Feedback] Error saving to database:', error)
      // Don't fail the request - feedback is optional
      return NextResponse.json({ success: true, stored: false })
    }

    console.log('✅ [Feedback] Successfully stored')
    return NextResponse.json({ success: true, stored: true })
  } catch (error) {
    console.error('❌ [Feedback] Error:', error)
    // Don't fail the request - feedback is optional
    return NextResponse.json({ success: true, stored: false })
  }
}
