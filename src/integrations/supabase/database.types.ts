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
      analytics_events: {
        Row: {
          id: string
          created_at: string
          event_type: string
          session_id: string
          visitor_id: string
          device_type: string
          browser: string
          country: string
          country_code: string
          event_data: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          event_type: string
          session_id: string
          visitor_id: string
          device_type: string
          browser: string
          country: string
          country_code: string
          event_data?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          event_type?: string
          session_id?: string
          visitor_id?: string
          device_type?: string
          browser?: string
          country?: string
          country_code?: string
          event_data?: Json | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          lead_id: string
          text: string
          is_from_maestro: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          text: string
          is_from_maestro?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          text?: string
          is_from_maestro?: boolean
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          whatsapp: string
          country_code: string
          problem: string
          status: string
          created_at: string
          updated_at: string
          is_favorite: boolean
          notes: string | null
          answers: Json | null
          cards_selected: Json | null
          user_answers: Json | null
          last_interaction_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          whatsapp: string
          country_code: string
          problem: string
          status?: string
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
          notes?: string | null
          answers?: Json | null
          cards_selected?: Json | null
          user_answers?: Json | null
          last_interaction_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          whatsapp?: string
          country_code?: string
          problem?: string
          status?: string
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
          notes?: string | null
          answers?: Json | null
          cards_selected?: Json | null
          user_answers?: Json | null
          last_interaction_at?: string | null
          deleted_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          lead_id: string
          text: string
          is_from_maestro: boolean
          created_at: string
          is_read: boolean
          media_url: string | null
          media_type: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          text: string
          is_from_maestro?: boolean
          created_at?: string
          is_read?: boolean
          media_url?: string | null
          media_type?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          text?: string
          is_from_maestro?: boolean
          created_at?: string
          is_read?: boolean
          media_url?: string | null
          media_type?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          full_name: string | null
          created_at: string
          updated_at: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          email: string
          role?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}