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
  User,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    console.log("📤 Enviando mensaje del admin");

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

    console.log("📤 [ADMIN] Intentando subir archivo:", file.name, file.type, file.size);
    setUploading(true);

    try {
      const fileName = `${lead.id}/${Date.now()}.${file.name.split(".").pop()}`;
      console.log("📂 [ADMIN] Nombre del archivo en storage:", fileName);
      console.log("🪣 [ADMIN] Bucket: chat-media");
      
      const { data, error } = await supabase.storage
        .from("chat-media")
        .upload(fileName, file);

      console.log("📊 [ADMIN] Resultado del upload:", { data, error });

      if (error) {
        console.error("❌ [ADMIN] Error subiendo archivo:", error);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      console.log("🔗 [ADMIN] URL pública:", publicUrl);

      const mediaType = file.type.startsWith("image/") ? "image" : "audio";
      console.log("🎨 [ADMIN] Tipo de media:", mediaType);

      const { error: dbError } = await supabase.from("messages").insert({
        lead_id: lead.id,
        media_url: publicUrl,
        media_type: mediaType,
        is_from_maestro: true,
      });

      if (dbError) {
        console.error("❌ [ADMIN] Error insertando mensaje:", dbError);
      } else {
        console.log("✅ [ADMIN] Mensaje multimedia enviado exitosamente");
      }
    } catch (err) {
      console.error("❌ [ADMIN] Error capturado:", err);
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2 items-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            ref={fileInputRef}
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
            onKeyPress={handleKeyPress}
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