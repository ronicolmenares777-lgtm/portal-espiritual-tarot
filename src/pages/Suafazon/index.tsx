import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { motion } from "framer-motion";
import { Shield, User, Lock, Eye, EyeOff, Sparkles, Mail } from "lucide-react";
import Link from "next/link";
import { AuthService } from "@/services/authService";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        router.replace("/Suafazon/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Intentando login con:", email);
      
      const { user, session, error } = await AuthService.signIn(email, password);

      if (error) {
        console.error("❌ Error de autenticación:", error);
        setError(error.message || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      if (session) {
        console.log("✅ Login exitoso, sesión creada");
        router.push("/Suafazon/dashboard");
      } else {
        console.error("❌ No se creó sesión");
        setError("Error al iniciar sesión");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Error en handleLogin:", err);
      setError("Error al iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await AuthService.resetPassword(email);

      if (error) {
        setError(error.message || "Error al enviar email de recuperación");
        setLoading(false);
        return;
      }

      setResetSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("Error al enviar email de recuperación");
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Portal Maestro - Acceso Administrativo"
        description="Panel de administración del portal espiritual"
      />
      
      <CustomCursor />
      <FloatingParticles />

      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full relative z-10"
        >
          <div 
            className="bg-gradient-to-br from-black/90 to-black/70 border border-gold/30 rounded-3xl p-8 space-y-6 backdrop-blur-sm"
            style={{
              boxShadow: "0 0 60px hsl(var(--gold) / 0.2)",
            }}
          >
            {/* Ícono de escudo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-full border-2 border-gold/50 flex items-center justify-center bg-gradient-to-br from-gold/20 to-transparent">
                <Shield className="w-10 h-10 text-gold" />
              </div>
            </motion.div>

            {/* Título */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif text-gold tracking-wider">
                PORTAL MAESTRO
              </h1>
              <p className="text-xs text-muted-foreground/80 tracking-[0.3em] uppercase">
                Inicia el ritual administrativo
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={resetPasswordMode ? handleResetPassword : handleLogin} className="space-y-6">
              {/* Mostrar error si existe */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Mostrar éxito de reset */}
              {resetSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
                  Email de recuperación enviado. Revisa tu correo.
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs text-gold/80 tracking-[0.2em] uppercase font-medium">
                  E-mail sagrado
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tubrujo@gmail.com"
                    className="w-full bg-black/50 border border-gold/20 rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground/60">
                  Email registrado: tubrujo@gmail.com
                </p>
              </div>

              {/* Campo de contraseña - solo si no está en modo reset */}
              {!resetPasswordMode && (
                <div className="space-y-2">
                  <label className="text-xs text-gold tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Palabra de Poder
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu clave sagrada..."
                      className="w-full bg-muted/50 border border-gold/20 rounded-lg pl-12 pr-12 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold via-amber-400 to-gold text-black font-semibold py-4 rounded-xl tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--gold))] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "PROCESANDO..." : resetPasswordMode ? "Enviar Email" : "Entrar al Templo"}
              </button>

              {/* Toggle reset password */}
              <button
                type="button"
                onClick={() => {
                  setResetPasswordMode(!resetPasswordMode);
                  setError("");
                  setResetSuccess(false);
                }}
                className="block w-full text-center text-muted-foreground/60 text-sm hover:text-gold transition-colors"
              >
                {resetPasswordMode ? "← Volver al login" : "¿Olvidaste tu contraseña?"}
              </button>

              {/* Volver */}
              <Link 
                href="/"
                className="block text-center text-muted-foreground/60 text-sm hover:text-gold transition-colors"
              >
                Volver al infinito
              </Link>
            </form>

            {/* Decoración inferior */}
            <div className="pt-4 flex justify-center gap-2 opacity-30">
              <Sparkles className="w-3 h-3 text-gold animate-pulse" />
              <Sparkles className="w-3 h-3 text-gold animate-pulse" style={{ animationDelay: '0.3s' }} />
              <Sparkles className="w-3 h-3 text-gold animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}