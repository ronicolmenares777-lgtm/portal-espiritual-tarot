import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Solo verificar si ya hay sesión activa AL MONTAR
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession === "logged_in") {
      console.log("🔄 Sesión activa detectada, redirigiendo...");
      router.push("/Suafazon/dashboard");
    }
  }, []); // Array vacío - solo ejecutar UNA VEZ al montar

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiples ejecuciones
    if (isLoggingIn) {
      console.log("⏸️ Login ya en progreso, ignorando...");
      return;
    }

    setError("");
    setIsLoggingIn(true);

    const credentials = `Suafazon:${email}:${password}`;
    const hashedCredentials = btoa(credentials);

    console.log("🔐 Intentando login con:", hashedCredentials.substring(0, 20) + "...");

    try {
      const { data: profile, error: authError } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_token", hashedCredentials)
        .eq("focus", "admin")
        .single();

      if (authError || !profile) {
        console.error("❌ Autenticación fallida:", authError);
        setError("Credenciales inválidas");
        setIsLoggingIn(false);
        return;
      }

      console.log("✅ Autenticación exitosa:", profile);
      console.log("🔄 Guardando sesión y redirigiendo...");

      // Guardar sesión
      localStorage.setItem("adminSession", "logged_in");
      localStorage.setItem("adminProfile", JSON.stringify(profile));

      // Redirigir al dashboard
      console.log("➡️ Redirigiendo a dashboard...");
      await router.push("/Suafazon/dashboard");
      
      // NO resetear isLoggingIn aquí - dejar que el componente se desmonte
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError("Error al iniciar sesión");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-serif text-primary text-center mb-2">
            Portal Administrativo
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Acceso exclusivo para maestros espirituales
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Verificando..." : "Ingresar al Portal"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}