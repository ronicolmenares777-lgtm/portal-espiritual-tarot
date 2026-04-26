/**
 * Middleware de autenticación para rutas admin
 * Implementa protección de rutas y verificación de sesión
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export interface AuthSession {
  isAuthenticated: boolean;
  username: string;
  loginTime: number;
  expiresAt: number;
}

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 horas
const SESSION_KEY = "admin_session";

export class AuthManager {
  // Crear sesión de admin
  static createSession(username: string): AuthSession {
    const now = Date.now();
    const session: AuthSession = {
      isAuthenticated: true,
      username,
      loginTime: now,
      expiresAt: now + SESSION_DURATION
    };
    
    // Guardar sesión encriptada (en producción usar JWT)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    return session;
  }
  
  // Obtener sesión actual
  static getSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;
      
      const session: AuthSession = JSON.parse(sessionData);
      
      // Verificar si la sesión ha expirado
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }
  
  // Verificar si hay sesión válida
  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && session.isAuthenticated;
  }
  
  // Cerrar sesión
  static clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
  
  // Renovar sesión (extender tiempo)
  static renewSession(): void {
    const session = this.getSession();
    if (session) {
      session.expiresAt = Date.now() + SESSION_DURATION;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }
}

/**
 * Hook para proteger rutas que requieren autenticación
 * Redirige a la página de login si no hay sesión activa
 */
export function useRequireAuth(loginPath: string = "/Suafazon") {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // No redirigir si ya estamos en la página de login
    if (router.pathname === loginPath) {
      setIsChecking(false);
      return;
    }

    const session = AuthManager.getSession();
    
    if (!session) {
      console.log("🔒 No hay sesión activa, redirigiendo a login...");
      router.replace(loginPath);
    } else {
      setIsChecking(false);
    }
  }, [router.pathname, loginPath]);

  return isChecking;
}

// Hook para verificar autenticación sin redirigir
export function useAuth() {
  const session = AuthManager.getSession();
  
  return {
    isAuthenticated: session !== null,
    session,
    logout: () => AuthManager.clearSession()
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
}

/**
 * Verificar credenciales de admin contra Supabase Auth
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    console.log("🔐 Verificando credenciales para:", email);

    // Intentar login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("❌ Error de autenticación:", authError.message);
      return {
        success: false,
        error: "Email o contraseña incorrectos",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Usuario no encontrado",
      };
    }

    console.log("✅ Usuario autenticado:", authData.user.id);

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Error obteniendo perfil:", profileError);
      return {
        success: false,
        error: "Error obteniendo perfil: " + profileError.message,
      };
    }

    if (!profile) {
      console.error("❌ Perfil no encontrado para usuario:", authData.user.id);
      return {
        success: false,
        error: "Perfil no encontrado. Contacta al administrador.",
      };
    }

    // Verificar que sea admin
    if (profile.role !== "admin") {
      console.error("❌ Usuario no es admin:", profile.role);
      return {
        success: false,
        error: "Acceso no autorizado. Solo administradores.",
      };
    }

    console.log("✅ Login exitoso - Admin verificado");

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        role: "admin",
      },
    };
  } catch (error: any) {
    console.error("❌ Error en verifyAdminCredentials:", error);
    return {
      success: false,
      error: error.message || "Error del servidor",
    };
  }
}

/**
 * Obtener usuario autenticado actual
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email || "",
      role: profile.role as "admin" | "user",
    };
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error);
    return null;
  }
}

/**
 * Cerrar sesión
 */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}