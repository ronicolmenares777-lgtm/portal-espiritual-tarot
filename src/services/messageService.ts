/**
 * Servicio para gestión de Mensajes en Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Message = Tables<"messages">;

export class MessageService {
  static async getLeadMessages(leadId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    console.log("📬 Mensajes obtenidos:", { data, error });
    return { data: data || [], error };
  }

  static async sendMessage(leadId: string, content: string, isFromUser: boolean) {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        lead_id: leadId,
        content,
        is_from_user: isFromUser,
      })
      .select()
      .single();

    console.log("✉️ Mensaje enviado:", { data, error });
    return { data, error };
  }

  static subscribeToMessages(leadId: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`messages:${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log("📨 Nuevo mensaje recibido:", payload.new);
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return channel;
  }
}