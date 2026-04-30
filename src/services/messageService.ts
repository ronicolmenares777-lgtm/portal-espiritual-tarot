import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Message = Database["public"]["Tables"]["messages"]["Row"];
type InsertMessage = Database["public"]["Tables"]["messages"]["Insert"];

export class MessageService {
  static async getByLeadId(leadId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("📬 Error obteniendo mensajes:", error);
      throw error;
    }
    return data || [];
  }

  static async create(data: {
    lead_id: string;
    content: string;
  }): Promise<Message | null> {
    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .insert([{
          lead_id: data.lead_id,
          content: data.content,
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

  static async markAsRead(leadId: string, isFromMaestro: boolean) {
    // WORKAROUND TEMPORAL: El caché de PostgREST no reconoce read_at
    // Retornamos silenciosamente sin hacer el update para evitar el error PGRST204
    console.log("👀 markAsRead bypass (caché workaround) - leadId:", leadId);
    return [];
  }
}