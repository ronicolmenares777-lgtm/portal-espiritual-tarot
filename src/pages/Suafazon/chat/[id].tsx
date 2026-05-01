import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, ImageIcon, Mic, Loader2, Star, Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Lead = Tables<"leads">;
type Message = Tables<"messages">;

export default function AdminChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const leadId = typeof id === "string" ? id : "";
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
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
    if (!lead) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }
      setLoading(false);
    };

    loadMessages();

    // Suscripción en tiempo real para mensajes
    const channel = supabase
      .channel(`messages:${lead.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${lead.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Tables<"messages">;
          setMessages((prev) => {
            // Evitar duplicados
            if (prev.some(m => m.id === newMsg.id)) {
              return prev;
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
          filter: `lead_id=eq.${lead.id}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Tables<"messages">;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lead]);

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

    setUploading(true);

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
      setUploading(false);
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
      setRecording(true);
    } catch (error) {
      console.error("❌ Error grabando:", error);
      alert("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    if (!lead) return;

    setUploading(true);

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
      setUploading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!lead) return;

    const newFavoriteStatus = !lead.is_favorite;

    setLead({ ...lead, is_favorite: newFavoriteStatus });

    await supabase
      .from("leads")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", lead.id);
  };

  const updateClassification = async (value: string) => {
    if (!lead) return;

    setLead({ ...lead, classification: value });

    await supabase
      .from("leads")
      .update({ classification: value })
      .eq("id", lead.id);
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
            value={lead.classification || "nuevo"}
            onValueChange={updateClassification}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Clasificar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nuevo">🆕 Nuevo</SelectItem>
              <SelectItem value="en_chat">💬 En Chat</SelectItem>
              <SelectItem value="caliente">🔥 Caliente</SelectItem>
              <SelectItem value="listo">✅ Listo</SelectItem>
              <SelectItem value="cerrado">🔒 Cerrado</SelectItem>
              <SelectItem value="perdido">❌ Perdido</SelectItem>
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
            disabled={uploading}
          >
            {uploading ? (
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
            disabled={uploading}
          >
            <Mic className={`h-5 w-5 ${recording ? "text-red-500" : ""}`} />
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