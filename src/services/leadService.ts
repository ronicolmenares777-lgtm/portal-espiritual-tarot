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
   * Crear un nuevo lead (desde formulario público)
   */
  async create(data: LeadInsert): Promise<{ data: Lead | null; error: any }> {
    const { data: lead, error } = await supabase
      .from("leads")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("Error creando lead:", error);
      return { data: null, error };
    }

    console.log("✅ Lead creado:", lead.id);
    return { data: lead, error: null };
  },

  /**
   * Obtener todos los leads (solo autenticados)
   */
  async getAll(): Promise<{ data: Lead[]; error: any }> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo leads:", error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
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
   * Eliminar un lead
   */
  async delete(id: string): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando lead:", error);
      return { success: false, error };
    }

    console.log("✅ Lead eliminado:", id);
    return { success: true, error: null };
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
  }
};