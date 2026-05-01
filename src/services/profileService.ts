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
  static async uploadAvatar(file: File) {
    try {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return { 
          data: null, 
          error: { message: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF' } 
        };
      }

      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return { 
          data: null, 
          error: { message: 'El archivo es muy grande. Máximo 2MB' } 
        };
      }

      const { session } = await AuthService.getSession();
      if (!session?.user) {
        return { data: null, error: { message: 'No autenticado' } };
      }

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('📤 Subiendo avatar:', filePath);

      // Subir archivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Error subiendo archivo:', uploadError);
        return { data: null, error: uploadError };
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('✅ Avatar subido:', publicUrl);

      // Actualizar perfil con nueva URL
      const { error: updateError } = await this.update({
        avatar_url: publicUrl
      });

      if (updateError) {
        console.error('❌ Error actualizando perfil:', updateError);
        return { data: null, error: updateError };
      }

      return { data: { url: publicUrl }, error: null };
    } catch (error: any) {
      console.error('❌ Error en uploadAvatar:', error);
      return { data: null, error };
    }
  }
};