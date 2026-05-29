export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          whatsapp: string
          problem: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          whatsapp: string
          problem: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          whatsapp?: string
          problem?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
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
      analytics_events: {
        Row: {
          id: string
          event_type: string
          page_path: string | null
          device_type: string | null
          browser: string | null
          country: string | null
          visitor_id: string | null
          session_id: string | null
          lead_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          page_path?: string | null
          device_type?: string | null
          browser?: string | null
          country?: string | null
          visitor_id?: string | null
          session_id?: string | null
          lead_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          page_path?: string | null
          device_type?: string | null
          browser?: string | null
          country?: string | null
          visitor_id?: string | null
          session_id?: string | null
          lead_id?: string | null
          created_at?: string
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