import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

export default function ChatUsuario() {
  const router = useRouter();
  const { leadId } = router.query;
  const [lead, setLead] = useState<Tables<"leads"> | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar lead
  useEffect(() => {
    if (!leadId || typeof leadId !== "string") {
      console.log("❌ leadId no válido:", leadId);
      return;
    }

    console.log("✅ leadId válido:", leadId);

    const loadLead = async () => {
      console.log("🔍 Cargando lead...");
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) {
        console.error("❌ Error cargando lead:", error);
        return;
      }

      if (data) {
        console.log("✅ Lead cargado:", data);
        setLead(data);
      }
    };

    loadLead();
  }, [leadId]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!leadId || typeof leadId !== "string") {
      console.log("⚠️ Polling cancelado - leadId no válido:", leadId);
      return;
    }

    console.log("🔄 INICIANDO POLLING para leadId:", leadId);

    const loadMessages = async () => {
      console.log("📡 Consultando mensajes...");
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error cargando mensajes:", error);
        return;
      }

      if (data) {
        console.log(`📨 Mensajes cargados: ${data.length}`, data);
        setMessages(data);
      } else {
        console.log("⚠️ No hay mensajes");
      }
    };

    // Carga inicial inmediata
    loadMessages();

    // Polling cada 2 segundos
    const interval = setInterval(() => {
      console.log("⏰ Ejecutando polling...");
      loadMessages();
    }, 2000);

    return () => {
      console.log("🛑 Deteniendo polling");
      clearInterval(interval);
    };
  }, [leadId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId || typeof leadId !== "string") {
      console.log("⚠️ No se puede enviar - mensaje vacío o leadId inválido");
      return;
    }

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    console.log("📤 Enviando mensaje del usuario:", messageText);

    const { data, error } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: messageText,
      is_from_maestro: false,
    }).select();

    if (error) {
      console.error("❌ Error enviando mensaje:", error);
      setNewMessage(messageText);
    } else {
      console.log("✅ Mensaje enviado exitosamente:", data);
    }

    setSending(false);
  };

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          background-color: #000000 !important;
        }
      `}</style>

      <div className="flex flex-col h-screen bg-black">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-background/95 backdrop-blur border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 bg-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Maestro Espiritual</h1>
            <p className="text-sm text-primary">En línea</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.is_from_maestro ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.is_from_maestro
                    ? "bg-card text-card-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-background/95 backdrop-blur border-t border-border"
        >
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-card border-border text-foreground"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-primary hover:bg-primary/90"
            >
              {sending ? (
                <Sparkles className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}