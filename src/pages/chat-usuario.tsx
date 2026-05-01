import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChatMaestro } from "@/components/ChatMaestro";

export default function ChatUsuarioPage() {
  const router = useRouter();
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadName, setLeadName] = useState<string>("Usuario");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener leadId del localStorage o URL
    const storedLeadId = localStorage.getItem("currentLeadId");
    const urlLeadId = router.query.leadId as string;

    const finalLeadId = urlLeadId || storedLeadId;

    if (finalLeadId) {
      setLeadId(finalLeadId);
      
      // Intentar obtener el nombre del localStorage
      const storedName = localStorage.getItem("userName");
      if (storedName) {
        setLeadName(storedName);
      }
    }

    setIsLoading(false);
  }, [router.query]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gold animate-pulse">Cargando chat...</div>
      </div>
    );
  }

  if (!leadId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">No se encontró información de la consulta</p>
          <button
            onClick={() => router.push("/")}
            className="text-gold hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ChatMaestro leadId={leadId} leadName={leadName} />
    </div>
  );
}