import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export class ProfileService {
  static async get() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { data: null, error: { message: "No autenticado" } };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("❌ Error obteniendo perfil:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("❌ Error en get profile:", error);
      return { data: null, error };
    }
  }

  static async update(updates: Partial<Profile>) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { data: null, error: { message: "No autenticado" } };
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error actualizando perfil:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("❌ Error en update profile:", error);
      return { data: null, error };
    }
  }

  static async create(profile: Omit<Profile, "id" | "created_at" | "updated_at">) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { data: null, error: { message: "No autenticado" } };
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: session.user.id,
          ...profile,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creando perfil:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("❌ Error en create profile:", error);
      return { data: null, error };
    }
  }

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

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { data: null, error: { message: 'No autenticado' } };
      }

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

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
}