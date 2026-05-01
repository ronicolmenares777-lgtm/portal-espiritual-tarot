import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Mic, Loader2 } from "lucide-react";

type Message = Tables<"messages">;

const maestroAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop";

interface ChatMaestroProps {
  leadId: string;
  leadName: string;
}

export function ChatMaestro({ leadId, leadName }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      }
    };

    fetchMessages();
  }, [leadId]);

  // Suscripción Realtime - SIMPLIFICADA
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
        }
      )
      .subscribe((status) => {
        console.log("🔔 [USER] Estado realtime:", status);
      });

    return () => {
      console.log("🔌 [USER] Limpiando suscripción");
      channel.unsubscribe();
    };
  }, [leadId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      lead_id: leadId,
      text: newMessage.trim(),
      is_from_maestro: false,
      media_type: null,
      media_url: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
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

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${leadId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      await supabase.from("messages").insert({
        lead_id: leadId,
        text: null,
        is_from_maestro: false,
        media_type: "image",
        media_url: data.publicUrl,
      });
    } catch (error) {
      console.error("❌ Error subiendo imagen:", error);
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
      console.error("❌ Error grabando audio:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true);

    try {
      const fileName = `${leadId}-${Date.now()}.webm`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      await supabase.from("messages").insert({
        lead_id: leadId,
        text: null,
        is_from_maestro: false,
        media_type: "audio",
        media_url: data.publicUrl,
      });
    } catch (error) {
      console.error("❌ Error subiendo audio:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gold/20 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
            <img
              src={maestroAvatar}
              alt="Maestro"
              className="relative w-12 h-12 rounded-full ring-2 ring-gold/50 shadow-lg"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
          </div>
          <div>
            <h2 className="text-cream font-semibold">Maestro Espiritual</h2>
            <p className="text-green-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              En línea
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.is_from_maestro ? "justify-start" : "justify-end"} gap-3`}
          >
            {message.is_from_maestro && (
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
                <img
                  src={maestroAvatar}
                  alt="Maestro"
                  className="relative w-10 h-10 rounded-full ring-2 ring-gold/50 shadow-lg"
                />
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                message.is_from_maestro
                  ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white"
                  : "bg-white/90 text-gray-900"
              }`}
            >
              {!message.is_from_maestro && (
                <p className="text-xs font-semibold mb-1 text-gray-700">{leadName}</p>
              )}
              {message.is_from_maestro && (
                <p className="text-xs font-bold mb-1 opacity-90">Maestro Espiritual ✨</p>
              )}

              {message.media_type === "image" && message.media_url && (
                <img
                  src={message.media_url}
                  alt="Imagen"
                  className="rounded-lg max-w-full mb-2"
                />
              )}

              {message.media_type === "audio" && message.media_url && (
                <audio controls className="w-full mb-2">
                  <source src={message.media_url} type="audio/webm" />
                </audio>
              )}

              {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}

              <p className={`text-xs mt-1.5 ${message.is_from_maestro ? "opacity-80" : "text-gray-600"}`}>
                {new Date(message.created_at).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gold/20 bg-gray-900/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="user-image-upload"
          />
          <label htmlFor="user-image-upload">
            <Button
              variant="ghost"
              size="icon"
              className="text-gold hover:text-amber-400"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
              </span>
            </Button>
          </label>

          <Button
            variant="ghost"
            size="icon"
            className={`text-gold hover:text-amber-400 ${isRecording ? "bg-red-500/20" : ""}`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            disabled={isUploading}
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-800/50 border-gold/20 text-cream placeholder:text-cream/50"
            disabled={isUploading}
          />

          <Button
            onClick={sendMessage}
            size="icon"
            className="bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-gold"
            disabled={isUploading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}