import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Upload, Mic, MicOff, User } from "lucide-react";

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
    if (!leadId) return;

    console.log("🔄 [USUARIO] Iniciando polling de mensajes cada 2 segundos");

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ [USUARIO] Error cargando mensajes:", error);
        return;
      }

      if (data) {
        console.log(`📨 [USUARIO] Mensajes cargados: ${data.length}`);
        setMessages(data);
      }
    };

    // Carga inicial
    loadMessages();

    // Polling cada 2 segundos
    const interval = setInterval(() => {
      console.log("⏰ [USUARIO] Ejecutando polling...");
      loadMessages();
    }, 2000);

    return () => {
      console.log("🛑 [USUARIO] Deteniendo polling de mensajes");
      clearInterval(interval);
    };
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
    console.log("📎 [USUARIO] Subiendo archivo:", file.name);

    const fileExt = file.name.split(".").pop();
    const fileName = `${leadId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(fileName, file);

    if (uploadError) {
      console.error("❌ [USUARIO] Error subiendo archivo:", uploadError);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("chat-media").getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: file.type.startsWith("image/") ? "" : file.name,
      is_from_maestro: false,
      media_url: data.publicUrl,
      media_type: file.type.startsWith("image/") ? "image" : "file",
    });

    if (insertError) {
      console.error("❌ [USUARIO] Error guardando mensaje multimedia:", insertError);
    } else {
      console.log("✅ [USUARIO] Archivo enviado exitosamente");
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/20 bg-background/40 backdrop-blur-sm">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-foreground">Maestro Espiritual</h2>
          <p className="text-xs text-primary">En línea</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.is_from_maestro ? "justify-start" : "justify-end"}`}
          >
            {msg.is_from_maestro && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.is_from_maestro
                  ? "bg-card text-card-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {msg.media_type === "image" && msg.media_url && (
                <img
                  src={msg.media_url}
                  alt="Imagen"
                  className="rounded-lg mb-2 max-w-full"
                />
              )}
              {msg.media_type === "audio" && msg.media_url && (
                <audio controls className="mb-2 max-w-full">
                  <source src={msg.media_url} type="audio/webm" />
                </audio>
              )}
              {msg.text && <p className="text-sm break-words">{msg.text}</p>}
              <p className="text-[10px] mt-1 opacity-70">{formatTime(msg.created_at)}</p>
            </div>
            {!msg.is_from_maestro && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-accent/20 text-accent text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 border-t border-border/20 bg-background/40 backdrop-blur-sm"
      >
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-primary hover:text-primary/80"
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            className={recording ? "text-destructive" : "text-primary hover:text-primary/80"}
          >
            {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={sending || uploading}
            className="flex-1 bg-background border-border"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || uploading || !newMessage.trim()}
            className="bg-primary hover:bg-primary/80"
          >
            {sending ? (
              <Sparkles className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}