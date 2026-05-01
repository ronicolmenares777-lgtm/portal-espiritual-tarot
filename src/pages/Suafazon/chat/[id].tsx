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

const CLASSIFICATION_LABELS = {
  pending: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-500" },
  hot: { label: "Caliente", color: "bg-red-500/20 text-red-500" },
  warm: { label: "Tibio", color: "bg-orange-500/20 text-orange-500" },
  cold: { label: "Frío", color: "bg-blue-500/20 text-blue-500" },
  converted: { label: "Convertido", color: "bg-green-500/20 text-green-500" },
  lost: { label: "Perdido", color: "bg-gray-500/20 text-gray-500" },
};

export default function AdminChatPage() {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadData = async () => {
      const { data: leadData } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (leadData) {
        setLead(leadData);
      }

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
      }

      setLoading(false);
    };

    loadData();

    // Suscripción en tiempo real
    const channel = supabase
      .channel(`admin-chat:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          const newMsg = payload.new as Tables<"messages">;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
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
          filter: `lead_id=eq.${id}`,
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
  }, [id]);

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

  const handleToggleFavorite = async () => {
    if (!lead) return;

    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: !lead.is_favorite })
      .eq("id", lead.id);

    if (!error) {
      setLead({ ...lead, is_favorite: !lead.is_favorite });
    }
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

    const { error: messageError } = await supabase.from("messages").insert({
      lead_id: lead.id,
      text: file.type.startsWith("image/") ? "📷 Imagen" : "📎 Archivo",
      media_url: publicUrl,
      media_type: file.type.startsWith("image/") ? "image" : "file",
      is_from_maestro: true,
    });

    if (messageError) {
      console.error("Error sending message:", messageError);
    }

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

    setUploading(true);

    const fileName = `${Math.random()}.webm`;
    const filePath = `${lead.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(filePath, audioBlob);

    if (uploadError) {
      console.error("Error uploading audio:", uploadError);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-media").getPublicUrl(filePath);

    const { error: messageError } = await supabase.from("messages").insert({
      lead_id: lead.id,
      text: "🎤 Audio",
      media_url: publicUrl,
      media_type: "audio",
      is_from_maestro: true,
    });

    if (messageError) {
      console.error("Error sending message:", messageError);
    }

    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Lead no encontrado</p>
      </div>
    );
  }

  const classificationData =
    CLASSIFICATION_LABELS[lead.classification as keyof typeof CLASSIFICATION_LABELS] ||
    CLASSIFICATION_LABELS.pending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/Suafazon/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
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
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={lead.is_favorite ? "text-primary" : ""}
              >
                <Star
                  className="h-5 w-5"
                  fill={lead.is_favorite ? "currentColor" : "none"}
                />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={lead.classification || "pending"}
              onValueChange={handleClassificationChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLASSIFICATION_LABELS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${val.color}`} />
                      {val.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge className={classificationData.color}>
              {classificationData.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.is_from_maestro ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.is_from_maestro
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.media_url && (
                <div className="mb-2">
                  {message.media_type === "image" ? (
                    <img
                      src={message.media_url}
                      alt="Imagen"
                      className="rounded-lg max-w-full"
                    />
                  ) : message.media_type === "audio" ? (
                    <audio controls src={message.media_url} className="w-full" />
                  ) : (
                    <a
                      href={message.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Ver archivo
                    </a>
                  )}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString("es-ES", {
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
      <div className="border-t border-border p-4 bg-card">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={uploading}
          >
            <Upload className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={recording ? stopRecording : startRecording}
            className={recording ? "bg-red-500/20 text-red-500" : ""}
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-background border-border"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-primary hover:bg-primary/90"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}