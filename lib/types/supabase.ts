export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_locations: {
        Row: {
          id: string
          user_id: string
          path: string
          timestamp: number
          device_id: string
          device_name: string | null
          page_title: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          path: string
          timestamp: number
          device_id: string
          device_name?: string | null
          page_title?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          path?: string
          timestamp?: number
          device_id?: string
          device_name?: string | null
          page_title?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
