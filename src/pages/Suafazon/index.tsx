import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { motion } from "framer-motion";
import { Shield, User, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calcular fuerza de la contraseña
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Longitud
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 15;
    
    // Minúsculas
    if (/[a-z]/.test(password)) strength += 15;
    
    // Números
    if (/[0-9]/.test(password)) strength += 10;
    
    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    return Math.min(100, Math.max(0, strength));
  };

  const passwordStrength = calculatePasswordStrength(password);
  const strengthColor = 
    passwordStrength < 40 ? "#ef4444" : 
    passwordStrength < 70 ? "#f59e0b" : 
    "#10b981";
  const strengthText = 
    passwordStrength < 40 ? "Débil" : 
    passwordStrength < 70 ? "Media" : 
    "Fuerte";
  
  // Asegurar que strengthWidth siempre sea un número válido entre 0 y 100
  const strengthWidth = !password || isNaN(passwordStrength) ? 0 : Math.min(100, Math.max(0, passwordStrength));

  // Verificar si ya está autenticado
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (isAuth === "true") {
      router.push("/Suafazon/dashboard");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación simple (mock)
    if (email === "admin@tarot.com" && password === "maestro2024") {
      setIsLoading(true);
      
      // Simular autenticación
      setTimeout(() => {
        // Guardar sesión en localStorage
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminEmail", email);
        
        // Redirigir al dashboard
        router.push("/Suafazon/dashboard");
      }, 1500);
    } else {
      alert("Credenciales incorrectas. Usa admin@tarot.com / maestro2024");
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
            <form onSubmit={handleLogin} className="space-y-6">
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
                    placeholder="admin@tarot.com"
                    className="w-full bg-black/50 border border-gold/20 rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <label className="text-xs text-gold tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Palabra de Poder
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu clave sagrada..."
                  className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gold via-amber-400 to-gold text-black font-semibold py-4 rounded-xl tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--gold))] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "ENTRANDO..." : "Entrar al Templo"}
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