import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  Smile,
  X,
  Play,
  Star,
  StarOff,
} from "lucide-react";
import Link from "next/link";
import type { Lead, Message } from "@/types/admin";
import { motion } from "framer-motion";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchData = async () => {
      try {
        console.log("🔍 Cargando datos para lead:", id);

        // Fetch lead
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (leadError) throw leadError;
        console.log("✅ Lead cargado:", leadData);
        setLead(leadData as Lead);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("lead_id", id)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;
        console.log("✅ Mensajes cargados:", messagesData?.length || 0);
        setMessages(messagesData || []);

        // Fetch profile data for avatar
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .limit(1)
          .single();
        
        if (profiles) {
          setProfileData(profiles);
        }
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Suscripción a nuevos mensajes
    const channelName = `admin-messages-${id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("🔔 Nuevo mensaje recibido en admin:", payload.new);
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !id || typeof id !== 'string') return;

    console.log("📤 Admin enviando mensaje...");

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          lead_id: id,
          text: inputMessage,
          is_from_maestro: true,
        })
        .select();

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        return;
      }

      console.log("✅ Mensaje del admin enviado:", data);
      setInputMessage("");
    } catch (error) {
      console.error("❌ Error en handleSendMessage:", error);
    }
  };

  const handleQuickReply = async (message: string) => {
    if (!id || typeof id !== 'string') return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          lead_id: id,
          text: message,
          is_from_maestro: true,
        })
        .select();

      if (error) {
        console.error("❌ Error enviando respuesta rápida:", error);
      }
    } catch (error) {
      console.error("❌ Error en handleQuickReply:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", lead.id);

      if (error) {
        console.error("❌ Error actualizando estado:", error);
        return;
      }

      setLead({ ...lead, status: newStatus });
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
      console.log("✅ Favorito actualizado");
    } catch (error) {
      console.error("❌ Error en handleToggleFavorite:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Lead no encontrado</p>
          <Button asChild>
            <Link href="/Suafazon/dashboard">Volver al Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const quickReplies = [
    "Gracias por tu consulta, ¿en qué puedo ayudarte?",
    "Entiendo tu situación, déjame guiarte.",
    "¿Puedes darme más detalles sobre tu problema?",
    "Estoy aquí para ayudarte en tu camino espiritual.",
  ];

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

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-card via-card/95 to-card backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/Suafazon/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar className="ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {lead.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">{lead.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className="h-6 w-6"
                >
                  {lead.is_favorite ? (
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ) : (
                    <StarOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {lead.country_code} {lead.whatsapp}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className={`w-[160px] border ${getStatusColor(lead.status)}`}>
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
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background to-muted/20">
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Lead Info Card */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">
                    Problema:
                  </p>
                  <p className="text-sm">{lead.problem}</p>
                </div>
              </div>
              {lead.cards_selected && lead.cards_selected.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">
                    Cartas Seleccionadas:
                  </p>
                  <p className="text-sm">{lead.cards_selected.join(", ")}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Messages */}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.is_from_maestro ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`flex gap-3 max-w-[70%] ${message.is_from_maestro ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {message.is_from_maestro ? (
                  profileData?.avatar_url ? (
                    <img
                      src={profileData.avatar_url}
                      alt="Maestro"
                      className="w-10 h-10 rounded-full ring-2 ring-primary/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center ring-2 ring-gold/30 shadow-lg">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                  )
                ) : (
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-muted">
                      {lead.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-md ${
                    message.is_from_maestro
                      ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white"
                      : "bg-muted/80 backdrop-blur-sm"
                  }`}
                >
                  {message.is_from_maestro && (
                    <p className="text-xs font-semibold mb-1 opacity-90">
                      Maestro Espiritual
                    </p>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.is_from_maestro ? "opacity-80" : "opacity-70"}`}>
                    {new Date(message.created_at).toLocaleTimeString([], {
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
      </ScrollArea>

      {/* Quick Replies */}
      <div className="border-t p-2 bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply(reply)}
              className="whitespace-nowrap flex-shrink-0 hover:bg-primary/10"
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-card backdrop-blur-sm">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-background/50"
          />
          <Button onClick={handleSendMessage} size="icon" className="bg-gradient-to-br from-gold to-amber-600 hover:from-amber-600 hover:to-gold">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}