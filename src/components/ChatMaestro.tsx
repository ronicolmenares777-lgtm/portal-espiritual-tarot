import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Upload, Mic, MicOff, User } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMaestroProps {
  leadId: string;
}

export function ChatMaestro({ leadId }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!leadId || typeof leadId !== "string") return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);

    return () => clearInterval(interval);
  }, [leadId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    console.log("📤 [USUARIO] Enviando mensaje");

    const { error } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: messageText,
      is_from_maestro: false,
    });

    if (error) {
      console.error("❌ [USUARIO] Error enviando mensaje:", error);
      setNewMessage(messageText);
    } else {
      console.log("✅ [USUARIO] Mensaje enviado exitosamente");
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !leadId) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${leadId}/${Date.now()}.${fileExt}`;
      
      // Intentar subir directamente
      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        alert("Error al subir archivo. Por favor verifica las políticas del bucket en Supabase.");
        setUploading(false);
        return;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith("image/") ? "image" : "audio";

      // Insertar mensaje en la base de datos
      const { error: dbError } = await supabase.from("messages").insert({
        lead_id: leadId,
        media_url: publicUrl,
        media_type: mediaType,
        is_from_maestro: false,
      });

      if (dbError) {
        console.error("Error insertando mensaje:", dbError);
      }
    } catch (err) {
      console.error("Error:", err);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      console.log("🎤 [USUARIO] Iniciando grabación de audio");
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
      console.error("❌ [USUARIO] Error iniciando grabación:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      console.log("🛑 [USUARIO] Deteniendo grabación");
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!leadId) return;

    setUploading(true);
    console.log("🎤 [USUARIO] Subiendo audio");

    const fileName = `${leadId}/${Date.now()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(fileName, audioBlob);

    if (uploadError) {
      console.error("❌ [USUARIO] Error subiendo audio:", uploadError);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("chat-media").getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: "Audio",
      is_from_maestro: false,
      media_url: data.publicUrl,
      media_type: "audio",
    });

    if (insertError) {
      console.error("❌ [USUARIO] Error guardando mensaje de audio:", insertError);
    } else {
      console.log("✅ [USUARIO] Audio enviado exitosamente");
    }

    setUploading(false);
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    if (!leadId) return;

    setUploading(true);
    console.log("📤 [AUDIO] Procesando audio...");

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log("✅ [AUDIO] Audio convertido a base64");

        // Guardar con prefijo [AUDIO]
        const messageContent = `[AUDIO]${base64String}`;

        const { data, error: dbError } = await supabase.from("messages").insert({
          lead_id: leadId,
          text: messageContent,
          is_from_maestro: false,
        }).select();

        if (dbError) {
          console.error("❌ [AUDIO] Error insertando mensaje:", dbError);
          alert(`Error al enviar audio: ${dbError.message}`);
        } else {
          console.log("✅ [AUDIO] Audio enviado exitosamente");
        }

        setUploading(false);
      };

      reader.onerror = () => {
        console.error("❌ [AUDIO] Error leyendo blob");
        setUploading(false);
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error("❌ [AUDIO] Error general:", err);
      setUploading(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-3 shadow-sm">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">Maestro Espiritual</h2>
          <p className="text-xs text-muted-foreground">En línea</p>
        </div>
        <motion.a
          href="https://wa.me/message/XH42ORU47RJCF1"
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>

      {/* Área de mensajes con scroll */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.is_from_maestro ? "justify-end" : "justify-start"}`}
          >
            {!msg.is_from_maestro && (
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                <AvatarFallback className="bg-accent/20 text-accent text-xs">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                msg.is_from_maestro
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground border border-border"
              }`}
            >
              {msg.media_type === "image" && msg.media_url && (
                <img
                  src={msg.media_url}
                  alt="Imagen"
                  className="rounded-lg mb-2 max-w-full h-auto"
                  loading="lazy"
                />
              )}
              {msg.media_type === "audio" && msg.media_url && (
                <audio controls className="mb-2 w-full max-w-xs">
                  <source src={msg.media_url} type="audio/webm" />
                </audio>
              )}
              {msg.text && <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>}
              <p className="text-[10px] mt-1 opacity-70">{formatTime(msg.created_at)}</p>
            </div>
            {msg.is_from_maestro && (
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input área fija en la parte inferior */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage();
      }} className="sticky bottom-0 bg-card border-t border-border p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          >
            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={uploading}
            className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          >
            <Mic className={`h-4 w-4 sm:h-5 sm:w-5 ${recording ? "text-destructive animate-pulse" : ""}`} />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 text-sm sm:text-base"
            disabled={sending || uploading}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}