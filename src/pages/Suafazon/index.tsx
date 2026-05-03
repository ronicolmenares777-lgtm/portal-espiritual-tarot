import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("🔐 Intentando login con:", email);

    try {
      const { data: profile, error: authError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .eq("role", "admin")
        .single();

      if (authError || !profile) {
        console.error("❌ Autenticación fallida:", authError);
        setError("Credenciales inválidas");
        return;
      }

      console.log("✅ Autenticación exitosa:", profile);
      console.log("🔄 Redirigiendo a dashboard...");

      localStorage.setItem("adminSession", "logged_in");
      localStorage.setItem("adminProfile", JSON.stringify(profile));

      router.push("/Suafazon/dashboard");
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError("Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-purple-900/30 to-background" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gold/30 rounded-full animate-pulse-glow"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/30 via-accent/30 to-gold/30 rounded-full blur-2xl animate-pulse-glow" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 backdrop-blur-xl border-4 border-gold/40 shadow-2xl shadow-gold/50 flex items-center justify-center">
                <span className="text-6xl">🔮</span>
              </div>
            </div>
          </motion.div>

          <h2 className="text-3xl font-serif italic text-gold">
            Portal Administrativo
          </h2>
          <p className="text-foreground/70 text-sm">
            Acceso exclusivo para maestros espirituales
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-accent/10 to-gold/10 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-2 border-gold/20 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-gold/30 rounded-lg focus:outline-none focus:border-gold/60 text-foreground transition-colors"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 border border-gold/30 rounded-lg focus:outline-none focus:border-gold/60 text-foreground transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold via-accent to-gold text-background font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-gold/50 transition-all duration-300 transform hover:scale-105"
              >
                Ingresar al Portal
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}