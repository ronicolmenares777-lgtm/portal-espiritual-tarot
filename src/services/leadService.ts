/**
 * Servicio para gestión de Leads (Almas/Usuarios) en Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];

export const LeadService = {
  /**
   * Crear un nuevo lead
   */
  async create(leadData: {
    name: string;
    whatsapp: string;
    country_code: string;
    problem: string;
    status?: Lead["status"];
  }): Promise<{ data: Lead | null; error: any }> {
    try {
      const insertData = {
        name: leadData.name,
        whatsapp: leadData.whatsapp,
        country_code: leadData.country_code,
        problem: leadData.problem,
        status: leadData.status || "nuevo",
        is_favorite: false,
        notes: null,
        answers: null,
        cards_selected: null,
        user_answers: null,
        last_interaction_at: null,
        deleted_at: null
      };

      console.log("📝 Insertando lead en Supabase:", insertData);

      const { data, error } = await supabase
        .from("leads")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("❌ Error de Supabase:", error);
        
        // Detectar error de WhatsApp duplicado
        if (error.code === "23505" && error.message.includes("leads_whatsapp_unique")) {
          return { 
            data: null, 
            error: { 
              code: "DUPLICATE_WHATSAPP",
              message: "Este número de WhatsApp ya está registrado. Si ya tienes una consulta activa, usa el botón 'Ingresar' en la parte superior derecha para acceder a tu chat."
            }
          };
        }
        
        return { data: null, error };
      }

      console.log("✅ Lead creado exitosamente:", data);
      return { data, error: null };
    } catch (err: any) {
      console.error("❌ Error en create():", err);
      return { data: null, error: err };
    }
  },

  /**
   * Obtener todos los leads (incluyendo eliminados)
   */
  async getAll(): Promise<{ data: Lead[] | null; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  },

  /**
   * Obtener solo leads activos (no eliminados)
   */
  async getActive(): Promise<{ data: Lead[] | null; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  /**
   * Obtener leads en papelera
   */
  async getDeleted(): Promise<{ data: Lead[] | null; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    return { data, error };
  },

  /**
   * Mover lead a papelera (soft delete)
   */
  async moveToTrash(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("leads")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  /**
   * Mover múltiples leads a papelera
   */
  async moveMultipleToTrash(ids: string[]): Promise<{ error: any }> {
    const { error } = await supabase
      .from("leads")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", ids);

    return { error };
  },

  /**
   * Restaurar lead de papelera
   */
  async restoreFromTrash(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("leads")
      .update({ deleted_at: null })
      .eq("id", id);

    return { error };
  },

  /**
   * Eliminar permanentemente un lead
   */
  async deletePermanently(id: string): Promise<{ error: any }> {
    // Primero eliminar los mensajes asociados
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("lead_id", id);

    if (messagesError) {
      return { error: messagesError };
    }

    // Luego eliminar el lead
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    return { error };
  },

  /**
   * Obtener un lead por ID
   */
  async getById(id: string): Promise<{ data: Lead | null; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error obteniendo lead:", error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  /**
   * Actualizar un lead
   */
  async update(id: string, updates: LeadUpdate): Promise<{ data: Lead | null; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando lead:", error);
      return { data: null, error };
    }

    console.log("✅ Lead actualizado:", id);
    return { data, error: null };
  },

  /**
   * Obtener leads por estado
   */
  async getByStatus(status: string): Promise<{ data: Lead[]; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo leads por status:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  },

  /**
   * Obtener leads favoritos
   */
  async getFavorites(): Promise<{ data: Lead[]; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("is_favorite", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo favoritos:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  },

  /**
   * Buscar leads por nombre o WhatsApp
   */
  async search(query: string): Promise<{ data: Lead[]; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .or(`name.ilike.%${query}%,whatsapp.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error buscando leads:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  },

  /**
   * Actualizar última interacción
   */
  async updateLastInteraction(id: string): Promise<void> {
    await supabase
      .from("leads")
      .update({ last_interaction_at: new Date().toISOString() })
      .eq("id", id);
  },

  /**
   * Actualizar el estado de un lead
   */
  async updateStatus(id: string, status: Lead["status"]) {
    const { data, error } = await supabase
      .from("leads")
      .update({ 
        status,
        last_interaction_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando estado del lead:", error);
      return { data: null, error };
    }

    console.log("✅ Estado del lead actualizado");
    return { data, error: null };
  },

  /**
   * Toggle favorito de un lead
   */
  async toggleFavorite(id: string) {
    // Primero obtener el estado actual
    const { data: currentLead, error: getError } = await supabase
      .from("leads")
      .select("is_favorite")
      .eq("id", id)
      .single();

    if (getError) {
      console.error("Error obteniendo lead:", getError);
      return { data: null, error: getError };
    }

    // Actualizar con el valor opuesto
    const { data, error } = await supabase
      .from("leads")
      .update({ is_favorite: !currentLead.is_favorite })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando favorito:", error);
      return { data: null, error };
    }

    console.log("✅ Favorito actualizado");
    return { data, error: null };
  },

  /**
   * Actualizar notas de un lead
   */
  async updateNotes(id: string, notes: string) {
    const { data, error } = await supabase
      .from("leads")
      .update({ notes })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando notas:", error);
      return { data: null, error };
    }

    console.log("✅ Notas actualizadas");
    return { data, error: null };
  },

  /**
   * Obtener estadísticas de leads
   */
  async getStats(): Promise<{
    total: number;
    nuevos: number;
    enConversacion: number;
    calientes: number;
    cerrados: number;
    listos: number;
    perdidos: number;
  }> {
    const { data, error } = await supabase.from("leads").select("status");

    if (error || !data) {
      return {
        total: 0,
        nuevos: 0,
        enConversacion: 0,
        calientes: 0,
        cerrados: 0,
        listos: 0,
        perdidos: 0
      };
    }

    return {
      total: data.length,
      nuevos: data.filter((l) => l.status === "nuevo").length,
      enConversacion: data.filter((l) => l.status === "enConversacion").length,
      calientes: data.filter((l) => l.status === "caliente").length,
      cerrados: data.filter((l) => l.status === "cerrado").length,
      listos: data.filter((l) => l.status === "listo").length,
      perdidos: data.filter((l) => l.status === "perdido").length
    };
  },

  /**
   * Buscar lead por nombre exacto y WhatsApp exacto
   */
  async findByNameAndWhatsApp(name: string, whatsapp: string) {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("name", name)
        .eq("whatsapp", whatsapp)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error buscando lead:", error);
        return { data: null, error };
      }

      // Devolver array como espera el código
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error("Error en findByNameAndWhatsApp:", error);
      return { data: null, error };
    }
  }
};

/**
 * Crear un nuevo lead en Supabase
 */
export async function createLead(
  formData: Omit<Lead, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    console.log("📝 Enviando formulario a Supabase:", formData);

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name: formData.name,
          whatsapp: formData.whatsapp,
          country_code: formData.country_code || "+52",
          problem: formData.problem,
          status: formData.status || "nuevo",
          is_favorite: false,
          notes: formData.notes || null,
          answers: formData.answers || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error creando lead:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Lead creado en Supabase con ID:", data.id);
    return { success: true, lead: data as Lead };
  } catch (error: any) {
    console.error("❌ Error en createLead:", error);
    return { success: false, error: error.message };
  }
}