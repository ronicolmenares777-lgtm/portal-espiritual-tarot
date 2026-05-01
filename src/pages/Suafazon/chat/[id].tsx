import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, ImageIcon, Mic, Loader2, Star, Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

type Lead = Tables<"leads">;
type Message = Tables<"messages">;

export default function AdminChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const leadId = typeof id === "string" ? id : "";
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar lead
  useEffect(() => {
    if (!leadId) return;

    const fetchLead = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (data) setLead(data);
    };

    fetchLead();
  }, [leadId]);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (!leadId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();
  }, [leadId]);

  // Suscripción Realtime - Mensajes
  useEffect(() => {
    if (!leadId) return;

    console.log("🔌 [ADMIN] Configurando realtime para chat:", leadId);

    const channel = supabase
      .channel(`chat-${leadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log("📨 [ADMIN] Nuevo mensaje:", payload.new);
          const newMsg = payload.new as Message;
          
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
          
          setTimeout(scrollToBottom, 100);

          // Marcar como leído si es del usuario
          if (!newMsg.is_from_maestro) {
            markAsRead(newMsg.id);
          }
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
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const userPresence = state[`user-${leadId}`];
        const presenceData = userPresence?.[0] as any;
        setUserTyping(presenceData?.typing === true);
      })
      .subscribe((status) => {
        console.log("🔔 [ADMIN] Estado realtime:", status);
      });

    return () => {
      console.log("🔌 [ADMIN] Limpiando suscripción");
      channel.unsubscribe();
    };
  }, [leadId]);

  // Marcar mensajes como leídos
  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);
  };

  // Enviar presencia de escritura
  const handleTyping = (text: string) => {
    setNewMessage(text);

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      const channel = supabase.channel(`chat-${leadId}`);
      channel.track({ typing: true, user: "admin" });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const channel = supabase.channel(`chat-${leadId}`);
      channel.track({ typing: false, user: "admin" });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      lead_id: lead.id,
      text: newMessage.trim(),
      is_from_maestro: true,
      is_read: false,
      media_type: null,
      media_url: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setIsTyping(false);
    
    const channel = supabase.channel(`chat-${leadId}`);
    channel.track({ typing: false, user: "admin" });
    
    setTimeout(scrollToBottom, 100);

    const { error } = await supabase
      .from("messages")
      .insert({
        lead_id: lead.id,
        text: newMessage.trim(),
        is_from_maestro: true,
      });

    if (error) {
      console.error("❌ Error enviando:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lead) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Imagen muy grande (máx 5MB)");
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      await supabase.from("messages").insert({
        lead_id: lead.id,
        text: null,
        media_type: "image",
        media_url: publicUrl,
        is_from_maestro: true,
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error);
      alert("Error al subir imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Error grabando:", error);
      alert("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    if (!lead) return;

    setIsUploading(true);

    try {
      const fileName = `audio-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      await supabase.from("messages").insert({
        lead_id: lead.id,
        text: null,
        media_type: "audio",
        media_url: publicUrl,
        is_from_maestro: true,
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("❌ Error subiendo audio:", error);
      alert("Error al subir audio");
    } finally {
      setIsUploading(false);
    }
  };

  const updateClassification = async (value: string) => {
    if (!lead) return;

    const { error } = await supabase
      .from("leads")
      .update({ classification: value })
      .eq("id", lead.id);

    if (!error) {
      setLead({ ...lead, classification: value });
    }
  };

  const toggleFavorite = async () => {
    if (!lead) return;

    const newFavoriteState = !lead.is_favorite;

    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: newFavoriteState })
      .eq("id", lead.id);

    if (!error) {
      setLead({ ...lead, is_favorite: newFavoriteState });
    }
  };

  if (!lead) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/Suafazon/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {lead.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{lead.name}</h2>
            <p className="text-sm text-muted-foreground">
              {lead.country_code} {lead.whatsapp}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={lead.classification || "Sin clasificar"}
            onValueChange={updateClassification}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sin clasificar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">🔥 Hot</SelectItem>
              <SelectItem value="warm">☀️ Warm</SelectItem>
              <SelectItem value="cold">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={lead.is_favorite ? "text-yellow-500" : "text-muted-foreground"}
          >
            <Star className={`h-5 w-5 ${lead.is_favorite ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.is_from_maestro ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.is_from_maestro
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-gray-900"
              }`}
            >
              {!msg.is_from_maestro && (
                <p className="text-xs font-semibold mb-1">{lead.name}</p>
              )}
              {msg.media_type === "image" && msg.media_url && (
                <img
                  src={msg.media_url}
                  alt="Imagen"
                  className="rounded-lg max-w-full"
                />
              )}
              {msg.media_type === "audio" && msg.media_url && (
                <audio controls src={msg.media_url} className="max-w-full" />
              )}
              {msg.text && <p>{msg.text}</p>}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.is_from_maestro && (
                  msg.is_read ? (
                    <CheckCheck className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Check className="h-4 w-4 opacity-70" />
                  )
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {userTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white text-gray-900 rounded-2xl px-4 py-2">
              <p className="text-sm italic">Escribiendo...</p>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload"
            onChange={handleImageUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={isUploading}
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
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            disabled={isUploading}
          >
            <Mic className={`h-5 w-5 ${isRecording ? "text-red-500" : ""}`} />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}