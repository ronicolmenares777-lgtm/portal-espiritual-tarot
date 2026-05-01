import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChatMaestro } from "@/components/ChatMaestro";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { supabase } from "@/integrations/supabase/client";

export default function ChatUsuarioPage() {
  const router = useRouter();
  const [userAuth, setUserAuth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      // Obtener lead_id de localStorage (guardado en index.tsx)
      const storedLeadId = localStorage.getItem("currentLeadId");
      
      if (!storedLeadId) {
        console.error("❌ No hay lead ID guardado");
        router.push("/");
        return;
      }

      console.log("🔍 Cargando datos del lead:", storedLeadId);

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", storedLeadId)
        .single();

      console.log("Resultado:", { data, error });

      if (error || !data) {
        console.error("❌ Error cargando lead:", error);
        router.push("/");
        return;
      }

      setUserAuth(data);
      setLoading(false);
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gold text-xl">Conectando con el maestro...</div>
      </div>
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

      <div className="min-h-screen">
        {leadId ? (
          <ChatMaestro 
            leadId={leadId} 
            leadName={userName || "Usuario"}
          />
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-foreground">No se encontró información de la consulta</p>
          </div>
        )}
      </div>
    </>
  );
}