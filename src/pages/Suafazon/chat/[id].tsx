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

export default function ChatAdmin() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Tables<"leads"> | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    console.log("🔄 Cargando lead:", id);

    const loadLead = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        console.log("✅ Lead cargado:", data.name);
        setLead(data);
      }
    };

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true });

      console.log("📨 Mensajes cargados:", data?.length || 0);
      if (error) console.error("❌ Error cargando mensajes:", error);

      if (data) {
        setMessages(data);
      }
    };

    loadLead();
    loadMessages();

    // Suscripción Realtime
    console.log("🔔 Configurando suscripción Realtime para lead:", id);

    const channel = supabase
      .channel(`chat-admin-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("✨ NUEVO MENSAJE RECIBIDO (Admin):", payload.new);
          const newMsg = payload.new as Tables<"messages">;
          setMessages((current) => {
            // Evitar duplicados
            const exists = current.some((m) => m.id === newMsg.id);
            if (exists) {
              console.log("⚠️ Mensaje duplicado, ignorando");
              return current;
            }
            console.log("✅ Agregando mensaje nuevo al estado");
            return [...current, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("🔄 MENSAJE ACTUALIZADO:", payload.new);
          const updatedMsg = payload.new as Tables<"messages">;
          setMessages((current) =>
            current.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado suscripción Realtime (Admin):", status);
      });

    return () => {
      console.log("🔌 Desconectando canal Realtime (Admin)");
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    console.log("📤 Enviando mensaje (Admin):", newMessage);
    setSending(true);

    const { data, error } = await supabase.from("messages").insert({
      lead_id: lead.id,
      text: newMessage,
      is_from_maestro: true,
    }).select();

    if (error) {
      console.error("❌ Error enviando mensaje:", error);
    } else {
      console.log("✅ Mensaje enviado exitosamente:", data);
    }

    setNewMessage("");
    setSending(false);
  };

  const handleClassificationChange = async (value: string) => {
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
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: !lead.is_favorite })
      .eq("id", lead.id);

    if (!error) {
      setLead({ ...lead, is_favorite: !lead.is_favorite });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lead) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${lead.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-media").getPublicUrl(filePath);

    const mediaType = file.type.startsWith("image/") ? "image" : "file";

    await supabase.from("messages").insert({
      lead_id: lead.id,
      text: file.name,
      is_from_maestro: true,
      media_type: mediaType,
      media_url: publicUrl,
    });

    setUploading(false);
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
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
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

    const fileName = `${Math.random()}.webm`;
    const filePath = `${lead.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(filePath, audioBlob);

    if (uploadError) {
      console.error("Error uploading audio:", uploadError);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-media").getPublicUrl(filePath);

    await supabase.from("messages").insert({
      lead_id: lead.id,
      text: "Nota de voz",
      is_from_maestro: true,
      media_type: "audio",
      media_url: publicUrl,
    });
  };

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/Suafazon/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback>{lead.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-foreground">{lead.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleFavorite}
            >
              <Star
                className={`h-4 w-4 ${
                  lead.is_favorite
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{lead.whatsapp}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={lead.classification || ""}
            onValueChange={handleClassificationChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Clasificar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">🔥 Caliente</SelectItem>
              <SelectItem value="warm">😊 Tibio</SelectItem>
              <SelectItem value="cold">❄️ Frío</SelectItem>
            </SelectContent>
          </Select>
          <Badge
            variant={lead.status === "cerrado" ? "default" : "secondary"}
            className="capitalize"
          >
            {lead.status}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.is_from_maestro ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.is_from_maestro
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.media_type === "image" && msg.media_url && (
                <img
                  src={msg.media_url}
                  alt="Shared"
                  className="rounded-lg max-w-full mb-2"
                />
              )}
              {msg.media_type === "audio" && msg.media_url && (
                <audio controls className="mb-2">
                  <source src={msg.media_url} type="audio/webm" />
                </audio>
              )}
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString("es-MX", {
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
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Sparkles className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={recording ? stopRecording : startRecording}
            className={recording ? "bg-red-500 text-white" : ""}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
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