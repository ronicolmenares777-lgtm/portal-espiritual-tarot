import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function ChatUsuario() {
  const router = useRouter();
  const { leadId } = router.query;
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [lead, setLead] = useState<Tables<"leads"> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar lead
  useEffect(() => {
    if (!leadId || typeof leadId !== "string") return;

    const loadLead = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (data) {
        setLead(data);
      }
    };

    loadLead();
  }, [leadId]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!leadId || typeof leadId !== "string") return;

    console.log("🔄 Iniciando polling de mensajes cada 2 segundos");

    const loadMessages = async () => {
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
        setMessages(data);
      }
    };

    // Carga inicial
    loadMessages();

    // Polling cada 2 segundos
    const interval = setInterval(loadMessages, 2000);

    return () => {
      console.log("🛑 Deteniendo polling de mensajes");
      clearInterval(interval);
    };
  }, [leadId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId || typeof leadId !== "string") return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    console.log("📤 Enviando mensaje del usuario");

    const { error } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: messageText,
      is_from_maestro: false,
    });

    if (error) {
      console.error("❌ Error enviando mensaje:", error);
      setNewMessage(messageText);
    } else {
      console.log("✅ Mensaje enviado exitosamente");
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
      <SEO
        title={`Chat con Maestro Espiritual - ${lead.name}`}
        description="Continúa tu conversación con el maestro espiritual"
      />
      <div className="flex flex-col h-screen bg-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-black border-b border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-background">
                ME
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-semibold text-foreground">
                Maestro Espiritual
              </h1>
              <p className="text-sm text-primary flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                En línea
              </p>
            </div>
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
                    ? "bg-purple-900/30 text-foreground border border-primary/20"
                    : "bg-gradient-to-r from-primary to-accent text-background"
                }`}
              >
                {message.is_from_maestro && (
                  <p className="text-xs text-primary mb-1">Maestro Espiritual</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString("es-MX", {
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
          className="p-4 bg-gradient-to-r from-purple-900/50 to-black border-t border-primary/20"
        >
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-background/50 border-primary/20 text-foreground placeholder:text-muted-foreground"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
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