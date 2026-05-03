import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Upload, Mic, MicOff, User, Sparkles, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatAdmin() {
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [leadName, setLeadName] = useState("Usuario");
  const [leadPhone, setLeadPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadLead = async () => {
      const { data } = await supabase.from("leads").select("*").eq("id", id).single();
      if (data) {
        setLeadName(data.name);
        setLeadPhone(`${data.country_code} ${data.whatsapp}`);
      }
    };

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    loadLead();
    loadMessages();

    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      lead_id: id as string,
      text: messageText,
      is_from_maestro: true,
    });

    if (error) {
      console.error("Error enviando mensaje:", error);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const messageContent = `[IMG]${base64String}`;

        const { error: dbError } = await supabase.from("messages").insert({
          lead_id: id as string,
          text: messageContent,
          is_from_maestro: true,
        });

        if (dbError) {
          console.error("Error insertando mensaje:", dbError);
        }

        setUploading(false);
      };

      reader.onerror = () => {
        console.error("Error leyendo archivo");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error:", err);
      setUploading(false);
    }

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
      console.error("Error iniciando grabación:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!id) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const messageContent = `[AUDIO]${base64String}`;

        const { error: dbError } = await supabase.from("messages").insert({
          lead_id: id as string,
          text: messageContent,
          is_from_maestro: true,
        });

        if (dbError) {
          console.error("Error insertando mensaje de audio:", dbError);
        }

        setUploading(false);
      };

      reader.onerror = () => {
        console.error("Error leyendo blob de audio");
        setUploading(false);
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error("Error subiendo audio:", err);
      setUploading(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Botón de regreso al dashboard */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/Suafazon/dashboard")}
            className="flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent/20 text-accent">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{leadName}</h2>
            <p className="text-xs text-muted-foreground truncate">{leadPhone}</p>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isImage = msg.text?.startsWith("[IMG]");
          const isAudio = msg.text?.startsWith("[AUDIO]");
          
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.is_from_maestro ? "justify-start" : "justify-end"}`}
            >
              {msg.is_from_maestro && (
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.is_from_maestro
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border border-border"
                }`}
              >
                {isImage && (
                  <div 
                    className="rounded-lg overflow-hidden mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(msg.text?.replace("[IMG]", "") || "")}
                  >
                    <img
                      src={msg.text?.replace("[IMG]", "") || ""}
                      alt="Imagen"
                      className="max-w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                )}
                
                {isAudio && (
                  <audio controls className="mb-2 w-full max-w-xs">
                    <source src={msg.text?.replace("[AUDIO]", "") || ""} type="audio/webm" />
                  </audio>
                )}
                
                {!isImage && !isAudio && msg.text && (
                  <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                )}
                
                <p className="text-[10px] mt-1 opacity-70">{formatTime(msg.created_at)}</p>
              </div>
              {!msg.is_from_maestro && (
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-accent/20 text-accent">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input área */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSendMessage();
      }} className="sticky bottom-0 bg-card border-t border-border p-4">
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
            className="flex-shrink-0"
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
            className={`flex-shrink-0 ${recording ? "text-destructive animate-pulse" : ""}`}
          >
            <Mic className="h-5 w-5" />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={sending || uploading}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="flex-shrink-0"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>

      {/* Modal de imagen para admin (con descarga) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-16 right-0 flex gap-3">
                <a
                  href={selectedImage}
                  download={`imagen-${Date.now()}.png`}
                  className="flex items-center gap-2 px-4 py-2 bg-gold/90 hover:bg-gold text-background rounded-lg font-medium shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Descargar
                </a>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-white hover:text-gold transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              <img
                src={selectedImage}
                alt="Vista completa"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}