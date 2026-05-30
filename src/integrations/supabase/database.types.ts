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
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          lead_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          lead_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          lead_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_from_maestro: boolean
          lead_id: string
          media_type: string | null
          media_url: string | null
          read_at: string | null
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_from_maestro?: boolean
          lead_id: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_from_maestro?: boolean
          lead_id?: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          text?: string
        }
      }
      leads: {
        Row: {
          answers: Json | null
          card_1: string
          card_2: string
          card_3: string
          cards_selected: Json | null
          chat_status: string
          country_code: string
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          is_archived: boolean
          is_favorite: boolean
          last_interaction_at: string | null
          last_message_at: string
          name: string
          notes: string | null
          phone: string
          problem: string
          q1_answer: string
          q2_answer: string
          q3_answer: string
          status: string
          unread_count: number
          updated_at: string
          user_answers: Json | null
          whatsapp: string
        }
        Insert: {
          answers?: Json | null
          card_1: string
          card_2: string
          card_3: string
          cards_selected?: Json | null
          chat_status?: string
          country_code: string
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          last_interaction_at?: string | null
          last_message_at?: string
          name: string
          notes?: string | null
          phone: string
          problem: string
          q1_answer: string
          q2_answer: string
          q3_answer: string
          status?: string
          unread_count?: number
          updated_at?: string
          user_answers?: Json | null
          whatsapp: string
        }
        Update: {
          answers?: Json | null
          card_1?: string
          card_2?: string
          card_3?: string
          cards_selected?: Json | null
          chat_status?: string
          country_code?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          last_interaction_at?: string | null
          last_message_at?: string
          name?: string
          notes?: string | null
          phone?: string
          problem?: string
          q1_answer?: string
          q2_answer?: string
          q3_answer?: string
          status?: string
          unread_count?: number
          updated_at?: string
          user_answers?: Json | null
          whatsapp?: string
        }
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_from_maestro: boolean
          lead_id: string
          media_type: string | null
          media_url: string | null
          read_at: string | null
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_from_maestro?: boolean
          lead_id: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_from_maestro?: boolean
          lead_id?: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          text?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
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