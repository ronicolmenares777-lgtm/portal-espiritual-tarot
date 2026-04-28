import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ChatMaestro } from "@/components/ChatMaestro";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MessageService } from "@/services/messageService";

export default function ChatUsuario() {
  const router = useRouter();
  const [userAuth, setUserAuth] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const authData = localStorage.getItem("userAuth");
    if (!authData) {
      console.log("⚠️ No hay datos de autenticación - Redirigiendo al inicio");
      router.replace("/");
      return;
    }

    const user = JSON.parse(authData);
    console.log("✅ Usuario autenticado:", user);
    setUserAuth(user);

    // Cargar mensajes del lead
    const loadMessages = async () => {
      try {
        const data = await MessageService.getByLeadId(user.id);
        
        console.log("✅ Mensajes cargados:", data?.length || 0);
        setMessages(data || []);
      } catch (err) {
        console.error("Error en loadMessages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Suscribirse a nuevos mensajes
    const channel = supabase
      .channel(`messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${user.id}`,
        },
        () => {
          console.log("🔄 Nuevo mensaje recibido - Recargando...");
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-3 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
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

      <div className="min-h-screen bg-background">
        <ChatMaestro
          userName={userAuth.name}
          userPhone={userAuth.country_code + userAuth.whatsapp}
          userProblem={userAuth.problem}
          userCard={userAuth.cards_selected?.[0] || ""}
        />
      </div>
    </>
  );
}