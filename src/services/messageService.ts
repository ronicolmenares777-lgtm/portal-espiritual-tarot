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

  static async create(messageData: InsertMessage) {
    const { data, error } = await supabase
      .from("messages")
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error("✉️ Error creando mensaje:", error);
      throw error;
    }
    return data;
  }

  static async markAsRead(leadId: string, isFromMaestro: boolean) {
    const { data, error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("lead_id", leadId)
      .eq("is_from_maestro", isFromMaestro)
      .is("read_at", null)
      .select();

    if (error) {
      console.error("👀 Error marcando como leído:", error);
      throw error;
    }
    return data;
  }
}