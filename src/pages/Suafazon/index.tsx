import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { verifyAdminCredentials } from "@/middleware/auth";
import CustomCursor from "@/components/CustomCursor";
import FloatingParticles from "@/components/FloatingParticles";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar si ya hay sesión
    const adminUser = localStorage.getItem("admin_user");
    if (adminUser) {
      router.push("/Suafazon/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("🔐 Intentando login con:", email);

      const result = await verifyAdminCredentials(email, password);

      if (!result.success) {
        console.error("❌ Login fallido:", result.error);
        setError(result.error || "Credenciales inválidas");
        setIsLoading(false);
        return;
      }

      if (!result.user) {
        setError("Error del servidor");
        setIsLoading(false);
        return;
      }

      console.log("✅ Login exitoso, usuario:", result.user);

      // Guardar en localStorage
      localStorage.setItem("admin_user", JSON.stringify(result.user));

      // Redirigir al dashboard
      router.push("/Suafazon/dashboard");
    } catch (error: any) {
      console.error("❌ Error en handleSubmit:", error);
      setError(error.message || "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <CustomCursor />
      <FloatingParticles />

      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Título */}
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="font-serif text-5xl md:text-6xl mb-4 tracking-wider text-primary">
              PORTAL MÍSTICO
            </h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-4" />
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Acceso Espiritual
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-lg p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
                  Email Espiritual
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-md 
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-all duration-300"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
                  Contraseña Sagrada
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-md 
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground
                         font-medium rounded-md transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-primary/50
                         tracking-wider uppercase text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span>
                    Verificando...
                  </span>
                ) : (
                  "Acceder al Portal"
                )}
              </button>
            </form>
          </div>

          {/* Link de regreso */}
          <div className="text-center mt-8">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              ← Volver al Portal Espiritual
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}