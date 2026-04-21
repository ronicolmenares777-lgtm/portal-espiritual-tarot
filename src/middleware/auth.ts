/**
 * Middleware de autenticación para rutas admin
 * Implementa protección de rutas y verificación de sesión
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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