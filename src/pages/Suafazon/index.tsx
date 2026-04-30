import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { verifyAdminCredentials } from "@/middleware/auth";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const adminUser = localStorage.getItem("admin_user");
    if (adminUser) {
      router.push("/Suafazon/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) {
        setError("Email o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Redirigir directamente al dashboard
        router.push("/Suafazon/dashboard");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error al iniciar sesión. Por favor intenta de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] relative overflow-hidden">
      <CustomCursor />
      <FloatingParticles />

      {/* Header con logo */}
      <div className="absolute top-0 left-0 right-0 p-8 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-lg flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className="text-[#D4AF37] font-serif text-xl">Portal Místico</span>
          </div>
        </div>
      </div>

      {/* Contenido centrado */}
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Card principal */}
          <div className="bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl border border-[#D4AF37]/10 rounded-2xl p-8 shadow-2xl shadow-[#D4AF37]/5">
            {/* Icono superior */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif text-[#D4AF37] mb-2 tracking-wide">
                Acceso Administrativo
              </h1>
              <p className="text-[#D4AF37]/60 text-sm">
                Portal exclusivo para guías espirituales
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[#D4AF37]/80 text-sm font-medium block">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="w-full bg-black/30 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-[#D4AF37] placeholder-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[#D4AF37]/80 text-sm font-medium block">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full bg-black/30 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-[#D4AF37] placeholder-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-semibold py-3.5 rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validando...
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
              className="text-[#D4AF37]/60 hover:text-[#D4AF37] text-sm transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Portal Espiritual
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}