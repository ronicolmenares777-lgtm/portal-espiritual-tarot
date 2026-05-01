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

  useEffect(() => {
    // Verificar si ya está autenticado
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Verificar si es admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/Suafazon/dashboard");
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("🔐 Intentando login con:", email);

    try {
      // Intentar login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        console.error("❌ Error de autenticación:", authError);
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      console.log("✅ Autenticación exitosa:", authData);

      // Verificar si es admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("❌ Error obteniendo perfil:", profileError);
        setError("Error verificando permisos");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log("👤 Perfil:", profile);

      if (profile?.role !== "admin") {
        console.error("❌ Usuario no es admin");
        setError("No tienes permisos de administrador");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log("✅ Redirigiendo a dashboard...");
      router.push("/Suafazon/dashboard");
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      setError("Error al iniciar sesión");
      setLoading(false);
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