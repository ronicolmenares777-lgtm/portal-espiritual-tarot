import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Credenciales hardcoded
    if (email === "admin@suafazon.com" && password === "Suafazon2024!") {
      localStorage.setItem("adminSession", "logged_in");
      router.push("/Suafazon/dashboard");
    } else {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-purple-950/20 to-background">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-gold/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-serif text-gold">
            Portal Administrativo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Acceso exclusivo para maestros espirituales
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-foreground/80">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-background/50 border-gold/20 focus:border-gold/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground/80">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50 border-gold/20 focus:border-gold/50"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-background font-semibold"
            >
              Ingresar al Portal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}