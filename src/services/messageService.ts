/**
 * Servicio para gestión de Mensajes en Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Message = Tables<"messages">;

export const MessageService = {
  /**
   * Obtener todos los mensajes de un lead
   */
  async getByLeadId(leadId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error obteniendo mensajes:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Crear un nuevo mensaje
   */
  async create(message: {
    lead_id: string;
    text: string;
    is_from_maestro: boolean;
    media_url?: string;
    media_type?: string;
  }): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error("Error creando mensaje:", error);
      throw error;
    }

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
      .eq("is_from_maestro", false)
      .is("read_at", null);

    if (error) {
      console.error("Error marcando mensajes como leídos:", error);
      throw error;
    }

    console.log("✅ Mensajes marcados como leídos");
  },

  /**
   * Suscribirse a mensajes en tiempo real
   * ORDEN CORRECTO: channel() -> on() -> subscribe()
   */
  subscribeToMessages(
    leadId: string,
    callback: (message: Message) => void
  ) {
    console.log("🔔 Configurando suscripción realtime para lead:", leadId);

    // PASO 1: Crear el canal
    const channel = supabase.channel(`messages:${leadId}`);

    // PASO 2: Agregar listener ANTES de subscribe
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `lead_id=eq.${leadId}`,
      },
      (payload) => {
        console.log("📨 Nuevo mensaje recibido:", payload);
        callback(payload.new as Message);
      }
    );

    // PASO 3: Suscribirse AL FINAL
    channel.subscribe((status) => {
      console.log("📡 Estado de suscripción:", status);
    });

    return channel;
  },
};