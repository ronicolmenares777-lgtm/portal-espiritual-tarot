/**
 * Servicio para gestión de Mensajes en Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export const MessageService = {
  /**
   * Obtener mensajes de un lead
   */
  async getByLeadId(leadId: string): Promise<{ data: Message[]; error: any }> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error obteniendo mensajes:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  },

  /**
   * Crear un nuevo mensaje
   */
  async create(message: MessageInsert): Promise<{ data: Message | null; error: any }> {
    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error("Error creando mensaje:", error);
      return { data: null, error };
    }

    console.log("✅ Mensaje creado");
    return { data, error: null };
  },

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(leadId: string): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("lead_id", leadId)
      .is("read_at", null);

    if (error) {
      console.error("Error marcando mensajes como leídos:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  },

  /**
   * Obtener conteo de mensajes no leídos por lead
   */
  async getUnreadCount(leadId: string): Promise<number> {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", leadId)
      .is("read_at", null)
      .eq("is_from_maestro", false);

    if (error) {
      console.error("Error contando mensajes no leídos:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Eliminar un mensaje
   */
  async delete(id: string): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando mensaje:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  },

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   * ORDEN CORRECTO: crear canal → .on() → .subscribe()
   */
  subscribeToMessages(leadId: string, callback: (message: Message) => void) {
    const subscription = supabase
      .channel(`messages:lead_id=eq.${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log("📨 Nuevo mensaje en tiempo real:", payload.new);
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return subscription;
  }
};