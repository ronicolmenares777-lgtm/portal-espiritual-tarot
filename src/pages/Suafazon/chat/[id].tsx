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
} from "lucide-react";
import Link from "next/link";
import type { Lead, Message } from "@/types/admin";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: string } | null>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Scroll automático hacia abajo
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
        // Fetch lead
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (leadError) throw leadError;
        setLead(leadData as Lead);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("lead_id", id)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Suscripción a nuevos mensajes con timestamp único para evitar colisión
    const channelName = `messages-${id}-${Date.now()}`;
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
        .insert([
          {
            lead_id: id,
            text: inputMessage,
            is_from_maestro: true,
          },
        ])
        .select()
        .single();

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
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            lead_id: id,
            text: message,
            is_from_maestro: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error enviando respuesta rápida:", error);
      }
    } catch (error) {
      console.error("❌ Error en handleQuickReply:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setMediaPreview({ url: objectUrl, type: "image" });
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setMediaPreview({ url: objectUrl, type: "video" });
    }
  };

  const handleMediaSend = async () => {
    if (!mediaPreview || !lead) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            lead_id: lead.id,
            text: mediaPreview.type === "image" ? "[Imagen adjunta]" : "[Video adjunto]",
            is_from_maestro: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Error enviando media:", error);
        return;
      }

      setMediaPreview(null);
    } catch (error) {
      console.error("❌ Error en handleMediaSend:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/Suafazon/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar>
              <AvatarFallback>
                {lead.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{lead.name}</h2>
              <p className="text-sm text-muted-foreground">
                {lead.whatsapp}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Lead Info Card */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">
                    Problema:
                  </p>
                  <p className="text-sm">{lead.problem}</p>
                </div>
                <Badge variant={lead.status === "nuevo" ? "secondary" : "default"}>
                  {lead.status}
                </Badge>
              </div>
              {lead.cards_selected && lead.cards_selected.length > 0 && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground">
                    Cartas Seleccionadas:
                  </p>
                  <p className="text-sm">{lead.cards_selected.join(", ")}</p>
                </div>
              )}
              {lead.answers && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-semibold text-muted-foreground">
                      Respuestas:
                    </p>
                    <p>{JSON.stringify(lead.answers)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.is_from_maestro ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex gap-3">
                {!message.is_from_maestro && profileData?.avatar_url && (
                  <img
                    src={profileData.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                    message.is_from_maestro
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.is_from_maestro && profileData?.avatar_url && (
                  <img
                    src={profileData.avatar_url}
                    alt="Avatar maestro"
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Replies */}
      <div className="border-t p-2 bg-card">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply(reply)}
              className="whitespace-nowrap flex-shrink-0"
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div className="border-t p-4 bg-card">
          <div className="relative max-w-xs mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 z-10"
              onClick={() => setMediaPreview(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {mediaPreview.type === "image" ? (
              <img
                src={mediaPreview.url}
                alt="Preview"
                className="rounded-lg max-w-full h-auto"
              />
            ) : (
              <div className="relative">
                <video
                  src={mediaPreview.url}
                  className="rounded-lg max-w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-80" />
                </div>
              </div>
            )}
            <Button
              onClick={handleMediaSend}
              className="w-full mt-2"
            >
              Enviar
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button variant="ghost" size="icon" asChild>
              <span>
                <ImageIcon className="h-5 w-5" />
              </span>
            </Button>
          </label>
          <label>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />
            <Button variant="ghost" size="icon" asChild>
              <span>
                <Paperclip className="h-5 w-5" />
              </span>
            </Button>
          </label>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}