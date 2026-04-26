import { useState } from "react";
import { useRouter } from "next/router";
import { verifyAdminCredentials } from "@/middleware/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-width-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-amber-300 mb-2">Portal Admin</h1>
            <p className="text-purple-200">Acceso al Panel de Control Espiritual</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-purple-100">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tarot.com"
                required
                disabled={isLoading}
                className="mt-2 bg-white/10 border-white/30 text-white placeholder:text-purple-300"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-purple-100">
                Contraseña
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-white/30 text-white placeholder:text-purple-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-100"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-900 font-semibold py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Acceder al Portal"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-300 text-sm">
              Solo usuarios autorizados pueden acceder
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-purple-200 hover:text-amber-300 text-sm underline"
          >
            ← Volver al Portal Espiritual
          </a>
        </div>
      </div>
    </div>
  );
}