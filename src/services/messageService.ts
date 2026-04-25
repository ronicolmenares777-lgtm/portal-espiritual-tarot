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

    if (!data) {
      throw new Error("No se pudo crear el mensaje");
    }

    return data;
  },

  /**
   * Suscribirse a nuevos mensajes de un lead
   * ORDEN CRÍTICO: channel → on → subscribe
   */
  subscribeToMessages(
    leadId: string,
    callback: (message: Message) => void
  ): any {
    console.log("🔔 Configurando suscripción realtime para lead:", leadId);

    // Paso 1: Crear el canal con nombre único
    const channelName = `messages:${leadId}:${Date.now()}`;
    const channel = supabase.channel(channelName);

    console.log("✅ Canal creado:", channelName);

    // Paso 2: Agregar el listener ANTES de subscribe
    channel.on(
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
    );

    console.log("✅ Listener agregado");

    // Paso 3: Suscribirse AL FINAL (después de .on)
    channel.subscribe((status) => {
      console.log("📡 Estado de suscripción:", status);
    });

    console.log("✅ Suscripción activada");

    return channel;
  },

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(leadId: string, markedByMaestro: boolean = true): Promise<void> {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("lead_id", leadId)
      .eq("is_from_maestro", !markedByMaestro)
      .is("read_at", null);

    if (error) {
      console.error("Error marcando mensajes como leídos:", error);
    } else {
      console.log("✅ Mensajes marcados como leídos");
    }
  },

  /**
   * Eliminar un mensaje
   */
  async delete(messageId: string): Promise<void> {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error eliminando mensaje:", error);
      throw error;
    }

    console.log("✅ Mensaje eliminado:", messageId);
  },

  /**
   * Eliminar todos los mensajes de un lead
   */
  async deleteByLeadId(leadId: string): Promise<void> {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("lead_id", leadId);

    if (error) {
      console.error("Error eliminando mensajes del lead:", error);
      throw error;
    }

    console.log("✅ Mensajes del lead eliminados:", leadId);
  },
};