import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function SetupAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    console.log("🔧 Creando usuario admin:", email);

    try {
      // PASO 1: Crear usuario con signUp
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            role: "admin"
          }
        }
      });

      if (signUpError) {
        console.error("❌ Error creando usuario:", signUpError);
        setMessage(`Error: ${signUpError.message}`);
        setLoading(false);
        return;
      }

      if (!signUpData.user) {
        setMessage("Error: No se pudo crear el usuario");
        setLoading(false);
        return;
      }

      console.log("✅ Usuario creado:", signUpData.user);

      // PASO 2: Crear perfil con role = 'admin'
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: signUpData.user.id,
          email: email.trim(),
          full_name: "Maestro Espiritual",
          role: "admin"
        });

      if (profileError) {
        console.error("❌ Error creando perfil:", profileError);
        setMessage(`Usuario creado pero error en perfil: ${profileError.message}`);
        setLoading(false);
        return;
      }

      console.log("✅ Perfil admin creado exitosamente");

      setSuccess(true);
      setMessage(`✅ Admin creado exitosamente!\n\nEmail: ${email}\nContraseña: ${password}\n\nAhora puedes hacer login en /Suafazon`);
      setLoading(false);

    } catch (err) {
      console.error("❌ Error inesperado:", err);
      setMessage("Error inesperado al crear admin");
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
            🔧 Setup Admin
          </h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Página temporal para crear usuario administrador
          </p>

          {!success ? (
            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email del Admin</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ejemplo.com"
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
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              {message && !success && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm whitespace-pre-line">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Creando..." : "Crear Admin"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-6 rounded-lg text-sm whitespace-pre-line text-center">
                {message}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = "/Suafazon"}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Ir al Login
                </Button>

                <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg text-xs">
                  ⚠️ IMPORTANTE: Después de hacer login, elimina esta página temporal:
                  <br />
                  <code className="text-xs">src/pages/Suafazon/setup-admin.tsx</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}