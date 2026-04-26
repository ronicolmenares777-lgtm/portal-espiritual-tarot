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
      leads: {
        Row: {
          id: string
          name: string
          whatsapp: string
          country_code: string
          problem: string
          status: string
          ritual_state: string
          selected_cards: string[] | null
          precision_answers: Json | null
          whatsapp_notified: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          whatsapp: string
          country_code?: string
          problem: string
          status?: string
          ritual_state?: string
          selected_cards?: string[] | null
          precision_answers?: Json | null
          whatsapp_notified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          whatsapp?: string
          country_code?: string
          problem?: string
          status?: string
          ritual_state?: string
          selected_cards?: string[] | null
          precision_answers?: Json | null
          whatsapp_notified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          lead_id: string
          sender_type: string
          message: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          sender_type: string
          message: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          sender_type?: string
          message?: string
          created_at?: string
          read_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      tarot_cards: {
        Row: {
          id: string
          name: string
          image_url: string
          meaning: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url: string
          meaning: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string
          meaning?: string
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
  }
}