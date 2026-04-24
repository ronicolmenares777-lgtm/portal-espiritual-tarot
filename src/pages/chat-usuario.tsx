import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ChatMaestro } from "@/components/ChatMaestro";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Sparkles } from "lucide-react";

export default function ChatUsuario() {
  const router = useRouter();
  const [userAuth, setUserAuth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const auth = localStorage.getItem("userAuth");
    
    if (!auth) {
      console.log("⚠️ No hay sesión de usuario, redirigiendo...");
      router.replace("/");
      return;
    }

    try {
      const userData = JSON.parse(auth);
      console.log("✅ Usuario autenticado:", userData);
      setUserAuth(userData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parseando userAuth:", error);
      router.replace("/");
    }
  }, [router]);

  if (isLoading) {
    return (
      <>
        <SEO title="Cargando..." />
        <CustomCursor />
        <FloatingParticles />
        
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-gold mx-auto mb-4 animate-pulse" />
            <p className="text-foreground/80">Cargando tu consulta...</p>
          </div>
        </div>
      </>
    );
  }

  if (!userAuth) {
    return null;
  }

  return (
    <>
      <SEO 
        title="Tu Consulta Espiritual"
        description="Continúa tu conversación con el maestro espiritual"
      />
      <CustomCursor />
      <FloatingParticles />

      <div className="min-h-screen bg-background">
        <ChatMaestro
          userName={userAuth.name}
          userPhone={userAuth.country_code + userAuth.whatsapp}
          userProblem={userAuth.problem}
          userCard={userAuth.selected_cards?.[0] || ""}
          onBack={() => router.push("/")}
        />
      </div>
    </>
  );
}