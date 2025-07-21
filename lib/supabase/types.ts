export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      time_entries: {
        Row: {
          id: string
          user_id: string
          domain: string
          url: string | null
          title: string | null
          favicon: string | null
          time_spent: number
          timestamp: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          url?: string | null
          title?: string | null
          favicon?: string | null
          time_spent: number
          timestamp: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          url?: string | null
          title?: string | null
          favicon?: string | null
          time_spent?: number
          timestamp?: string
          date?: string
          created_at?: string
        }
      }
      user_categories: {
        Row: {
          id: string
          user_id: string
          categories: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          categories: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          categories?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
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
