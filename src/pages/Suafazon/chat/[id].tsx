import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Upload,
  Mic,
  Star,
  Phone,
} from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Tables<"leads"> | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar lead
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadLead = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setLead(data);
      }
    };

    loadLead();
  }, [id]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!lead) return;

    console.log("🔄 Iniciando polling de mensajes cada 2 segundos");

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error cargando mensajes:", error);
        return;
      }

      if (data) {
        setMessages(data);
      }
      setLoading(false);
    };

    // Carga inicial
    loadMessages();

    // Polling cada 2 segundos
    const interval = setInterval(loadMessages, 2000);

    return () => {
      console.log("🛑 Deteniendo polling de mensajes");
      clearInterval(interval);
    };
  }, [lead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    console.log("📤 Enviando mensaje del maestro");

    const { error } = await supabase.from("messages").insert({
      lead_id: lead.id,
      text: messageText,
      is_from_maestro: true,
    });

    if (error) {
      console.error("❌ Error enviando mensaje:", error);
      setNewMessage(messageText);
    } else {
      console.log("✅ Mensaje enviado exitosamente");
    }

    setSending(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !lead) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${lead.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("chat-media")
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-media").getPublicUrl(fileName);

    await supabase.from("messages").insert({
      lead_id: lead.id,
      text: file.type.startsWith("image/") ? "📷 Imagen" : "📎 Archivo",
      media_url: publicUrl,
      media_type: file.type.startsWith("image/") ? "image" : "file",
      is_from_maestro: true,
    });

    setUploading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!lead) return;

    setUploading(true);

    const fileName = `${lead.id}/${Date.now()}.webm`;

    const { data, error } = await supabase.storage
      .from("chat-media")
      .upload(fileName, audioBlob);

    if (error) {
      console.error("Error uploading audio:", error);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-media").getPublicUrl(fileName);

    await supabase.from("messages").insert({
      lead_id: lead.id,
      text: "🎤 Audio",
      media_url: publicUrl,
      media_type: "audio",
      is_from_maestro: true,
    });

    setUploading(false);
  };

  const handleClassificationChange = async (value: string) => {
    if (!lead) return;

    await supabase
      .from("leads")
      .update({ classification: value })
      .eq("id", lead.id);

    setLead({ ...lead, classification: value });
  };

  const toggleFavorite = async () => {
    if (!lead) return;

    const newFavoriteStatus = !lead.is_favorite;

    await supabase
      .from("leads")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", lead.id);

    setLead({ ...lead, is_favorite: newFavoriteStatus });
  };

  if (!lead || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/Suafazon/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {lead.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">{lead.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.whatsapp}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={lead.is_favorite ? "text-yellow-500" : ""}
          >
            <Star
              className="h-5 w-5"
              fill={lead.is_favorite ? "currentColor" : "none"}
            />
          </Button>
          <Select
            value={lead.classification || "sin_clasificar"}
            onValueChange={handleClassificationChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin_clasificar">Sin clasificar</SelectItem>
              <SelectItem value="caliente">🔥 Caliente</SelectItem>
              <SelectItem value="tibio">🌡️ Tibio</SelectItem>
              <SelectItem value="frio">❄️ Frío</SelectItem>
              <SelectItem value="convertido">✅ Convertido</SelectItem>
              <SelectItem value="perdido">❌ Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.is_from_maestro ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.is_from_maestro
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {!message.is_from_maestro && (
                <p className="text-xs font-medium mb-1">{lead.name}</p>
              )}
              {message.media_url && message.media_type === "image" && (
                <img
                  src={message.media_url}
                  alt="Imagen"
                  className="rounded-lg max-w-full mb-2"
                />
              )}
              {message.media_url && message.media_type === "audio" && (
                <audio controls className="mb-2">
                  <source src={message.media_url} type="audio/webm" />
                </audio>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2 items-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={uploading}
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={recording ? stopRecording : startRecording}
            className={recording ? "text-red-500" : ""}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-background border-border"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {sending ? (
              <Sparkles className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}