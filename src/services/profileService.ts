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
  async getCurrent() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      return { data: null, error: { message: "No hay sesión activa" } };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error obteniendo perfil:", error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  /**
   * Obtener todos los perfiles (para ver avatar del maestro en chat público)
   */
  async getAll() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error obteniendo perfiles:", error);
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
  },

  /**
   * Subir avatar del usuario actual
   */
  async uploadAvatar(file: File) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      return { data: null, error: { message: "No hay sesión activa" } };
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { data: null, error: { message: "Tipo de archivo no válido. Use JPG, PNG, WebP o GIF" } };
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { data: null, error: { message: "El archivo es muy grande. Máximo 2MB" } };
    }

    // Generar nombre único
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    // Subir archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error("Error subiendo avatar:", uploadError);
      return { data: null, error: uploadError };
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Actualizar perfil con nueva URL
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", userId)
      .select()
      .single();

    if (profileError) {
      console.error("Error actualizando perfil:", profileError);
      return { data: null, error: profileError };
    }

    console.log("✅ Avatar subido:", urlData.publicUrl);
    return { data: { url: urlData.publicUrl, profile: profileData }, error: null };
  }
};