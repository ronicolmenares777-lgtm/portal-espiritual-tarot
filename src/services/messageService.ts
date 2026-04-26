/**
 * Servicio para gestión de Mensajes en Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export const MessageService = {
  /**
   * Obtener todos los mensajes de un lead
   */
  async getByLeadId(leadId: string): Promise<Message[]> {
    try {
      console.log("📥 MessageService.getByLeadId:", leadId);
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error obteniendo mensajes:", error);
        throw error;
      }

      console.log(`✅ Mensajes obtenidos: ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error("❌ Error en getByLeadId:", error);
      return [];
    }
  },

  /**
   * Crear un nuevo mensaje
   */
  async create(messageData: any): Promise<Message | null> {
    try {
      console.log("📤 MessageService.create:", messageData);
      
      const { data, error } = await supabase
        .from("messages")
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error("❌ Error creando mensaje:", error);
        throw error;
      }

      console.log("✅ Mensaje creado:", data?.id);
      return data;
    } catch (error) {
      console.error("❌ Error en create:", error);
      return null;
    }
  },

  /**
   * Marcar mensajes como leídos para un lead
   */
  async markAsRead(leadId: string, isFromMaestro: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("lead_id", leadId)
        .eq("is_from_maestro", isFromMaestro)
        .is("read_at", null);

      if (error) throw error;
    } catch (error) {
      console.error("Error marcando mensajes como leídos:", error);
    }
  },

  /**
   * Eliminar un mensaje
   */
  async delete(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
    } catch (error) {
      console.error("Error eliminando mensaje:", error);
      throw error;
    }
  }
};