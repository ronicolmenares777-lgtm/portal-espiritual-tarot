import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Star, StarOff, Image as ImageIcon, Mic, Phone, Video, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import type { Lead, LeadStatus } from "@/types/admin";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  lead_id: string;
  text: string;
  is_from_maestro: boolean;
  created_at: string;
}

export default function AdminChat() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const maestroAvatar = "/maestro-avatar.png";

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load lead and messages
  useEffect(() => {
    if (!id) return;

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
          console.log("✅ Lead cargado:", leadData);
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
        }
      } catch (error) {
        console.error("❌ Error en loadData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Suscripción realtime
    console.log("📡 Configurando suscripción realtime para lead:", id);
    
    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("📨 Nuevo mensaje recibido:", payload);
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Evitar duplicados
            if (prev.some(m => m.id === newMsg.id)) {
              console.log("⚠️ Mensaje duplicado ignorado:", newMsg.id);
              return prev;
            }
            console.log("✅ Mensaje agregado:", newMsg);
            return [...prev, newMsg];
          });
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado de suscripción realtime:", status);
      });

    return () => {
      console.log("🔌 Desconectando suscripción realtime");
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !lead || isSending) return;

    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          lead_id: lead.id,
          text: newMessage.trim(),
          is_from_maestro: true,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        return;
      }

      console.log("✅ Mensaje enviado exitosamente:", data);
      setNewMessage("");
    } catch (error) {
      console.error("❌ Error en handleSendMessage:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus as LeadStatus })
        .eq("id", lead.id);

      if (error) {
        console.error("❌ Error actualizando estado:", error);
        return;
      }

      setLead({ ...lead, status: newStatus as LeadStatus });
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
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto" />
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Lead no encontrado</p>
          <Button onClick={() => router.push("/Suafazon/dashboard")}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header - MEJORADO Y PROFESIONAL */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          {/* Left section */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/Suafazon/dashboard")}
              className="flex-shrink-0 hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-gold/30 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gold to-amber-600 text-white font-bold">
                  {lead.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base sm:text-lg truncate">{lead.name}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {lead.whatsapp}
                </p>
              </div>
            </div>
          </div>

          {/* Right section - Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Status Selector */}
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className={cn("w-[180px] border", getStatusColor(lead.status))}>
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

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="hover:bg-muted/50"
            >
              {lead.is_favorite ? (
                <Star className="h-5 w-5 fill-gold text-gold" />
              ) : (
                <StarOff className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <Video className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Right section - Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="hover:bg-muted/50"
            >
              {lead.is_favorite ? (
                <Star className="h-5 w-5 fill-gold text-gold" />
              ) : (
                <StarOff className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Estado</div>
                  <Select value={lead.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className={cn("w-full border", getStatusColor(lead.status))}>
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
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Badge - Mobile only */}
        <div className="sm:hidden px-4 pb-3">
          <Badge className={cn("text-xs", getStatusColor(lead.status))}>
            {getStatusLabel(lead.status)}
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Problem Card */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Problema:</p>
          <p className="text-sm">{lead.problem}</p>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.is_from_maestro ? "justify-start" : "justify-end"
            } mb-4`}
          >
            <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${message.is_from_maestro ? "" : "flex-row-reverse"}`}>
              {/* Avatar - Solo para maestro */}
              {message.is_from_maestro && (
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
                  <Avatar className="relative h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-gold/50">
                    <AvatarImage src={maestroAvatar} alt="Maestro" />
                    <AvatarFallback className="bg-gradient-to-br from-gold to-amber-600 text-white text-xs font-bold">
                      ME
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 shadow-md ${
                  message.is_from_maestro
                    ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white shadow-gold/30"
                    : "bg-muted/80 backdrop-blur-sm"
                }`}
              >
                {message.is_from_maestro && (
                  <p className="text-xs font-bold mb-1 opacity-90">
                    Maestro Espiritual ✨
                  </p>
                )}
                <p className="text-sm leading-relaxed break-words">{message.text}</p>
                <p className={`text-xs mt-1.5 ${message.is_from_maestro ? "opacity-80" : "opacity-70"}`}>
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

      {/* Input Area - CON BOTONES MULTIMEDIA */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-md p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 max-w-5xl mx-auto">
          {/* Multimedia Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted/50 text-gold hover:text-gold/80"
              title="Adjuntar imagen"
            >
              <ImageIcon className="h-5 w-5 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted/50 text-gold hover:text-gold/80"
              title="Enviar audio"
            >
              <Mic className="h-5 w-5 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Message Input */}
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-muted/50 border-border/50 focus:ring-gold/50"
            disabled={isSending}
          />

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-to-r from-gold to-amber-600 hover:from-gold/90 hover:to-amber-600/90 text-white shadow-lg shadow-gold/30 h-9 w-9 sm:h-10 sm:w-10 p-0"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}