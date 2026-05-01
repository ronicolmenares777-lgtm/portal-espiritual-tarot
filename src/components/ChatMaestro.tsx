import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  lead_id: string;
  text: string;
  is_from_maestro: boolean;
  is_read: boolean;
  created_at: string;
}

interface ChatMaestroProps {
  leadId: string;
  leadName: string;
}

export function ChatMaestro({ leadId, leadName }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maestroAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=maestro&backgroundColor=fbbf24";

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
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
          setMessages(data as Message[]);
          console.log("✅ [USUARIO] Mensajes cargados:", data.length);
          
          // Marcar mensajes del maestro como leídos
          const maestroMessages = data.filter(m => m.is_from_maestro && !m.is_read);
          if (maestroMessages.length > 0) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .in("id", maestroMessages.map(m => m.id));
          }
        }
      } catch (error) {
        console.error("❌ Error en loadMessages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [leadId]);

  // Realtime subscription
  useEffect(() => {
    console.log("📡 [USUARIO] Configurando suscripción realtime para lead:", leadId);

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
          console.log("📨 [USUARIO] Nuevo mensaje recibido via realtime:", payload);
          const newMsg = payload.new as Message;
          
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) {
              console.log("⚠️ [USUARIO] Mensaje duplicado ignorado:", newMsg.id);
              return prev;
            }
            console.log("✅ [USUARIO] Nuevo mensaje agregado:", newMsg.text);
            
            // Si el mensaje es del maestro, marcarlo como leído
            if (newMsg.is_from_maestro) {
              supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMsg.id)
                .then(() => console.log("✅ Mensaje marcado como leído"));
            }
            
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
          console.log("🔄 [USUARIO] Mensaje actualizado:", payload);
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe((status) => {
        console.log("📡 [USUARIO] Estado de suscripción realtime:", status);
      });

    return () => {
      console.log("🔌 [USUARIO] Desconectando suscripción realtime");
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          lead_id: leadId,
          text: newMessage.trim(),
          is_from_maestro: false,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        return;
      }

      if (data) {
        console.log("✅ Mensaje enviado:", data);
        setNewMessage("");
      }
    } catch (error) {
      console.error("❌ Error en sendMessage:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-gold animate-pulse">Conectando con el maestro...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-gradient-to-r from-secondary/90 via-card/90 to-secondary/90 backdrop-blur-lg border-b border-gold/20 shadow-xl shadow-gold/10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gold/30 rounded-full blur-lg" />
              <img
                src={maestroAvatar}
                alt="Maestro Espiritual"
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full ring-2 ring-gold/60 shadow-xl"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gold">
                Maestro Espiritual
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                En línea · Responde en segundos
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.is_from_maestro ? "justify-start" : "justify-end"
                } mb-4`}
              >
                <div
                  className={`flex gap-3 max-w-[75%] ${
                    message.is_from_maestro ? "" : "flex-row-reverse"
                  }`}
                >
                  {/* Avatar */}
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

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-md ${
                      message.is_from_maestro
                        ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white shadow-gold/30"
                        : "bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm"
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
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky bottom-0 bg-gradient-to-r from-secondary/90 via-card/90 to-secondary/90 backdrop-blur-lg border-t border-gold/20 shadow-2xl shadow-gold/10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-background/60 border-border/60 focus:border-gold focus:ring-gold/30 text-sm sm:text-base rounded-xl"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-gold to-accent hover:from-accent hover:to-gold text-background font-bold transition-all shadow-lg shadow-gold/40 hover:shadow-xl hover:shadow-gold/60 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 sm:px-6"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}