import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ImageIcon, Mic, StopCircle, Loader2 } from "lucide-react";

interface Message {
  id: string;
  lead_id: string;
  text?: string;
  media_type?: string;
  media_url?: string;
  is_from_maestro: boolean;
  created_at: string;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maestroAvatar =
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=100&h=100&fit=crop";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error cargando mensajes:", error);
        return;
      }

      if (data) {
        setMessages(data as Message[]);
      }
    };

    loadMessages();

    // Realtime subscription - mismo canal que admin
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
            if (prev.some((m) => m.id === newMsg.id)) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        lead_id: leadId,
        text: newMessage.trim(),
        is_from_maestro: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMsg]);
      const messageText = newMessage.trim();
      setNewMessage("");

      const { error } = await supabase.from("messages").insert({
        lead_id: leadId,
        text: messageText,
        is_from_maestro: false,
      });

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      }
    } catch (error) {
      console.error("❌ Error en sendMessage:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es muy grande. Máximo 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${leadId}-${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Error subiendo imagen:", uploadError);
        alert("Error al subir la imagen");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("messages").insert({
        lead_id: leadId,
        media_type: "image",
        media_url: publicUrl,
        is_from_maestro: false,
      });

      if (insertError) {
        console.error("❌ Error enviando imagen:", insertError);
        alert("Error al enviar la imagen");
      }
    } catch (error) {
      console.error("❌ Error en handleImageUpload:", error);
      alert("Error al procesar la imagen");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Error iniciando grabación:", error);
      alert("Error al acceder al micrófono. Verifica los permisos.");
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
      const filePath = `audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, audioBlob, {
          contentType: "audio/webm",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Error subiendo audio:", uploadError);
        alert("Error al subir el audio");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("messages").insert({
        lead_id: leadId,
        media_type: "audio",
        media_url: publicUrl,
        is_from_maestro: false,
      });

      if (insertError) {
        console.error("❌ Error enviando audio:", insertError);
        alert("Error al enviar el audio");
      }
    } catch (error) {
      console.error("❌ Error en uploadAudio:", error);
      alert("Error al procesar el audio");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background flex flex-col">
      {/* Header - Diseño más profesional */}
      <div className="sticky top-0 z-10">
        <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent backdrop-blur-xl border-b border-gold/20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/30 rounded-full blur-lg animate-pulse" />
                <img
                  src={maestroAvatar}
                  alt="Maestro"
                  className="relative w-14 h-14 rounded-full ring-2 ring-gold/50 shadow-2xl shadow-gold/30"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-background shadow-lg" />
              </div>
              <div className="text-center">
                <h2 className="font-bold text-foreground text-xl">
                  Maestro Espiritual
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-xs text-emerald-500 font-semibold">
                    En línea · Disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.is_from_maestro ? "justify-start" : "justify-end"
              } mb-4`}
            >
              <div
                className={`flex gap-3 max-w-[75%] ${
                  message.is_from_maestro ? "" : "flex-row-reverse"
                }`}
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
                  className={`rounded-2xl px-4 py-3 shadow-md ${
                    message.is_from_maestro
                      ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white shadow-gold/30"
                      : "bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg"
                  }`}
                >
                  {!message.is_from_maestro && (
                    <p className="text-xs font-semibold mb-1 text-gray-700">
                      {leadName}
                    </p>
                  )}
                  {message.is_from_maestro && (
                    <p className="text-xs font-bold mb-1 opacity-90">
                      Maestro Espiritual ✨
                    </p>
                  )}

                  {message.media_type === "image" && message.media_url && (
                    <img
                      src={message.media_url}
                      alt="Imagen enviada"
                      className="rounded-lg max-w-full h-auto mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.media_url, "_blank")}
                    />
                  )}

                  {message.media_type === "audio" && message.media_url && (
                    <audio controls className="max-w-full">
                      <source src={message.media_url} type="audio/webm" />
                      Tu navegador no soporta audio.
                    </audio>
                  )}

                  {message.text && (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}

                  <p
                    className={`text-xs mt-1.5 ${
                      message.is_from_maestro ? "opacity-80" : "text-gray-600"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0">
        <div className="bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm border-t border-border/50">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-shrink-0 hover:bg-gold/10 hover:text-gold transition-colors"
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
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploading}
                className={`flex-shrink-0 transition-colors ${
                  isRecording
                    ? "text-red-500 animate-pulse hover:bg-red-500/10"
                    : "hover:bg-gold/10 hover:text-gold"
                }`}
              >
                {isRecording ? (
                  <StopCircle className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-white/50 backdrop-blur-sm border-gold/20 focus:border-gold/40 focus:ring-gold/20"
                disabled={isUploading}
              />

              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isUploading}
                className="flex-shrink-0 bg-gradient-to-r from-gold to-amber-600 hover:from-gold/90 hover:to-amber-600/90 shadow-lg shadow-gold/30 transition-all hover:shadow-xl hover:shadow-gold/40"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}