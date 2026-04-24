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
  async getByLeadId(leadId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error obteniendo mensajes:", error);
      return [];
    }

    return data || [];
  },

  /**
   * Crear un nuevo mensaje
   */
  async create(message: MessageInsert): Promise<Message | null> {
    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error("Error creando mensaje:", error);
      throw error;
    }

    console.log("✅ Mensaje creado:", data.id);
    return data;
  },

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(leadId: string): Promise<void> {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("lead_id", leadId)
      .is("read_at", null);

    if (error) {
      console.error("Error marcando mensajes como leídos:", error);
      throw error;
    }

    console.log("✅ Mensajes marcados como leídos");
  },

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   * ORDEN CRÍTICO: .channel() → .on() → .subscribe()
   */
  subscribeToMessages(leadId: string, onNewMessage: (message: Message) => void) {
    console.log("🔔 Iniciando suscripción realtime para lead:", leadId);

    const channel = supabase.channel(`messages:${leadId}`);
    
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `lead_id=eq.${leadId}`,
      },
      (payload) => {
        console.log("📨 Nuevo mensaje via realtime:", payload.new);
        onNewMessage(payload.new as Message);
      }
    );

    channel.subscribe((status) => {
      console.log("📡 Estado de suscripción:", status);
    });

    return channel;
  }
};