import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, LeadStatus } from "@/types/admin";
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
  Phone,
  ImageIcon,
  Mic,
  StopCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  lead_id: string;
  text?: string;
  media_type?: string;
  media_url?: string;
  is_from_maestro: boolean;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        console.error("❌ Error en loadData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Realtime subscription - mismo canal para admin y usuario
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
          console.log("📨 [ADMIN] Nuevo mensaje:", payload.new);
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

    try {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        lead_id: lead.id,
        text: newMessage.trim(),
        is_from_maestro: true,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMsg]);
      const messageText = newMessage.trim();
      setNewMessage("");

      const { error } = await supabase.from("messages").insert({
        lead_id: lead.id,
        text: messageText,
        is_from_maestro: true,
      });

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      }
    } catch (error) {
      console.error("❌ Error en sendMessage:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lead) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es muy grande. Máximo 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${lead.id}-${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Error subiendo imagen:", uploadError);
        alert("Error al subir la imagen");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("messages").insert({
        lead_id: lead.id,
        media_type: "image",
        media_url: publicUrl,
        is_from_maestro: true,
      });

      if (insertError) {
        console.error("❌ Error enviando imagen:", insertError);
        alert("Error al enviar la imagen");
      }
    } catch (error) {
      console.error("❌ Error en handleImageUpload:", error);
      alert("Error al procesar la imagen");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Error iniciando grabación:", error);
      alert("Error al acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!lead) return;

    setIsUploading(true);

    try {
      const fileName = `${lead.id}-${Date.now()}.webm`;
      const filePath = `audio/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, audioBlob, {
          contentType: "audio/webm",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Error subiendo audio:", uploadError);
        alert("Error al subir el audio");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("messages").insert({
        lead_id: lead.id,
        media_type: "audio",
        media_url: publicUrl,
        is_from_maestro: true,
      });

      if (insertError) {
        console.error("❌ Error enviando audio:", insertError);
        alert("Error al enviar el audio");
      }
    } catch (error) {
      console.error("❌ Error en uploadAudio:", error);
      alert("Error al procesar el audio");
    } finally {
      setIsUploading(false);
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
    } catch (error) {
      console.error("❌ Error en handleStatusChange:", error);
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
        console.error("❌ Error actualizando favorito:", error);
        return;
      }

      setLead({ ...lead, is_favorite: !lead.is_favorite });
    } catch (error) {
      console.error("❌ Error en toggleFavorite:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      nuevo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      enConversacion: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      clienteCaliente:
        "bg-orange-500/10 text-orange-500 border-orange-500/20",
      listo: "bg-green-500/10 text-green-500 border-green-500/20",
      cerrado: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      perdido: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || colors.nuevo;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Cargando chat...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent backdrop-blur-md border-b border-gold/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/Suafazon/dashboard")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white font-bold ring-2 ring-gold/30">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-foreground truncate">
                  {lead.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {lead.country_code} {lead.whatsapp}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger
                className={`w-auto gap-2 text-xs font-medium border ${getStatusColor(
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

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className="flex-shrink-0"
            >
              <Star
                className={`h-5 w-5 ${
                  lead.is_favorite
                    ? "fill-gold text-gold"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
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
                  {message.is_from_maestro && (
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white font-bold ring-2 ring-gold/30">
                        ✨
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 shadow-md ${
                      message.is_from_maestro
                        ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white shadow-gold/30"
                        : "bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm"
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

                    {message.media_type === "image" && message.media_url && (
                      <img
                        src={message.media_url}
                        alt="Imagen enviada"
                        className="rounded-lg max-w-full h-auto mb-2 cursor-pointer"
                        onClick={() => window.open(message.media_url, "_blank")}
                      />
                    )}

                    {message.media_type === "audio" && message.media_url && (
                      <audio controls className="max-w-full">
                        <source src={message.media_url} type="audio/webm" />
                        Tu navegador no soporta audio.
                      </audio>
                    )}

                    {message.text && (
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    )}

                    <p
                      className={`text-xs mt-1.5 ${
                        message.is_from_maestro
                          ? "opacity-80"
                          : "text-gray-600"
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
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent backdrop-blur-sm border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-shrink-0"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
            className={`flex-shrink-0 ${
              isRecording ? "text-red-500 animate-pulse" : ""
            }`}
          >
            {isRecording ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={isUploading}
          />

          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isUploading}
            className="flex-shrink-0 bg-gradient-to-r from-gold to-amber-600 hover:from-gold/90 hover:to-amber-600/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}