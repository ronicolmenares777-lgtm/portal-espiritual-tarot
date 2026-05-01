import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles } from "lucide-react";

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

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }
    };

    loadMessages();

    // Suscripción en tiempo real
    const channel = supabase
      .channel(`chat:${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Tables<"messages">;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Tables<"messages">;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !leadId || typeof leadId !== "string") return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: messageText,
      is_from_maestro: false,
    });

    if (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
    }

    setSending(false);
  };

  return (
    <>
      <SEO
        title="Chat con el Maestro Espiritual"
        description="Conversación con tu guía espiritual"
      />
      <div className="min-h-screen bg-black flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/40 to-black border-b border-primary/20 p-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/50">
              <AvatarFallback className="bg-gradient-to-br from-primary to-amber-600">
                <Sparkles className="h-6 w-6 text-background" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-serif text-lg font-semibold text-foreground">
                Maestro Espiritual
              </h1>
              <p className="text-sm text-primary/70">En línea</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.is_from_maestro ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.is_from_maestro
                    ? "bg-muted/50 text-foreground"
                    : "bg-gradient-to-r from-primary to-amber-600 text-background"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
          onSubmit={handleSendMessage}
          className="border-t border-primary/20 p-4 bg-muted/20"
        >
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-background/50 border-primary/30 focus:border-primary"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}