"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { supabase } from "@/lib/supabase"
import { getUserStoryHistory } from "@/lib/story-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugStoryHistoryPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkEverything()
  }, [])

  const checkEverything = async () => {
    setLoading(true)
    const info: any = {}

    // 1. Check Firebase Auth
    info.firebaseConfigured = !!auth
    info.currentUser = auth?.currentUser ? {
      uid: auth.currentUser.uid.substring(0, 8) + '...',
      email: auth.currentUser.email
    } : null

    // 2. Check Supabase
    info.supabaseConfigured = !!supabase

    if (supabase) {
      try {
        // Check if table exists
        const { data: tableCheck, error: tableError } = await supabase
          .from('story_generation_history')
          .select('count')
          .limit(0)

        info.tableExists = !tableError
        info.tableError = tableError?.message || null
      } catch (e: any) {
        info.tableExists = false
        info.tableError = e.message
      }

      // Try to fetch history
      if (auth?.currentUser) {
        try {
          const { data, error } = await supabase
            .from('story_generation_history')
            .select('*')
            .eq('user_id', auth.currentUser.uid)
            .order('generated_at', { ascending: false })
            .limit(5)

          info.directQuerySuccess = !error
          info.directQueryError = error?.message || null
          info.directQueryCount = data?.length || 0
          info.directQueryData = data

          // Try using the utility function
          const historyFromFunction = await getUserStoryHistory(5)
          info.functionQueryCount = historyFromFunction.length
          info.functionQueryData = historyFromFunction
        } catch (e: any) {
          info.directQuerySuccess = false
          info.directQueryError = e.message
        }
      }
    }

    // 3. Check environment variables
    info.hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    info.hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setDebugInfo(info)
    setLoading(false)
  }

  const insertTestStory = async () => {
    if (!auth?.currentUser || !supabase) {
      alert('Not logged in or Supabase not configured')
      return
    }

    try {
      const { data, error } = await supabase
        .from('story_generation_history')
        .insert({
          user_id: auth.currentUser.uid,
          story_text: 'This is a test story created for debugging.',
          words_used: [
            { word: 'test', level: 'SSAT', meaning: 'a procedure to check quality' }
          ],
          story_length: 'short',
          story_type: 'adventure',
          story_subtype: 'quest',
          levels_selected: ['SSAT'],
          letters_filter: null,
          difficulties_filter: null,
          words_per_level: 3,
          word_count: 10,
          generated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error

      alert('Test story inserted successfully! ID: ' + data[0].id)
      checkEverything() // Refresh
    } catch (e: any) {
      alert('Error inserting test story: ' + e.message)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Story History Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEverything} disabled={loading}>
            {loading ? 'Checking...' : 'Refresh Check'}
          </Button>

          <div className="space-y-2">
            <h3 className="font-bold">Firebase Auth</h3>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify({
                configured: debugInfo.firebaseConfigured,
                currentUser: debugInfo.currentUser
              }, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">Supabase</h3>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify({
                configured: debugInfo.supabaseConfigured,
                hasUrl: debugInfo.hasSupabaseUrl,
                hasKey: debugInfo.hasSupabaseKey,
                tableExists: debugInfo.tableExists,
                tableError: debugInfo.tableError
              }, null, 2)}
            </pre>
          </div>

          {debugInfo.currentUser && (
            <>
              <div className="space-y-2">
                <h3 className="font-bold">Story Query Results</h3>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                  {JSON.stringify({
                    directQuerySuccess: debugInfo.directQuerySuccess,
                    directQueryError: debugInfo.directQueryError,
                    directQueryCount: debugInfo.directQueryCount,
                    functionQueryCount: debugInfo.functionQueryCount
                  }, null, 2)}
                </pre>
              </div>

              {debugInfo.directQueryData && debugInfo.directQueryData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold">Sample Stories</h3>
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(debugInfo.directQueryData, null, 2)}
                  </pre>
                </div>
              )}

              <Button onClick={insertTestStory} variant="secondary">
                Insert Test Story
              </Button>
            </>
          )}

          {!debugInfo.currentUser && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ You need to be logged in to test story history. Please log in first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
