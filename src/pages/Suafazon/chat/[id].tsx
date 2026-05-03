import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Upload, Mic, MicOff, User, Sparkles, Download, X, Star, ArrowLeft, Phone, Image } from "lucide-react";
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
  const [leadStatus, setLeadStatus] = useState<"nuevo" | "contactado">("nuevo");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadAdminProfile = () => {
    if (typeof window === "undefined") return;
    
    const profileData = localStorage.getItem("adminProfile");
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        console.log("👤 Perfil del admin cargado:", profile);
        setAdminProfile(profile);
      } catch (error) {
        console.error("Error parseando perfil del admin:", error);
      }
    }
  };

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
      setLeadStatus((data.status === "contactado" ? "contactado" : "nuevo") as "nuevo" | "contactado");
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
      loadAdminProfile();
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
    console.log("📝 Cambiando estado a:", value);
    if (value === "nuevo" || value === "contactado") {
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
    console.log("⭐ Cambiando favorito a:", newFavoriteStatus);
    
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", id);

    if (error) {
      console.error("❌ Error actualizando favorito:", error);
    } else {
      console.log("✅ Favorito actualizado correctamente");
      setIsFavorite(newFavoriteStatus);
      loadLead();
    }
  };

  const updateLeadStatus = async (newStatus: "nuevo" | "contactado") => {
    if (!id || typeof id !== "string") return;

    console.log("🔄 Actualizando estado a:", newStatus);
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("❌ Error actualizando estado:", error);
    } else {
      console.log("✅ Estado actualizado correctamente");
      setLeadStatus(newStatus);
      loadLead();
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || typeof id !== "string") return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("chat-files").getPublicUrl(fileName);

      const { error: messageError } = await supabase.from("messages").insert({
        lead_id: id,
        text: "",
        image_url: data.publicUrl,
        is_from_maestro: true,
        is_read: false,
      });

      if (messageError) throw messageError;

      loadMessages();
    } catch (error) {
      console.error("Error subiendo archivo:", error);
    } finally {
      setUploading(false);
    }
  };

  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        await uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error iniciando grabación:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!id || typeof id !== "string") return;

    setUploading(true);
    try {
      const fileName = `${id}/${Date.now()}.webm`;

      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("chat-files").getPublicUrl(fileName);

      const { error: messageError } = await supabase.from("messages").insert({
        lead_id: id,
        text: "",
        audio_url: data.publicUrl,
        is_from_maestro: true,
        is_read: false,
      });

      if (messageError) throw messageError;

      loadMessages();
    } catch (error) {
      console.error("Error subiendo audio:", error);
    } finally {
      setUploading(false);
    }
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
              className="px-3 py-1.5 rounded-lg border border-gold/20 bg-background text-sm text-foreground focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none cursor-pointer"
            >
              <option value="nuevo">💬 EN CHAT</option>
              <option value="contactado">✅ LISTO</option>
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
                <div className="flex items-start gap-2 justify-end">
                  <div className="max-w-[70%] bg-gradient-to-br from-gold/20 to-accent/10 border border-gold/30 rounded-lg p-3">
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="Imagen"
                        className="max-w-full rounded-lg mb-2 cursor-pointer"
                        onClick={() => handleImageClick(msg.image_url!)}
                      />
                    )}
                    {msg.audio_url && (
                      <audio controls className="max-w-full mb-2">
                        <source src={msg.audio_url} type="audio/webm" />
                      </audio>
                    )}
                    <p className="text-sm text-foreground">{msg.text}</p>
                    <p className="text-xs text-foreground/50 mt-1 text-right">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center text-black font-bold text-xs shrink-0 overflow-hidden">
                    {adminProfile?.avatar_url ? (
                      <img 
                        src={adminProfile.avatar_url} 
                        alt="Admin" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "M"
                    )}
                  </div>
                </div>
              )}
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
      <div className="bg-gradient-to-r from-muted to-background border-t border-gold/10 p-4">
        <div className="flex items-center gap-2">
          {/* Botón de imagen */}
          <label className="cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors">
            <Image className="h-5 w-5 text-gold" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Botón de audio */}
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={uploading}
            className={`p-2 hover:bg-muted rounded-lg transition-colors ${
              recording ? "bg-red-500/20 text-red-400" : "text-gold"
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isSending && sendMessage()}
            placeholder="Escribe un mensaje..."
            disabled={isSending || uploading}
            className="flex-1 px-4 py-2 rounded-lg border border-gold/20 bg-background text-foreground placeholder:text-foreground/50 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim() || uploading}
            className="px-4 py-2 bg-gradient-to-r from-gold to-accent text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

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