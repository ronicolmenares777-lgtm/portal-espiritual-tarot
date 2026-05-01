import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ImageIcon, Mic, Loader2, Check, CheckCheck } from "lucide-react";

type Message = Tables<"messages">;

interface ChatMaestroProps {
  leadId: string;
  leadName: string;
}

export function ChatMaestro({ leadId, leadName }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [maestroTyping, setMaestroTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar mensajes iniciales
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);

        // Marcar mensajes del maestro como leídos
        const unreadIds = data
          .filter((m) => m.is_from_maestro && !m.is_read)
          .map((m) => m.id);

        if (unreadIds.length > 0) {
          await supabase
            .from("messages")
            .update({ is_read: true })
            .in("id", unreadIds);
        }
      }
    };

    fetchMessages();
  }, [leadId]);

  // Suscripción Realtime
  useEffect(() => {
    console.log("🔌 [USER] Configurando realtime para chat:", leadId);

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
          console.log("📨 [USER] Nuevo mensaje:", payload.new);
          const newMsg = payload.new as Message;
          
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
          
          setTimeout(scrollToBottom, 100);

          // Marcar como leído si es del maestro
          if (newMsg.is_from_maestro) {
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
        const adminPresence = state[`admin-${leadId}`];
        setMaestroTyping(adminPresence?.[0]?.typing === true);
      })
      .subscribe((status) => {
        console.log("🔔 [USER] Estado realtime:", status);
      });

    return () => {
      console.log("🔌 [USER] Limpiando suscripción");
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
      channel.track({ typing: true, user: `user-${leadId}` });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const channel = supabase.channel(`chat-${leadId}`);
      channel.track({ typing: false, user: `user-${leadId}` });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      lead_id: leadId,
      text: newMessage.trim(),
      is_from_maestro: false,
      is_read: false,
      media_type: null,
      media_url: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setIsTyping(false);
    
    const channel = supabase.channel(`chat-${leadId}`);
    channel.track({ typing: false, user: `user-${leadId}` });
    
    setTimeout(scrollToBottom, 100);

    const { error } = await supabase
      .from("messages")
      .insert({
        lead_id: leadId,
        text: newMessage.trim(),
        is_from_maestro: false,
      });

    if (error) {
      console.error("❌ Error enviando:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        lead_id: leadId,
        text: null,
        media_type: "image",
        media_url: publicUrl,
        is_from_maestro: false,
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
        lead_id: leadId,
        text: null,
        media_type: "audio",
        media_url: publicUrl,
        is_from_maestro: false,
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("❌ Error subiendo audio:", error);
      alert("Error al subir audio");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-800 bg-gray-900 px-4 py-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            M
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-white">Maestro Espiritual</h2>
          <p className="text-sm text-green-500">En línea 🟢</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.is_from_maestro ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.is_from_maestro
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-gray-900"
              }`}
            >
              {!msg.is_from_maestro && (
                <p className="text-xs font-semibold mb-1">{leadName}</p>
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
                {!msg.is_from_maestro && (
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
        {maestroTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2">
              <p className="text-sm italic">Escribiendo...</p>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 bg-gray-900 p-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="user-image-upload"
            onChange={handleImageUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById("user-image-upload")?.click()}
            disabled={isUploading}
            className="text-white hover:bg-gray-800"
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
            className="text-white hover:bg-gray-800"
          >
            <Mic className={`h-5 w-5 ${isRecording ? "text-red-500" : ""}`} />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-800 text-white border-gray-700"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}