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
        Relationships: []
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
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

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