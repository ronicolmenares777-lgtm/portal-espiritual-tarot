/**
 * PÁGINA TEMPORAL - SETUP ADMIN
 * Usar solo UNA VEZ para crear el usuario administrador
 * Después de crear el admin, eliminar esta página
 */

import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";

export default function SetupAdmin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "admin@tarot.com",
    password: "maestro2024",
    fullName: "Maestro Espiritual"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      console.log("🔄 Creando usuario admin...");

      // Paso 1: Crear usuario en Supabase Auth con auto-confirmación
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          },
          emailRedirectTo: undefined // Deshabilitar redirect de confirmación
        }
      });

      if (authError) {
        console.error("❌ Error en auth:", authError);
        setResult({
          success: false,
          message: `Error: ${authError.message}`
        });
        setIsLoading(false);
        return;
      }

      console.log("✅ Usuario auth creado:", authData.user?.id);

      // Paso 2: Crear perfil en la tabla profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro"
          });

        if (profileError) {
          console.error("⚠️ Error creando perfil:", profileError);
          // No es crítico, el perfil se puede crear después
        } else {
          console.log("✅ Perfil creado");
        }
      }

      setResult({
        success: true,
        message: "✅ Usuario admin creado exitosamente! Redirigiendo al login..."
      });

      // Cerrar sesión automáticamente para que pueda hacer login
      await supabase.auth.signOut();

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/Suafazon");
      }, 3000);

    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      setResult({
        success: false,
        message: `Error inesperado: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Setup Admin - Portal Maestro"
        description="Configuración inicial del administrador"
      />
      <CustomCursor />
      <FloatingParticles />

      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        {/* Efecto de fondo */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Card */}
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 border border-gold/20 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/30 to-accent/30 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-gold" />
              </motion.div>
              
              <h1 className="text-2xl font-serif text-gold tracking-[0.2em] mb-2">
                SETUP ADMIN
              </h1>
              <p className="text-sm text-muted-foreground">
                Crear usuario administrador
              </p>
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-400">
                  ⚠️ Solo usar UNA VEZ para crear el admin
                </p>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateAdmin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs text-gold tracking-wider uppercase">
                  Email del Admin
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs text-gold tracking-wider uppercase">
                  Contraseña
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres
                </p>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-xs text-gold tracking-wider uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>

              {/* Resultado */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    result.success
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-red-500/10 border border-red-500/30"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${
                    result.success ? "text-green-400" : "text-red-400"
                  }`}>
                    {result.message}
                  </p>
                </motion.div>
              )}

              {/* Botón */}
              <motion.button
                type="submit"
                disabled={isLoading || result?.success}
                whileHover={{ scale: isLoading || result?.success ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || result?.success ? 1 : 0.98 }}
                className={`w-full py-3 rounded-lg font-medium tracking-wider transition-all ${
                  isLoading || result?.success
                    ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-gold to-accent text-background hover:shadow-lg hover:shadow-gold/50"
                }`}
              >
                {isLoading ? "CREANDO..." : result?.success ? "CREADO ✓" : "CREAR ADMIN"}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/Suafazon")}
                className="text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                ← Volver al login
              </button>
            </div>

            {/* Instrucciones post-creación */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400 mb-2 font-medium">
                📋 Después de crear el admin:
              </p>
              <ol className="text-xs text-blue-400/80 space-y-1 list-decimal list-inside">
                <li>Espera la redirección automática</li>
                <li>Haz login con las credenciales creadas</li>
                <li>Elimina esta página (setup-admin.tsx)</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}