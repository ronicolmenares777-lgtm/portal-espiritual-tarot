import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Mic } from "lucide-react";

interface ChatMaestroProps {
  leadId: string;
  leadName: string;
}

interface Message {
  id: string;
  lead_id: string;
  text: string;
  is_from_maestro: boolean;
  created_at: string;
}

export function ChatMaestro({ leadId, leadName }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maestroAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Maestro";

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages and setup realtime
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ [USER] Error cargando mensajes:", error);
        return;
      }

      if (data) {
        setMessages(data as Message[]);
      }
    };

    loadMessages();

    // Suscripción realtime
    const channel = supabase
      .channel(`user-chat-${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log("📨 [USER] Nuevo mensaje recibido:", payload);
          const newMsg = payload.new as Message;
          
          setMessages((current) => {
            // Evitar duplicados
            const exists = current.some(m => m.id === newMsg.id);
            if (exists) {
              console.log("⚠️ [USER] Mensaje duplicado ignorado");
              return current;
            }
            console.log("✅ [USER] Agregando nuevo mensaje");
            return [...current, newMsg];
          });
        }
      )
      .subscribe((status) => {
        console.log("📡 [USER] Estado realtime:", status);
      });

    return () => {
      console.log("🔌 [USER] Desconectando realtime");
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageText = newMessage.trim();
      setNewMessage(""); // Limpiar input inmediatamente

      const { error } = await supabase
        .from("messages")
        .insert({
          lead_id: leadId,
          text: messageText,
          is_from_maestro: false,
        });

      if (error) {
        console.error("❌ [USER] Error enviando mensaje:", error);
        setNewMessage(messageText); // Restaurar mensaje si hay error
        return;
      }

      console.log("✅ [USER] Mensaje enviado");
    } catch (error) {
      console.error("❌ [USER] Error en sendMessage:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-gold/10 via-accent/10 to-gold/10 border-b border-gold/20 p-4 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
            <img
              src={maestroAvatar}
              alt="Maestro Espiritual"
              className="relative w-14 h-14 rounded-full ring-2 ring-gold shadow-lg"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">
              Maestro Espiritual
            </h2>
            <p className="text-sm text-muted-foreground">
              {isOnline ? "En línea" : "Desconectado"} · Responde en segundos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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
                      {new Date(message.created_at).toLocaleTimeString(
                        "es-ES",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-t border-border bg-card p-4 shadow-lg"
      >
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            title="Enviar imagen"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            title="Enviar audio"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="flex-shrink-0 bg-gradient-to-r from-gold to-accent hover:from-gold/90 hover:to-accent/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}