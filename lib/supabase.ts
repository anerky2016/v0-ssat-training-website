import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isConfigured = supabaseUrl && supabaseAnonKey

// Initialize Supabase client only if configured
let supabase: ReturnType<typeof createClient<Database>> | null = null

if (isConfigured) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // We're using Firebase for auth
    },
    realtime: {
      params: {
        eventsPerSecond: 2, // Limit real-time events to prevent excessive updates
      },
    },
  })
} else {
  console.warn('Supabase is not configured. Location sync will be disabled.')
}

export { supabase }
