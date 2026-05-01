import { supabase } from "@/integrations/supabase/client";

export class MessageService {
  static async create(data: {
    lead_id: string;
    text: string;
    is_from_maestro: boolean;
  }) {
    console.log("📤 Creando mensaje:", data);
    
    // NO especificar columnas - dejar que Supabase use todas las columnas de la tabla
    const { data: messages, error } = await supabase
      .from("messages")
      .insert(data)
      .select();

    if (error) {
      console.error("❌ Error creando mensaje:", error);
      return null;
    }

    const message = messages?.[0] || null;
    console.log("✅ Mensaje creado exitosamente:", message);
    return message;
  }

  static async getByLeadId(leadId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error obteniendo mensajes:", error);
      return [];
    }

    return data || [];
  }
}