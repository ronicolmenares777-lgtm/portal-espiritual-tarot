import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export class MessageService {
  static async create(data: {
    lead_id: string;
    text: string;
    is_from_maestro?: boolean;
  }): Promise<Message | null> {
    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .insert([{
          lead_id: data.lead_id,
          text: data.text,
          is_from_maestro: data.is_from_maestro || false,
        }])
        .select();

      if (error) {
        console.error("✉️ Error creando mensaje:", error);
        return null;
      }

      const message = messages?.[0] || null;
      console.log("✅ Mensaje creado:", message);
      return message;
    } catch (error) {
      console.error("✉️ Error en create:", error);
      return null;
    }
  }

  static async getByLeadId(leadId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("✉️ Error obteniendo mensajes:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("✉️ Error en getByLeadId:", error);
      return [];
    }
  }
}