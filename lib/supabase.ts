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
  audio_url?: string
  path: string
  timestamp: string
  updated_at: string
}

/**
 * Upload audio file to Supabase Storage
 * @param userId - User ID for folder organization
 * @param audioBlob - Audio blob to upload
 * @param noteId - Optional note ID for file naming
 * @returns Public URL of uploaded audio file
 */
export async function uploadAudio(userId: string, audioBlob: Blob, noteId?: string): Promise<string | null> {
  if (!supabase) {
    console.log('Supabase not configured - skipping audio upload')
    return null
  }

  try {
    // Create filename with timestamp and note ID
    const timestamp = Date.now()
    const filename = noteId
      ? `${userId}/${noteId}_${timestamp}.webm`
      : `${userId}/temp_${timestamp}.webm`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('note-audio')
      .upload(filename, audioBlob, {
        contentType: 'audio/webm',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading audio:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('note-audio')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Failed to upload audio:', error)
    return null
  }
}

/**
 * Delete audio file from Supabase Storage
 * @param audioUrl - Public URL of the audio file
 * @returns True if successful
 */
export async function deleteAudio(audioUrl: string): Promise<boolean> {
  if (!supabase) {
    console.log('Supabase not configured - skipping audio delete')
    return false
  }

  try {
    // Extract path from public URL
    const url = new URL(audioUrl)
    const pathMatch = url.pathname.match(/\/note-audio\/(.+)/)

    if (!pathMatch) {
      console.error('Invalid audio URL format')
      return false
    }

    const filePath = pathMatch[1]

    const { error } = await supabase.storage
      .from('note-audio')
      .remove([filePath])

    if (error) {
      console.error('Error deleting audio:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to delete audio:', error)
    return false
  }
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
  master_device_id?: string | null
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

// ===== DEVICE MANAGEMENT =====

export interface Device {
  id?: string
  user_id: string
  device_id: string
  device_name: string
  last_active: number
  is_online: boolean
  created_at?: string
  updated_at?: string
}

/**
 * Save or update a device record
 * Uses upsert to create if doesn't exist, or update if it does
 */
export async function saveDevice(userId: string, deviceId: string, deviceName: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping device save')
    return null
  }

  try {
    const now = Date.now()
    const { data, error } = await supabase
      .from('devices')
      .upsert(
        {
          user_id: userId,
          device_id: deviceId,
          device_name: deviceName,
          last_active: now,
          is_online: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,device_id',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving device:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to save device:', error)
    return null
  }
}

/**
 * Update device activity timestamp
 */
export async function updateDeviceActivity(userId: string, deviceId: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping device activity update')
    return null
  }

  try {
    const now = Date.now()
    const { data, error } = await supabase
      .from('devices')
      .update({
        last_active: now,
        is_online: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating device activity:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to update device activity:', error)
    return null
  }
}

export interface UserDevice {
  device_id: string
  device_name?: string
  path: string
  page_title?: string
  timestamp: number
  updated_at: string
}

/**
 * Get all active devices for a user from devices table
 * Only returns devices that have been active in the past 90 days
 */
export async function getUserDevices(userId: string, daysBack: number = 90): Promise<Device[]> {
  if (!supabase) return []

  try {
    // Calculate timestamp for N days ago
    const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId)
      .gte('last_active', cutoffTime) // Only devices from past N days
      .order('last_active', { ascending: false })

    if (error) {
      console.error('Error fetching user devices:', error)
      return []
    }

    console.log(`📋 Found ${data?.length || 0} devices active in the past ${daysBack} days`)

    return data || []
  } catch (error) {
    console.error('Failed to fetch user devices:', error)
    return []
  }
}

/**
 * Mark a device as offline
 */
export async function setDeviceOffline(userId: string, deviceId: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping device offline update')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('devices')
      .update({
        is_online: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .select()
      .single()

    if (error) {
      console.error('Error setting device offline:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to set device offline:', error)
    return null
  }
}

/**
 * Set a device as the master device for a user
 */
export async function setMasterDevice(userId: string, deviceId: string) {
  if (!supabase) {
    console.log('Supabase not configured - skipping master device update')
    return null
  }

  try {
    // First, ensure user settings exist
    const existing = await getUserSettings(userId)

    if (existing && existing.id) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          master_device_id: deviceId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error setting master device:', error)
        return null
      }

      return data
    } else {
      // Create new settings with master device
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          location_sync_enabled: true,
          master_device_id: deviceId,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating settings with master device:', error)
        return null
      }

      return data
    }
  } catch (error) {
    console.error('Failed to set master device:', error)
    return null
  }
}

// ===== VOCABULARY DIFFICULTY =====

export type DifficultyLevel = 0 | 1 | 2 | 3

export interface VocabularyDifficultyData {
  id?: string
  user_id: string
  word: string
  difficulty: DifficultyLevel
  updated_at: string
}

/**
 * Save or update vocabulary word difficulty
 * Uses upsert to create if doesn't exist, or update if it does
 */
export async function saveVocabularyDifficulty(
  userId: string,
  word: string,
  difficulty: DifficultyLevel
): Promise<VocabularyDifficultyData | null> {
  if (!supabase) {
    console.log('Supabase not configured - skipping vocabulary difficulty save')
    return null
  }

  try {
    const normalizedWord = word.toLowerCase()
    const { data, error } = await supabase
      .from('vocabulary_difficulty')
      .upsert(
        {
          user_id: userId,
          word: normalizedWord,
          difficulty,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,word',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving vocabulary difficulty:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to save vocabulary difficulty:', error)
    return null
  }
}

/**
 * Get all vocabulary difficulties for a user
 */
export async function getUserVocabularyDifficulties(
  userId: string
): Promise<VocabularyDifficultyData[]> {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('vocabulary_difficulty')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching vocabulary difficulties:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch vocabulary difficulties:', error)
    return []
  }
}

/**
 * Get difficulty for a specific word
 */
export async function getVocabularyDifficulty(
  userId: string,
  word: string
): Promise<DifficultyLevel | null> {
  if (!supabase) return null

  try {
    const normalizedWord = word.toLowerCase()
    const { data, error } = await supabase
      .from('vocabulary_difficulty')
      .select('difficulty')
      .eq('user_id', userId)
      .eq('word', normalizedWord)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - word not found
        return null
      }
      console.error('Error fetching vocabulary difficulty:', error)
      return null
    }

    return data?.difficulty ?? null
  } catch (error) {
    console.error('Failed to fetch vocabulary difficulty:', error)
    return null
  }
}

/**
 * Delete vocabulary difficulty for a word
 */
export async function deleteVocabularyDifficulty(
  userId: string,
  word: string
): Promise<boolean> {
  if (!supabase) return false

  try {
    const normalizedWord = word.toLowerCase()
    const { error } = await supabase
      .from('vocabulary_difficulty')
      .delete()
      .eq('user_id', userId)
      .eq('word', normalizedWord)

    if (error) {
      console.error('Error deleting vocabulary difficulty:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to delete vocabulary difficulty:', error)
    return false
  }
}

// ===== VOCABULARY DIFFICULTY HISTORY =====

export interface VocabularyDifficultyHistoryData {
  id?: string
  user_id: string
  word: string
  old_difficulty: DifficultyLevel | null
  new_difficulty: DifficultyLevel
  changed_at: string
}

/**
 * Save a vocabulary difficulty change to history
 */
export async function saveVocabularyDifficultyHistory(
  userId: string,
  word: string,
  oldDifficulty: DifficultyLevel | null,
  newDifficulty: DifficultyLevel
): Promise<VocabularyDifficultyHistoryData | null> {
  if (!supabase) {
    console.log('Supabase not configured - skipping vocabulary difficulty history save')
    return null
  }

  try {
    const normalizedWord = word.toLowerCase()
    const { data, error } = await supabase
      .from('vocabulary_difficulty_history')
      .insert({
        user_id: userId,
        word: normalizedWord,
        old_difficulty: oldDifficulty,
        new_difficulty: newDifficulty,
        changed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving vocabulary difficulty history:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to save vocabulary difficulty history:', error)
    return null
  }
}

/**
 * Get difficulty history for a specific word
 */
export async function getWordDifficultyHistory(
  userId: string,
  word: string,
  limit = 50
): Promise<VocabularyDifficultyHistoryData[]> {
  if (!supabase) return []

  try {
    const normalizedWord = word.toLowerCase()
    const { data, error } = await supabase
      .from('vocabulary_difficulty_history')
      .select('*')
      .eq('user_id', userId)
      .eq('word', normalizedWord)
      .order('changed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching word difficulty history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch word difficulty history:', error)
    return []
  }
}

/**
 * Get all difficulty history for a user
 */
export async function getUserDifficultyHistory(
  userId: string,
  limit = 100
): Promise<VocabularyDifficultyHistoryData[]> {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('vocabulary_difficulty_history')
      .select('*')
      .eq('user_id', userId)
      .order('changed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user difficulty history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch user difficulty history:', error)
    return []
  }
}
