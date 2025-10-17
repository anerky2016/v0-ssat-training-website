import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if both environment variables are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface UserLoginLog {
  id?: string
  user_id: string
  email: string
  name: string
  image?: string
  login_at: string
  user_agent?: string
  ip_address?: string
}

export async function logUserLogin(loginData: Omit<UserLoginLog, 'id' | 'login_at'>) {
  // Skip if Supabase is not configured
  if (!supabase) {
    console.log('Supabase not configured - skipping login tracking')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_login_logs')
      .insert({
        ...loginData,
        login_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error logging user login:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to log user login:', error)
    return null
  }
}

export async function getUserLoginHistory(userId: string, limit = 10) {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('user_login_logs')
      .select('*')
      .eq('user_id', userId)
      .order('login_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user login history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch user login history:', error)
    return []
  }
}

export async function getRecentLogins(limit = 50) {
  if (!supabase) return []

  try {
    const { data, error} = await supabase
      .from('user_login_logs')
      .select('*')
      .order('login_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent logins:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch recent logins:', error)
    return []
  }
}
