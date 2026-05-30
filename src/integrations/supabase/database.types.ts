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
      analytics_events: {
        Row: {
          id: string
          event_type: string
          session_id: string
          visitor_id: string | null
          user_agent: string | null
          device_type: string | null
          browser: string | null
          page_path: string | null
          referrer: string | null
          country: string | null
          country_code: string | null
          event_data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          event_type: string
          session_id: string
          visitor_id?: string | null
          user_agent?: string | null
          device_type?: string | null
          browser?: string | null
          page_path?: string | null
          referrer?: string | null
          country?: string | null
          country_code?: string | null
          event_data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          event_type?: string
          session_id?: string
          visitor_id?: string | null
          user_agent?: string | null
          device_type?: string | null
          browser?: string | null
          page_path?: string | null
          referrer?: string | null
          country?: string | null
          country_code?: string | null
          event_data?: Json | null
          created_at?: string | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "chat_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          lead_id: string
          topic: string
          text: string | null
          is_from_maestro: boolean
          extension: string
          created_at: string
          payload: Json | null
          event: string | null
          is_read: boolean | null
          media_type: string | null
          private: boolean | null
          media_url: string | null
          updated_at: string
          inserted_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          topic: string
          text?: string | null
          is_from_maestro?: boolean
          extension: string
          created_at?: string
          payload?: Json | null
          event?: string | null
          is_read?: boolean | null
          media_type?: string | null
          private?: boolean | null
          media_url?: string | null
          updated_at?: string
          inserted_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          topic?: string
          text?: string | null
          is_from_maestro?: boolean
          extension?: string
          created_at?: string
          payload?: Json | null
          event?: string | null
          is_read?: boolean | null
          media_type?: string | null
          private?: boolean | null
          media_url?: string | null
          updated_at?: string
          inserted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: []
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never