import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Star, Phone, MessageCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lead, LeadStatus } from "@/types/admin";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function AdminChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar lead y mensajes
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

        setLead(leadData as Lead);

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

        setMessages(messagesData || []);
      } catch (error) {
        console.error("❌ Error en loadData:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // SUSCRIPCIÓN REALTIME
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    console.log("🔔 Configurando suscripción realtime para lead:", id);

    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("📨 Nuevo mensaje recibido:", payload.new);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe((status) => {
        console.log("🔔 Estado de suscripción:", status);
      });

    return () => {
      console.log("🔌 Desconectando suscripción realtime");
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id || typeof id !== "string" || sending) return;

    setSending(true);

    try {
      const { error } = await supabase.from("messages").insert({
        lead_id: id,
        text: newMessage.trim(),
        is_from_maestro: true,
      });

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        return;
      }

      setNewMessage("");
    } catch (error) {
      console.error("❌ Error en handleSendMessage:", error);
    } finally {
      setSending(false);
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
    } catch (error) {
      console.error("❌ Error en handleToggleFavorite:", error);
    }
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
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      nuevo: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      enConversacion: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      clienteCaliente: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      listo: "bg-green-500/10 text-green-500 border-green-500/30",
      cerrado: "bg-gray-500/10 text-gray-500 border-gray-500/30",
      perdido: "bg-red-500/10 text-red-500 border-red-500/30",
    };
    return colors[status] || colors.nuevo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Lead no encontrado</p>
          <Button onClick={() => router.push("/Suafazon/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex flex-col">
      {/* Header - Mobile Responsive */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/Suafazon/dashboard")}
              className="flex-shrink-0 hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-gold/30 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gold/20 to-amber-500/20 text-gold font-bold">
                  {lead.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base sm:text-lg truncate">{lead.name}</h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{lead.whatsapp}</span>
                </div>
              </div>
            </div>

            {/* Actions - Mobile Responsive */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={lead.is_favorite ? "text-gold" : ""}
              >
                <Star
                  className="h-5 w-5"
                  fill={lead.is_favorite ? "currentColor" : "none"}
                />
              </Button>
            </div>
          </div>

          {/* Status & Problem - Mobile Responsive */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[220px] border-border/50">
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

            <div className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-xs text-muted-foreground mb-0.5">Problema:</p>
              <p className="text-sm line-clamp-2">{lead.problem}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Mobile Responsive */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
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
                className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[75%] ${
                  message.is_from_maestro ? "" : "flex-row-reverse"
                }`}
              >
                {/* Avatar - Only for maestro */}
                {message.is_from_maestro && (
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-gold/40 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white text-xs sm:text-sm font-bold">
                      ME
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-md ${
                    message.is_from_maestro
                      ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white shadow-gold/20"
                      : "bg-card border border-border/50 shadow-sm"
                  }`}
                >
                  {message.is_from_maestro && (
                    <p className="text-[10px] sm:text-xs font-bold mb-1 opacity-90">
                      Tú (Admin) ✨
                    </p>
                  )}
                  <p className="text-sm sm:text-base leading-relaxed break-words">
                    {message.text}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs mt-1.5 ${
                      message.is_from_maestro ? "opacity-80" : "opacity-60"
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

      {/* Input Area - Mobile Responsive */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-2 sm:gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-background/50 border-border/50 focus:border-gold/50 text-sm sm:text-base"
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-gold via-amber-500 to-amber-600 hover:from-amber-600 hover:via-gold hover:to-amber-500 text-white shadow-lg shadow-gold/30 flex-shrink-0"
              size="icon"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}