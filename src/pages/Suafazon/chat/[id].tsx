import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Send,
  Star,
  ImageIcon,
  Mic,
  Check,
  CheckCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Lead } from "@/types/admin";

interface Message {
  id: string;
  lead_id: string;
  text: string;
  is_from_maestro: boolean;
  is_read: boolean;
  created_at: string;
}

export default function AdminChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const maestroAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=maestro&backgroundColor=fbbf24";

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load lead and messages
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadData = async () => {
      try {
        // Cargar lead
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (leadError) {
          console.error("❌ Error cargando lead:", leadError);
          return;
        }

        if (leadData) {
          setLead(leadData as Lead);
          console.log("✅ Lead cargado:", leadData.name);
        }

        // Cargar mensajes
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("lead_id", id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("❌ Error cargando mensajes:", messagesError);
          return;
        }

        if (messagesData) {
          setMessages(messagesData as Message[]);
          console.log("✅ Mensajes cargados:", messagesData.length);
          
          // Marcar mensajes del usuario como leídos
          const userMessages = messagesData.filter(m => !m.is_from_maestro && !m.is_read);
          if (userMessages.length > 0) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .in("id", userMessages.map(m => m.id));
          }
        }
      } catch (error) {
        console.error("❌ Error en loadData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Realtime subscription - FIXED
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    console.log("📡 [ADMIN] Configurando suscripción realtime para lead:", id);
    
    const channel = supabase
      .channel(`admin-chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("📨 [ADMIN] Nuevo mensaje recibido via realtime:", payload);
          const newMsg = payload.new as Message;
          
          setMessages((prev) => {
            // Verificar si el mensaje ya existe
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) {
              console.log("⚠️ [ADMIN] Mensaje duplicado ignorado:", newMsg.id);
              return prev;
            }
            console.log("✅ [ADMIN] Nuevo mensaje agregado:", newMsg.text);
            
            // Si el mensaje es del usuario, marcarlo como leído
            if (!newMsg.is_from_maestro) {
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
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("🔄 [ADMIN] Mensaje actualizado:", payload);
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe((status) => {
        console.log("📡 [ADMIN] Estado de suscripción realtime:", status);
      });

    return () => {
      console.log("🔌 [ADMIN] Desconectando suscripción realtime");
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || typeof id !== "string") return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          lead_id: id,
          text: newMessage.trim(),
          is_from_maestro: true,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        return;
      }

      console.log("✅ Mensaje enviado:", data);
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error en handleSendMessage:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus as Lead["status"] })
        .eq("id", lead.id);

      if (error) {
        console.error("❌ Error actualizando estado:", error);
        return;
      }

      setLead({ ...lead, status: newStatus as Lead["status"] });
      console.log("✅ Estado actualizado:", newStatus);
    } catch (error) {
      console.error("❌ Error en handleStatusChange:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ is_favorite: !lead.is_favorite })
        .eq("id", lead.id);

      if (error) {
        console.error("❌ Error actualizando favorito:", error);
        return;
      }

      setLead({ ...lead, is_favorite: !lead.is_favorite });
      console.log("✅ Favorito actualizado:", !lead.is_favorite);
    } catch (error) {
      console.error("❌ Error en handleToggleFavorite:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      nuevo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      enConversacion: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      clienteCaliente: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      listo: "bg-green-500/10 text-green-500 border-green-500/20",
      cerrado: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      perdido: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || colors.nuevo;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      nuevo: "🆕 Nuevo",
      enConversacion: "💬 En Conversación",
      clienteCaliente: "🔥 Caliente",
      listo: "✅ Listo",
      cerrado: "🔒 Cerrado",
      perdido: "❌ Perdido",
    };
    return labels[status] || labels.nuevo;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Cargando chat...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Lead no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      {/* Header Profesional */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/90 via-accent/80 to-primary/90 backdrop-blur-lg border-b border-gold/20 shadow-2xl shadow-gold/20">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Botón Volver */}
            <Button
              onClick={() => router.push("/Suafazon/dashboard")}
              variant="ghost"
              size="sm"
              className="text-background hover:bg-white/20 transition-all shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Avatar y Info del Lead */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md" />
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/50 shadow-lg flex items-center justify-center text-lg sm:text-xl font-bold text-background">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-background truncate">
                  {lead.name}
                </h1>
                <p className="text-xs sm:text-sm text-background/80 truncate">
                  {new Date(lead.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Clasificación */}
              <Select value={lead.status} onValueChange={handleStatusChange}>
                <SelectTrigger
                  className={`w-auto min-w-[120px] sm:min-w-[140px] text-xs sm:text-sm border ${getStatusColor(
                    lead.status
                  )}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">🆕 Nuevo</SelectItem>
                  <SelectItem value="enConversacion">💬 En Conversación</SelectItem>
                  <SelectItem value="clienteCaliente">🔥 Caliente</SelectItem>
                  <SelectItem value="listo">✅ Listo</SelectItem>
                  <SelectItem value="cerrado">🔒 Cerrado</SelectItem>
                  <SelectItem value="perdido">❌ Perdido</SelectItem>
                </SelectContent>
              </Select>

              {/* Favorito */}
              <Button
                onClick={handleToggleFavorite}
                variant="ghost"
                size="sm"
                className="text-background hover:bg-white/20 transition-all shrink-0"
              >
                <Star
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    lead.is_favorite ? "fill-background" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
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
                    : "bg-white text-foreground shadow-gray-200"
                }`}
              >
                {message.is_from_maestro ? (
                  <p className="text-xs font-bold mb-1 opacity-90">
                    Maestro Espiritual ✨
                  </p>
                ) : (
                  <p className="text-xs font-bold mb-1 text-primary">
                    {lead.name}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <p
                    className={`text-xs ${
                      message.is_from_maestro ? "opacity-80" : "opacity-70"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {message.is_from_maestro && (
                    <div className="text-xs opacity-80">
                      {message.is_read ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-gradient-to-r from-secondary/80 via-card/80 to-secondary/80 backdrop-blur-lg border-t border-border/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botones Multimedia */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all shrink-0"
            >
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all shrink-0"
            >
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Input */}
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-background/50 border-border/50 focus:border-gold focus:ring-gold/20 text-sm sm:text-base"
            />

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-gold to-accent hover:from-accent hover:to-gold text-background font-bold transition-all shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}