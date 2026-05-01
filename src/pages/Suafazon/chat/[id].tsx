import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Mic, ArrowLeft, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Message = Tables<"messages">;
type Lead = Tables<"leads">;

export default function AdminChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
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

  // Cargar lead
  useEffect(() => {
    if (!id) return;

    const fetchLead = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (data) setLead(data);
    };

    fetchLead();
  }, [id]);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();
  }, [id]);

  // Suscripción Realtime - SIMPLIFICADA
  useEffect(() => {
    if (!id) return;

    console.log("🔌 [ADMIN] Configurando realtime para chat:", id);

    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("📨 [ADMIN] Nuevo mensaje:", payload.new);
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
        console.log("🔔 [ADMIN] Estado realtime:", status);
      });

    return () => {
      console.log("🔌 [ADMIN] Limpiando suscripción");
      channel.unsubscribe();
    };
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      lead_id: lead.id,
      text: newMessage.trim(),
      is_from_maestro: true,
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

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${lead.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      await supabase.from("messages").insert({
        lead_id: lead.id,
        text: null,
        is_from_maestro: true,
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
    if (!lead) return;

    setIsUploading(true);

    try {
      const fileName = `${lead.id}-${Date.now()}.webm`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      await supabase.from("messages").insert({
        lead_id: lead.id,
        text: null,
        is_from_maestro: true,
        media_type: "audio",
        media_url: data.publicUrl,
      });
    } catch (error) {
      console.error("❌ Error subiendo audio:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!lead) return;

    await supabase
      .from("leads")
      .update({ is_favorite: !lead.is_favorite })
      .eq("id", lead.id);

    setLead({ ...lead, is_favorite: !lead.is_favorite });
  };

  const updateClassification = async (classification: "hot" | "warm" | "cold") => {
    if (!lead) return;

    await supabase.from("leads").update({ classification }).eq("id", lead.id);

    setLead({ ...lead, classification });
  };

  if (!lead) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-deep-purple via-purple-900 to-deep-purple">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-deep-purple via-purple-900 to-deep-purple">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-deep-purple to-purple-900 border-b border-gold/20 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/Suafazon/dashboard")}
            className="text-cream hover:text-gold"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-deep-purple" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-cream font-semibold truncate">{lead.name}</h2>
              <p className="text-gold/70 text-xs truncate">
                {lead.country_code} {lead.whatsapp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={lead.classification || ""}
              onChange={(e) => updateClassification(e.target.value as any)}
              className="text-xs px-2 py-1 rounded bg-purple-800/50 text-cream border border-gold/20"
            >
              <option value="">Sin clasificar</option>
              <option value="hot">🔥 Hot</option>
              <option value="warm">⚡ Warm</option>
              <option value="cold">❄️ Cold</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={lead.is_favorite ? "text-red-500" : "text-cream/50"}
            >
              <Heart className={`h-5 w-5 ${lead.is_favorite ? "fill-current" : ""}`} />
            </Button>
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                M
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
                <p className="text-xs font-semibold mb-1 text-gray-700">{lead.name}</p>
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
      <div className="border-t border-gold/20 bg-deep-purple/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
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
            className="flex-1 bg-purple-900/50 border-gold/20 text-cream placeholder:text-cream/50"
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