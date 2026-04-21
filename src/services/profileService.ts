/**
 * Servicio para gestión de Perfil de Maestro en Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const ProfileService = {
  /**
   * Obtener perfil del usuario autenticado
   */
  async getCurrent(): Promise<{ data: Profile | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: { message: "No authenticated user" } };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error obteniendo perfil:", error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  /**
   * Actualizar perfil del usuario autenticado
   */
  async update(updates: ProfileUpdate): Promise<{ data: Profile | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: { message: "No authenticated user" } };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando perfil:", error);
      return { data: null, error };
    }

    console.log("✅ Perfil actualizado");
    return { data, error: null };
  },

  /**
   * Crear perfil (usado en registro)
   */
  async create(userId: string, email: string, fullName?: string): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await supabase
      .from("profiles")
      .insert([{
        id: userId,
        email,
        full_name: fullName || ""
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creando perfil:", error);
      return { data: null, error };
    }

    console.log("✅ Perfil creado");
    return { data, error: null };
  }
};