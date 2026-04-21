/**
 * Servicio de autenticación con Supabase Auth
 * Maneja login, registro, logout y gestión de sesiones
 */

import { supabase } from "@/integrations/supabase/client";

export const AuthService = {
  /**
   * Login con email y contraseña
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Error en login:", error);
      return { user: null, session: null, error };
    }

    console.log("✅ Login exitoso:", data.user?.email);
    return { user: data.user, session: data.session, error: null };
  },

  /**
   * Registro de nuevo usuario
   */
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || ""
        }
      }
    });

    if (error) {
      console.error("Error en registro:", error);
      return { user: null, session: null, error };
    }

    console.log("✅ Registro exitoso:", data.user?.email);
    return { user: data.user, session: data.session, error: null };
  },

  /**
   * Cerrar sesión
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error cerrando sesión:", error);
      return { error };
    }

    console.log("✅ Sesión cerrada");
    return { error: null };
  },

  /**
   * Obtener sesión actual
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error obteniendo sesión:", error);
      return { session: null, error };
    }

    return { session: data.session, error: null };
  },

  /**
   * Obtener usuario actual
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error obteniendo usuario:", error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  },

  /**
   * Cambiar contraseña
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error("Error cambiando contraseña:", error);
      return { user: null, error };
    }

    console.log("✅ Contraseña actualizada");
    return { user: data.user, error: null };
  },

  /**
   * Resetear contraseña (enviar email)
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error("Error reseteando contraseña:", error);
      return { error };
    }

    console.log("✅ Email de reset enviado");
    return { error: null };
  },

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },

  /**
   * Escuchar cambios de autenticación
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }
};