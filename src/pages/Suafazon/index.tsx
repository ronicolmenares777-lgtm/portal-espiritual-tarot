import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Verificar sesión existente SOLO al montar - UNA VEZ
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession === "logged_in" && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/Suafazon/dashboard");
    }
  }, []); // Array vacío - SOLO ejecutar al montar

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiples clicks
    if (isLoggingIn || isRedirecting) {
      return;
    }

    setError("");
    setIsLoggingIn(true);

    console.log("🔐 Intentando login con:", email);

    try {
      // Buscar perfil de admin por email y role
      const { data: profile, error: authError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .eq("role", "admin")
        .single();

      if (authError || !profile) {
        console.error("❌ Autenticación fallida:", authError);
        setError("Credenciales inválidas o no tienes permisos de administrador");
        setIsLoggingIn(false);
        return;
      }

      console.log("✅ Perfil de admin encontrado:", profile);

      // Prevenir redirecciones múltiples
      if (isRedirecting) {
        return;
      }

      setIsRedirecting(true);
      localStorage.setItem("adminSession", "logged_in");
      localStorage.setItem("adminProfile", JSON.stringify(profile));

      console.log("➡️ Redirigiendo a dashboard...");
      router.push("/Suafazon/dashboard");
      
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError("Error al iniciar sesión");
      setIsLoggingIn(false);
    }
  };

  // Si ya está redirigiendo, mostrar pantalla de carga
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground/60">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif text-primary tracking-wide">
            Portal Administrativo
          </h1>
          <p className="text-muted-foreground">
            Acceso exclusivo para maestros espirituales
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all"
                placeholder="tu@email.com"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background/50 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50 transition-all"
                placeholder="••••••••"
                required
                disabled={isLoggingIn}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                  Ingresando...
                </span>
              ) : (
                "Ingresar al Portal"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}