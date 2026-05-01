import { supabase } from "@/integrations/supabase/client";

export class MessageService {
  static async create(data: {
    lead_id: string;
    text: string;
    is_from_maestro?: boolean;
  }) {
    console.log("📤 Creando mensaje:", data);
    
    // Preparar objeto - solo incluir is_from_maestro si es true
    const insertData: any = {
      lead_id: data.lead_id,
      text: data.text,
    };
    
    // Solo agregar is_from_maestro si es true (para admin)
    if (data.is_from_maestro === true) {
      insertData.is_from_maestro = true;
    }
    // Si es false o undefined, NO enviarlo - dejar que DEFAULT funcione
    
    const { data: messages, error } = await supabase
      .from("messages")
      .insert(insertData)
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