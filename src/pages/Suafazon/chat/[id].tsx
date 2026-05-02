import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Upload,
  Mic,
  Star,
  Phone,
  User,
} from "lucide-react";

type Message = {
  id: string;
  lead_id: string;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  is_from_maestro: boolean;
  created_at: string;
};

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  problem: string;
  classification: string | null;
  is_favorite: boolean;
  created_at: string;
  cards_selected: string[];
  answers: any;
  country_code: string;
  last_interaction_at: string;
};

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Cargar datos del lead
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadLead = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading lead:", error);
        return;
      }

      if (data) {
        setLead(data);
      }
    };

    loadLead();
  }, [id]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      if (data) {
        setMessages(data);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      lead_id: lead.id,
      text: messageText,
      is_from_maestro: true,
    });

    if (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lead) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${lead.id}/${Date.now()}.${fileExt}`;
      
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
      await supabase.from("messages").insert({
        lead_id: lead.id,
        media_url: publicUrl,
        media_type: mediaType,
        is_from_maestro: true,
      });
    } catch (err) {
      console.error("Error:", err);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAudioRecord = async (blob: Blob) => {
    if (!lead) return;

    setUploading(true);

    try {
      const fileName = `${lead.id}/${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from("chat-media")
        .upload(fileName, blob);

      if (error) {
        console.error("Error uploading audio:", error);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      await supabase.from("messages").insert({
        lead_id: lead.id,
        media_url: publicUrl,
        media_type: "audio",
        is_from_maestro: true,
      });
    } catch (err) {
      console.error("Error:", err);
    }

    setUploading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        handleAudioRecord(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current = null;
    }
  };

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/Suafazon/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-accent/20 text-accent">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{lead.name}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {lead.whatsapp}
          </p>
        </div>
        {lead.is_favorite && <Star className="h-5 w-5 fill-primary text-primary" />}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.is_from_maestro ? "justify-end" : "justify-start"}`}
          >
            {!msg.is_from_maestro && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-accent/20 text-accent text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.is_from_maestro
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground"
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
            {msg.is_from_maestro && (
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4">
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
          >
            <Upload className="h-5 w-5" />
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
          >
            <Mic className={`h-5 w-5 ${recording ? "text-destructive animate-pulse" : ""}`} />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-background border-border"
          />
          
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}