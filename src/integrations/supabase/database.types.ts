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
          event_type: string
          session_id: string
          user_agent: string | null
          device_type: string | null
          browser: string | null
          page_path: string | null
          referrer: string | null
          event_data: Json | null
          created_at: string | null
          country: string | null
          country_code: string | null
          visitor_id: string | null
        }
        Insert: {
          id?: string
          event_type: string
          session_id: string
          user_agent?: string | null
          device_type?: string | null
          browser?: string | null
          page_path?: string | null
          referrer?: string | null
          event_data?: Json | null
          created_at?: string | null
          country?: string | null
          country_code?: string | null
          visitor_id?: string | null
        }
        Update: {
          id?: string
          event_type?: string
          session_id?: string
          user_agent?: string | null
          device_type?: string | null
          browser?: string | null
          page_path?: string | null
          referrer?: string | null
          event_data?: Json | null
          created_at?: string | null
          country?: string | null
          country_code?: string | null
          visitor_id?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          lead_id: string
          text: string | null
          media_url: string | null
          media_type: string | null
          is_from_maestro: boolean
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          text?: string | null
          media_url?: string | null
          media_type?: string | null
          is_from_maestro?: boolean
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          text?: string | null
          media_url?: string | null
          media_type?: string | null
          is_from_maestro?: boolean
          is_read?: boolean | null
          created_at?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          whatsapp: string
          country_code: string | null
          problem: string
          status: string | null
          tarot_card_name: string | null
          tarot_card_image: string | null
          tarot_interpretation: string | null
          is_favorite: boolean | null
          notes: string | null
          tags: string[] | null
          last_interaction_at: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
          answers: Json | null
          selected_card_id: string | null
          cards_selected: string[] | null
          user_answers: Json | null
          classification: string | null
        }
        Insert: {
          id?: string
          name: string
          whatsapp: string
          country_code?: string | null
          problem: string
          status?: string | null
          tarot_card_name?: string | null
          tarot_card_image?: string | null
          tarot_interpretation?: string | null
          is_favorite?: boolean | null
          notes?: string | null
          tags?: string[] | null
          last_interaction_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          answers?: Json | null
          selected_card_id?: string | null
          cards_selected?: string[] | null
          user_answers?: Json | null
          classification?: string | null
        }
        Update: {
          id?: string
          name?: string
          whatsapp?: string
          country_code?: string | null
          problem?: string
          status?: string | null
          tarot_card_name?: string | null
          tarot_card_image?: string | null
          tarot_interpretation?: string | null
          is_favorite?: boolean | null
          notes?: string | null
          tags?: string[] | null
          last_interaction_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
          answers?: Json | null
          selected_card_id?: string | null
          cards_selected?: string[] | null
          user_answers?: Json | null
          classification?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          lead_id: string
          text: string | null
          is_from_maestro: boolean
          created_at: string
          is_read: boolean | null
          media_type: string | null
          media_url: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          text?: string | null
          is_from_maestro?: boolean
          created_at?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          text?: string | null
          is_from_maestro?: boolean
          created_at?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          phone: string | null
          bio: string | null
          role: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          phone?: string | null
          bio?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          phone?: string | null
          bio?: string | null
          role?: string | null
        }
      }
      tarot_cards: {
        Row: {
          id: string
          name: string
          image_url: string
          meaning_love: string | null
          meaning_work: string | null
          meaning_health: string | null
          meaning_money: string | null
          keywords: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          image_url: string
          meaning_love?: string | null
          meaning_work?: string | null
          meaning_health?: string | null
          meaning_money?: string | null
          keywords?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          image_url?: string
          meaning_love?: string | null
          meaning_work?: string | null
          meaning_health?: string | null
          meaning_money?: string | null
          keywords?: string[] | null
          created_at?: string | null
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