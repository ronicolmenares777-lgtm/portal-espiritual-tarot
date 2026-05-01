import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles } from "lucide-react";

interface ChatMaestroProps {
  leadId: string;
}

export function ChatMaestro({ leadId }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [lead, setLead] = useState<Tables<"leads"> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar lead
  useEffect(() => {
    const loadLead = async () => {
      console.log("📋 Cargando lead:", leadId);
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (data) {
        console.log("✅ Lead cargado:", data.name);
        setLead(data);
      }
    };

    loadLead();
  }, [leadId]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    console.log("🔄 [CHAT USUARIO] Iniciando polling cada 2 segundos para leadId:", leadId);

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
        console.log(`📨 [CHAT USUARIO] Mensajes cargados: ${data.length}`);
        setMessages(data);
      }
    };

    // Carga inicial
    loadMessages();

    // Polling cada 2 segundos
    const interval = setInterval(() => {
      console.log("⏰ [CHAT USUARIO] Ejecutando polling...");
      loadMessages();
    }, 2000);

    return () => {
      console.log("🛑 [CHAT USUARIO] Deteniendo polling");
      clearInterval(interval);
    };
  }, [leadId]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    console.log("📤 [CHAT USUARIO] Enviando mensaje");

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center gap-3 shadow-lg border-b border-primary/20">
        <Avatar className="h-12 w-12 border-2 border-primary-foreground/20">
          <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-semibold text-primary-foreground">
            Maestro Espiritual
          </h1>
          <p className="text-sm text-primary-foreground/70 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            En línea
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => {
          const isFromMaestro = message.is_from_maestro;

          return (
            <div
              key={message.id}
              className={`flex ${isFromMaestro ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isFromMaestro
                    ? "bg-card text-card-foreground border border-border"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm break-words whitespace-pre-wrap">
                  {message.text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isFromMaestro ? "text-muted-foreground" : "text-primary-foreground/70"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-card border-t border-border"
      >
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-background border-border"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {sending ? (
              <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}