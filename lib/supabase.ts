import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          title: string
          description: string
          author: string
          created_at: string
          updated_at: string
          total_videos: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          author: string
          created_at?: string
          updated_at?: string
          total_videos: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          author?: string
          created_at?: string
          updated_at?: string
          total_videos?: number
        }
      }
      course_videos: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          youtube_url: string
          thumbnail: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          youtube_url: string
          thumbnail?: string | null
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          youtube_url?: string
          thumbnail?: string | null
          order_index?: number
          created_at?: string
        }
      }
    }
  }
}