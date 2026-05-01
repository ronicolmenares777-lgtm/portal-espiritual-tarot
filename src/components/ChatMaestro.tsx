import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ImageIcon, Mic } from "lucide-react";

interface Message {
  id: string;
  lead_id: string;
  text: string;
  is_from_maestro: boolean;
  created_at: string;
}

interface ChatMaestroProps {
  leadId: string;
  leadName: string;
}

export function ChatMaestro({ leadId, leadName }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maestroAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=maestro&backgroundColor=f59e0b";

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error:", error);
        return;
      }

      if (data) {
        setMessages(data as Message[]);
      }
    };

    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`user-messages-${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log("📨 [USER] Nuevo mensaje:", payload);
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      lead_id: leadId,
      text: newMessage.trim(),
      is_from_maestro: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          lead_id: leadId,
          text: tempMessage.text,
          is_from_maestro: false,
        });

      if (error) {
        console.error("❌ Error:", error);
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header - FIXED */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gold/10 via-amber-500/10 to-gold/10 border-b border-gold/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
              <img
                src={maestroAvatar}
                alt="Maestro"
                className="relative w-12 h-12 rounded-full ring-2 ring-gold/50 shadow-lg"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-background" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Maestro Espiritual</h2>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                En línea - Responde en segundos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.is_from_maestro ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[75%] ${
                  message.is_from_maestro ? "" : "flex-row-reverse"
                }`}
              >
                {message.is_from_maestro && (
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
                    <img
                      src={maestroAvatar}
                      alt="Maestro"
                      className="relative w-10 h-10 rounded-full ring-2 ring-gold/50 shadow-lg"
                    />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 shadow-md ${
                    message.is_from_maestro
                      ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white shadow-gold/30"
                      : "bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  {!message.is_from_maestro && (
                    <p className="text-xs font-semibold mb-1 text-gray-700">
                      {leadName}
                    </p>
                  )}
                  {message.is_from_maestro && (
                    <p className="text-xs font-bold mb-1 opacity-90">
                      Maestro Espiritual ✨
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-1.5 ${
                      message.is_from_maestro ? "opacity-80" : "text-gray-600"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - FIXED */}
      <div className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="px-4 py-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Mic className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1"
            />
            <Button onClick={sendMessage} className="flex-shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}