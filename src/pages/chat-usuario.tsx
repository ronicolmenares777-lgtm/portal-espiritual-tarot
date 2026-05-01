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
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!leadId || typeof leadId !== "string") return;

    console.log("🔄 Iniciando carga de mensajes para lead:", leadId);

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      console.log("📨 Mensajes cargados:", data?.length || 0);
      if (error) console.error("❌ Error cargando mensajes:", error);

      if (data) {
        setMessages(data);
      }
    };

    loadMessages();

    // Suscripción Realtime
    console.log("🔔 Configurando suscripción Realtime para lead:", leadId);
    
    const channel = supabase
      .channel(`chat-usuario-${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log("✨ NUEVO MENSAJE RECIBIDO:", payload.new);
          const newMsg = payload.new as Tables<"messages">;
          setMessages((current) => {
            // Evitar duplicados
            const exists = current.some((m) => m.id === newMsg.id);
            if (exists) {
              console.log("⚠️ Mensaje duplicado, ignorando");
              return current;
            }
            console.log("✅ Agregando mensaje nuevo al estado");
            return [...current, newMsg];
          });
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado suscripción Realtime:", status);
      });

    return () => {
      console.log("🔌 Desconectando canal Realtime");
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId || typeof leadId !== "string") return;

    console.log("📤 Enviando mensaje:", newMessage);
    setSending(true);

    const { data, error } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: newMessage,
      is_from_maestro: false,
    }).select();

    if (error) {
      console.error("❌ Error enviando mensaje:", error);
    } else {
      console.log("✅ Mensaje enviado exitosamente:", data);
    }

    setNewMessage("");
    setSending(false);
  };

  return (
    <>
      <div className="min-h-screen bg-black flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 backdrop-blur-sm border-b border-purple-700/30 p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-primary/30">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-primary">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-primary">Maestro Espiritual</h1>
            <p className="text-sm text-primary/70">En línea</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.is_from_maestro ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.is_from_maestro
                    ? "bg-purple-900/50 text-primary border border-purple-700/30"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString("es-MX", {
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
          className="border-t border-purple-700/30 bg-purple-900/20 backdrop-blur-sm p-4"
        >
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-purple-900/30 border-purple-700/30 text-primary placeholder:text-primary/50"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
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