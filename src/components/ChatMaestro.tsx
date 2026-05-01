import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ImageIcon, Mic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = Tables<"messages">;

interface ChatMaestroProps {
  leadId: string;
  leadName: string;
}

export function ChatMaestro({ leadId, leadName }: ChatMaestroProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maestroAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar mensajes y suscribirse a realtime
  useEffect(() => {
    if (!leadId) return;

    let mounted = true;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (mounted && data) setMessages(data);
      } catch (error) {
        console.error("❌ [USER] Error cargando mensajes:", error);
      }
    };

    loadMessages();

    // Suscripción realtime - MISMO CANAL QUE ADMIN
    console.log("📡 [USER] Configurando suscripción realtime para chat:", leadId);
    
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
          console.log("📨 [USER] Nuevo mensaje recibido:", payload.new);
          const newMsg = payload.new as Message;
          
          if (mounted) {
            setMessages((prev) => {
              if (prev.some(m => m.id === newMsg.id)) {
                console.log("⚠️ [USER] Mensaje duplicado ignorado");
                return prev;
              }
              console.log("✅ [USER] Mensaje agregado al estado");
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 [USER] Estado de suscripción:", status);
      });

    return () => {
      console.log("🔌 [USER] Limpiando suscripción");
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const tempMessage = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          lead_id: leadId,
          text: tempMessage,
          is_from_maestro: false,
        });

      if (error) throw error;
      console.log("✅ [USER] Mensaje enviado");
    } catch (error) {
      console.error("❌ [USER] Error enviando mensaje:", error);
      setNewMessage(tempMessage);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Solo se permiten imágenes",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen es muy grande (máximo 5MB)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${leadId}/${fileName}`;

      console.log("📤 [USER] Subiendo imagen:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(filePath);

      console.log("✅ [USER] Imagen subida:", publicUrl);

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          lead_id: leadId,
          text: null,
          media_type: "image",
          media_url: publicUrl,
          is_from_maestro: false,
        });

      if (messageError) throw messageError;

      toast({
        title: "Imagen enviada",
        description: "La imagen se ha enviado correctamente",
      });
    } catch (error: any) {
      console.error("❌ [USER] Error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("🎤 [USER] Grabando audio...");
    } catch (error) {
      console.error("❌ [USER] Error grabando:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("⏹️ [USER] Grabación detenida");
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true);

    try {
      const fileName = `audio-${Date.now()}.webm`;
      const filePath = `${leadId}/${fileName}`;

      console.log("📤 [USER] Subiendo audio:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, audioBlob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(filePath);

      console.log("✅ [USER] Audio subido:", publicUrl);

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          lead_id: leadId,
          text: null,
          media_type: "audio",
          media_url: publicUrl,
          is_from_maestro: false,
        });

      if (messageError) throw messageError;

      toast({
        title: "Audio enviado",
        description: "El audio se ha enviado correctamente",
      });
    } catch (error: any) {
      console.error("❌ [USER] Error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el audio",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(260,40%,8%)] via-[hsl(260,35%,12%)] to-[hsl(270,30%,15%)] flex flex-col">
      {/* Header profesional */}
      <div className="bg-gradient-to-r from-gold/20 via-amber-500/10 to-gold/20 backdrop-blur-md border-b border-gold/30 shadow-2xl">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/40 rounded-full blur-xl animate-pulse" />
              <Avatar className="relative h-16 w-16 ring-4 ring-gold/50 shadow-2xl">
                <AvatarImage src={maestroAvatar} />
                <AvatarFallback className="bg-gold/30 text-gold text-2xl font-bold">M</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">
                Maestro Espiritual
              </h1>
              <p className="text-sm text-green-400 flex items-center gap-2 mt-1">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                En línea
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.is_from_maestro ? "justify-start" : "justify-end"
              }`}
            >
              <div className={`flex gap-3 max-w-[75%] ${
                message.is_from_maestro ? "" : "flex-row-reverse"
              }`}>
                {message.is_from_maestro && (
                  <Avatar className="h-10 w-10 ring-2 ring-gold/50">
                    <AvatarImage src={maestroAvatar} />
                    <AvatarFallback className="bg-gold/20 text-gold">M</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 shadow-md ${
                    message.is_from_maestro
                      ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white"
                      : "bg-white/90 text-gray-900"
                  }`}
                >
                  {!message.is_from_maestro && (
                    <p className="text-xs font-semibold mb-1 text-gray-700">
                      {leadName}
                    </p>
                  )}

                  {message.text && (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}

                  {message.media_type === "image" && message.media_url && (
                    <img 
                      src={message.media_url} 
                      alt="Imagen"
                      className="rounded-lg max-w-full h-auto mt-2"
                    />
                  )}

                  {message.media_type === "audio" && message.media_url && (
                    <audio controls className="mt-2 w-full">
                      <source src={message.media_url} type="audio/webm" />
                    </audio>
                  )}

                  <p className={`text-xs mt-1.5 ${
                    message.is_from_maestro ? "opacity-80" : "text-gray-600"
                  }`}>
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
      <div className="bg-background/95 backdrop-blur-md border-t border-gold/20 shadow-2xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
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
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="hover:bg-gold/10"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5 text-gold" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isUploading}
              className={`hover:bg-gold/10 ${isRecording ? "bg-red-500 text-white" : "text-gold"}`}
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-background/50 border-gold/20"
              disabled={isSending}
            />

            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-gold"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}