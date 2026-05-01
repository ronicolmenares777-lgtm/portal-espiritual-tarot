import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Message = Tables<"messages">;

export default function ChatUsuario() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLeadId = localStorage.getItem("leadId");
    if (!storedLeadId) {
      router.push("/");
      return;
    }
    setLeadId(storedLeadId);
  }, [router]);

  useEffect(() => {
    if (!leadId) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }
      setLoading(false);
    };

    loadMessages();

    // Suscripción en tiempo real
    const channel = supabase
      .channel(`messages:${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Evitar duplicados
            if (prev.some(m => m.id === newMsg.id)) {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !leadId || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      lead_id: leadId,
      content: messageText,
      sender_type: "user",
    });

    if (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-black border-b border-primary/20 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarFallback className="bg-primary/20 text-primary">
              M
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-serif text-lg text-foreground">Maestro Espiritual</h2>
            <p className="text-xs text-primary">En línea</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender_type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.sender_type === "user"
                  ? "bg-primary text-black"
                  : "bg-purple-900/30 text-foreground border border-primary/20"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.created_at).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gradient-to-r from-purple-900/30 to-black border-t border-primary/20">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-purple-900/20 border-primary/30 text-foreground placeholder:text-muted-foreground"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-primary hover:bg-primary/90 text-black"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}