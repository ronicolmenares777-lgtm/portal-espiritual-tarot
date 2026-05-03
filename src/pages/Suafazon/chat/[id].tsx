import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Upload, Mic, MicOff, User, Sparkles, Download, X, Star, ArrowLeft, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Lead = Tables<"leads">;
type Message = Tables<"messages">;

export default function ChatAdmin() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [leadStatus, setLeadStatus] = useState<"nuevo" | "contactado" | "convertido">("nuevo");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLead = async () => {
    if (!id || typeof id !== "string") return;

    console.log("📡 Cargando lead:", id);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error cargando lead:", error);
    } else {
      console.log("✅ Lead cargado:", data);
      setLead(data);
      setIsFavorite(data.is_favorite || false);
      setLeadStatus(data.status as "nuevo" | "contactado" | "convertido" || "nuevo");
    }
  };

  const loadMessages = async () => {
    if (!id || typeof id !== "string") return;

    console.log("📡 Cargando mensajes para lead:", id);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("❌ Error cargando mensajes:", error);
    } else {
      console.log("✅ Mensajes cargados:", data?.length || 0);
      setMessages(data || []);
    }
  };

  useEffect(() => {
    if (id) {
      loadLead();
      loadMessages();
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "nuevo" || value === "contactado" || value === "convertido") {
      updateLeadStatus(value);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id || typeof id !== "string") return;
    
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: !isFavorite })
      .eq("id", id);

    if (!error) {
      setIsFavorite(!isFavorite);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;

    setIsSending(true);
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

    setIsSending(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !id || typeof id !== "string" || isSending) return;

    setIsSending(true);
    const { error } = await supabase.from("messages").insert({
      lead_id: id,
      text: newMessage,
      is_from_maestro: true,
      is_read: false,
    });

    if (error) {
      console.error("Error enviando mensaje:", error);
    } else {
      setNewMessage("");
      loadMessages();
    }
    setIsSending(false);
  };

  const toggleFavorite = async () => {
    if (!id || typeof id !== "string") return;

    const newFavoriteStatus = !isFavorite;
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", id);

    if (!error) {
      setIsFavorite(newFavoriteStatus);
    }
  };

  const updateLeadStatus = async (newStatus: "nuevo" | "contactado" | "convertido") => {
    if (!id || typeof id !== "string") return;

    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setLeadStatus(newStatus);
      loadLead();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Stub para compilación - funcionalidad básica
    console.log("File upload triggered");
  };

  const startRecording = () => {
    setRecording(true);
    console.log("Recording started");
  };

  const stopRecording = () => {
    setRecording(false);
    console.log("Recording stopped");
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
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

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-muted to-background border-b border-gold/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/Suafazon/dashboard")}
              className="text-gold hover:text-gold/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center text-black font-bold">
              {lead?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{lead?.name || "Cargando..."}</h2>
                <button
                  onClick={toggleFavorite}
                  className="text-gold hover:text-gold/80 transition-colors"
                >
                  <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <Phone className="h-3 w-3" />
                <a
                  href={`https://wa.me/${lead?.whatsapp?.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline"
                >
                  {lead?.whatsapp}
                </a>
              </div>
            </div>
          </div>
          
          {/* Dropdown de estado */}
          <div className="flex items-center gap-2">
            <select
              value={leadStatus}
              onChange={handleStatusChange}
              className="px-3 py-1.5 rounded-lg border border-gold/20 bg-background text-sm text-foreground focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
            >
              <option value="nuevo">🔵 Nuevo</option>
              <option value="contactado">🟡 Contactado</option>
              <option value="convertido">🟢 Convertido</option>
            </select>
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

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isSending && sendMessage()}
              placeholder="Escribe un mensaje..."
              disabled={isSending}
              className="flex-1 px-4 py-2 rounded-lg border border-gold/20 bg-background text-foreground placeholder:text-foreground/50 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !newMessage.trim()}
              className="px-4 py-2 bg-gradient-to-r from-gold to-accent text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
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