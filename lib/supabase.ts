import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create the client if both environment variables are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We're using Firebase for auth
      },
      realtime: {
        params: {
          eventsPerSecond: 2, // Limit real-time events to prevent excessive updates
        },
      },
    })
  : null

// ===== USER LOGIN LOGS =====

export interface UserLoginLog {
  id?: string
  user_id: string
  email: string
  name: string
  image?: string
  login_at: string
  user_agent?: string
  ip_address?: string
  provider?: string
  provider_id?: string
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

// ===== STUDY SESSIONS =====

export interface StudySession {
  id?: string
  user_id: string
  topic_path: string
  topic_title: string
  category: string
  timestamp: string
  duration: number
  problems_viewed: number
  difficulty?: string
}

export async function saveStudySession(userId: string, session: Omit<StudySession, 'id' | 'user_id'>) {
  if (!supabase) {
    console.log('Supabase not configured - skipping study session save')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        ...session,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving study session:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to save study session:', error)
    return null
  }
}

export async function getUserStudySessions(userId: string, limit = 500) {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching study sessions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch study sessions:', error)
    return []
  }
}

// ===== LESSON COMPLETIONS =====

export interface LessonCompletion {
  id?: string
  user_id: string
  topic_path: string
  topic_title: string
  completion_timestamp: string
  review_count: number
  next_review_date: string
}

export async function saveLessonCompletion(userId: string, completion: Omit<LessonCompletion, 'id' | 'user_id'>) {
  if (!supabase) {
    console.log('Supabase not configured - skipping lesson completion save')
    return null
  }

  try {
    // Check if lesson already exists (use maybeSingle to avoid error when no rows)
    const { data: existing, error: fetchError } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_path', completion.topic_path)
      .maybeSingle()

    if (fetchError) {
      console.error('Error checking lesson completion:', fetchError)
      return null
    }

    if (existing) {
      // Update existing completion
      const { data, error } = await supabase
        .from('lesson_completions')
        .update(completion)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating lesson completion:', error)
        return null
      }

      return data
    } else {
      // Insert new completion
      const { data, error } = await supabase
        .from('lesson_completions')
        .insert({
          user_id: userId,
          ...completion,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving lesson completion:', error)
        return null
      }

      return data
    }
  } catch (error) {
    console.error('Failed to save lesson completion:', error)
    return null
  }
}

export async function getUserLessonCompletions(userId: string) {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completion_timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching lesson completions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch lesson completions:', error)
    return []
  }
}

export async function deleteLessonCompletion(userId: string, topicPath: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping lesson completion delete')
    return null
  }

  try {
    const { error } = await supabase
      .from('lesson_completions')
      .delete()
      .eq('user_id', userId)
      .eq('topic_path', topicPath)

    if (error) {
      console.error('Error deleting lesson completion:', error)
      return null
    }

    return true
  } catch (error) {
    console.error('Failed to delete lesson completion:', error)
    return null
  }
}

// ===== NOTES =====

export interface NoteData {
  id?: string
  user_id: string
  title: string
  content: string
  screenshot?: string
  path: string
  timestamp: string
  updated_at: string
}

export async function saveNote(userId: string, note: Omit<NoteData, 'id' | 'user_id'>) {
  if (!supabase) {
    console.log('Supabase not configured - skipping note save')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        ...note,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving note:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to save note:', error)
    return null
  }
}

export async function getUserNotes(userId: string, limit = 1000) {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return []
  }
}

export async function updateNote(noteId: string, userId: string, updates: Partial<Omit<NoteData, 'id' | 'user_id' | 'timestamp'>>) {
  if (!supabase) {
    console.log('Supabase not configured - skipping note update')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to update note:', error)
    return null
  }
}

export async function deleteNote(noteId: string, userId: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping note delete')
    return null
  }

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting note:', error)
      return null
    }

    return true
  } catch (error) {
    console.error('Failed to delete note:', error)
    return null
  }
}

// ===== BOOKMARKS =====

export interface BookmarkData {
  id?: string
  user_id: string
  path: string
  title: string
  timestamp: string
}

export async function saveBookmark(userId: string, path: string, title: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping bookmark save')
    return null
  }

  try {
    const now = new Date().toISOString()

    // Check if user already has a bookmark
    const { data: existing, error: fetchError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error checking bookmark:', fetchError)
      return null
    }

    if (existing) {
      // Update existing bookmark
      const { data, error } = await supabase
        .from('bookmarks')
        .update({
          path,
          title,
          timestamp: now,
          updated_at: now,
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating bookmark:', error)
        return null
      }

      return data
    } else {
      // Insert new bookmark
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          path,
          title,
          timestamp: now,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving bookmark:', error)
        return null
      }

      return data
    }
  } catch (error) {
    console.error('Failed to save bookmark:', error)
    return null
  }
}

export async function getUserBookmark(userId: string) {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching bookmark:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to fetch bookmark:', error)
    return null
  }
}

export async function deleteBookmark(userId: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping bookmark delete')
    return null
  }

  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting bookmark:', error)
      return null
    }

    return true
  } catch (error) {
    console.error('Failed to delete bookmark:', error)
    return null
  }
}

// ===== USER SETTINGS =====

export interface UserSettings {
  id?: string
  user_id: string
  location_sync_enabled: boolean
  created_at?: string
  updated_at?: string
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user settings:', error)
      return null
    }

    // Return default settings if no settings exist
    if (!data) {
      return {
        user_id: userId,
        location_sync_enabled: true, // Default to enabled
      }
    }

    return data
  } catch (error) {
    console.error('Failed to fetch user settings:', error)
    return null
  }
}

export async function saveUserSettings(userId: string, settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
  if (!supabase) {
    console.log('Supabase not configured - skipping settings save')
    return null
  }

  try {
    // Check if settings already exist
    const { data: existing, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error checking user settings:', fetchError)
      return null
    }

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user settings:', error)
        return null
      }

      return data
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          ...settings,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving user settings:', error)
        return null
      }

      return data
    }
  } catch (error) {
    console.error('Failed to save user settings:', error)
    return null
  }
}
