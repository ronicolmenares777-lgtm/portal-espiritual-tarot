import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadStatus } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Star, ImageIcon, Mic, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface Message {
  id: string;
  lead_id: string;
  text: string;
  is_from_maestro: boolean;
  created_at: string;
}

export default function ChatAdmin() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
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
        }

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
        }
      } catch (error) {
        console.error("❌ Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Realtime subscription
    const channel = supabase
      .channel(`admin-messages-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("📨 [ADMIN] Nuevo mensaje:", payload);
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
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      lead_id: lead.id,
      text: newMessage.trim(),
      is_from_maestro: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          lead_id: lead.id,
          text: tempMessage.text,
          is_from_maestro: true,
        });

      if (error) {
        console.error("❌ Error:", error);
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      }
    } catch (error) {
      console.error("❌ Error:", error);
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
        console.error("❌ Error:", error);
        return;
      }

      setLead({ ...lead, status: newStatus as LeadStatus });
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ is_favorite: !lead.is_favorite })
        .eq("id", lead.id);

      if (error) {
        console.error("❌ Error:", error);
        return;
      }

      setLead({ ...lead, is_favorite: !lead.is_favorite });
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Cargando...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Lead no encontrado</p>
      </div>
    );
  }

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header - FIXED */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gold/10 via-amber-500/10 to-gold/10 border-b border-gold/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/Suafazon/dashboard")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white font-bold ring-2 ring-gold/50">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-lg text-foreground truncate">
                    {lead.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {lead.country_code} {lead.whatsapp}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Select value={lead.status} onValueChange={handleStatusChange}>
                <SelectTrigger
                  className={`w-[150px] border ${getStatusColor(lead.status)}`}
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

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                className={lead.is_favorite ? "text-gold" : ""}
              >
                {lead.is_favorite ? (
                  <Heart className="h-5 w-5 fill-gold" />
                ) : (
                  <Star className="h-5 w-5" />
                )}
              </Button>
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
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white font-bold ring-2 ring-gold/50">
                      M
                    </div>
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
                      {lead.name}
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
        <div className="max-w-4xl mx-auto px-4 py-4">
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