"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { MessageService } from "@/services/messageService";
import { ProfileService } from "@/services/profileService";
import { LeadService } from "@/services/leadService";
import type { Database } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import type React from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface ChatMaestroProps {
  userName: string;
  userPhone?: string;
  userProblem?: string;
  userCard?: string;
  onBack?: () => void;
}

export function ChatMaestro({ userName, userPhone, userProblem, userCard }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [maestroAvatar, setMaestroAvatar] = useState<string>("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: "image" | "video" | "audio"; file?: File } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar datos y suscribirse a Supabase
  useEffect(() => {
    let subscription: any = null;

    const loadData = async () => {
      console.log("🔄 ChatMaestro: Iniciando...");
      
      // Intentar obtener leadId del localStorage (máximo 6 intentos = 3 segundos)
      let attempts = 0;
      let currentLeadId = null;
      
      while (!currentLeadId && attempts < 6) {
        currentLeadId = localStorage.getItem("currentLeadId");
        if (currentLeadId) break;
        
        console.log(`⏳ Intento ${attempts + 1}/6 - Esperando leadId...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      // Si después de 3 segundos no hay leadId, crear uno de emergencia
      if (!currentLeadId) {
        console.warn("⚠️ No se encontró leadId - Creando lead de emergencia...");
        try {
          const { data: emergencyLead, error } = await LeadService.create({
            name: userName || "Usuario",
            whatsapp: userPhone || "0000000000",
            country_code: "+52",
            problem: userProblem || "Consulta desde chat",
            status: "nuevo",
            selected_cards: userCard ? [userCard] : [],
            precision_answers: []
          });
          
          if (emergencyLead && !error) {
            currentLeadId = emergencyLead.id;
            localStorage.setItem("currentLeadId", emergencyLead.id);
            console.log("✅ Lead de emergencia creado:", currentLeadId);
          }
        } catch (err) {
          console.error("❌ Error creando lead de emergencia:", err);
        }
      }
      
      if (currentLeadId) {
        console.log("✅ Lead ID obtenido:", currentLeadId);
        setLeadId(currentLeadId);

        // Cargar mensajes existentes
        const messagesData = await MessageService.getByLeadId(currentLeadId);
        console.log("✅ Mensajes cargados:", messagesData.length);
        setMessages(messagesData);

        // Suscribirse a cambios en tiempo real
        console.log("🔔 Configurando suscripción realtime para lead:", currentLeadId);
        subscription = MessageService.subscribeToMessages(currentLeadId, (newMsg) => {
          console.log("📨 Nuevo mensaje recibido en ChatMaestro:", newMsg);
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) {
              console.log("⚠️ Mensaje duplicado ignorado");
              return prev;
            }
            console.log("✅ Mensaje agregado a la lista");
            return [...prev, newMsg];
          });
        });
        
        console.log("✅ Suscripción realtime configurada");

        // Cargar avatar del maestro desde el perfil
        const { data: profiles } = await ProfileService.getAll();
        if (profiles && profiles.length > 0) {
          const maestro = profiles[0];
          console.log("👤 Perfil del maestro:", maestro);
          if (maestro.avatar_url) {
            console.log("✅ Avatar del maestro cargado:", maestro.avatar_url);
            setMaestroAvatar(maestro.avatar_url);
          }
        }
      }

      setIsReady(true);
    };

    loadData();

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      if (subscription) {
        console.log("🔌 Cancelando suscripción realtime...");
        subscription.unsubscribe();
      }
    };
  }, [userName, userPhone, userProblem, userCard]);

  // Enviar mensaje a Supabase
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    // Validar leadId
    if (!leadId) {
      console.error("❌ No hay leadId disponible");
      return;
    }

    setIsSending(true);

    try {
      const createdMessage = await MessageService.create({
        lead_id: leadId,
        text: message.trim(),
        is_from_maestro: false
      });

      if (createdMessage) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === createdMessage.id);
          if (exists) return prev;
          return [...prev, createdMessage];
        });
      }

      setMessage("");
      setIsSending(false);
      scrollToBottom();
    } catch (err) {
      console.error("❌ Error:", err);
      setIsSending(false);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split("/")[0];
    const url = URL.createObjectURL(file);

    if (fileType === "image" || fileType === "video" || fileType === "audio") {
      setMediaPreview({ url, type: fileType as "image" | "video" | "audio", file });
    } else {
      alert("Tipo de archivo no soportado. Solo imágenes, videos y audios.");
    }
  };

  // Enviar archivo multimedia
  const handleSendMedia = async () => {
    if (!mediaPreview?.file || !leadId) return;

    setIsUploading(true);

    try {
      // Subir archivo a Supabase Storage
      const fileName = `${leadId}/${Date.now()}-${mediaPreview.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, mediaPreview.file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      // Crear mensaje con media
      const createdMessage = await MessageService.create({
        lead_id: leadId,
        text: "",
        media_url: publicUrl,
        media_type: mediaPreview.type,
        is_from_maestro: false
      });

      if (createdMessage) {
        setMessages((prev) => [...prev, createdMessage]);
      }

      setMediaPreview(null);
      setIsUploading(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      alert("Error al enviar archivo");
      setIsUploading(false);
    }
  };

  // Marcar mensajes como leídos cuando el usuario abre el chat
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!leadId) return;
      
      try {
        await MessageService.markAsRead(leadId);
      } catch (error) {
        console.error("Error marcando mensajes como leídos:", error);
      }
    };

    if (isReady && leadId) {
      markMessagesAsRead();
    }
  }, [isReady, leadId, messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold">Conectando con el maestro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-black/60 backdrop-blur-md rounded-3xl overflow-hidden border border-gold/20 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 backdrop-blur-sm p-4 border-b border-gold/20">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <img
                src={maestroAvatar}
                alt="Maestro"
                className="w-12 h-12 rounded-full object-cover border-2 border-gold"
                onError={(e) => {
                  e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro";
                }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900" />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h3 className="text-gold font-semibold tracking-wide">Maestro Espiritual</h3>
              <p className="text-xs text-green-400 tracking-wider">EN LÍNEA</p>
            </div>
          </div>
        </div>

        {/* Lista de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isFromMaestro = msg.is_from_maestro;
            const isRead = msg.read_at !== null;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isFromMaestro ? "justify-start" : "justify-end"}`}
              >
                <div className={`flex gap-3 max-w-[80%] sm:max-w-[70%] ${isFromMaestro ? "flex-row" : "flex-row-reverse"}`}>
                  {/* Avatar */}
                  {isFromMaestro && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold/30">
                      <img
                        src={maestroAvatar}
                        alt="Maestro"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Mensaje */}
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isFromMaestro
                          ? "bg-secondary/50 text-foreground"
                          : "bg-primary/20 text-foreground"
                      }`}
                    >
                      {msg.media_url ? (
                        <div className="space-y-2">
                          {msg.media_type === "image" && (
                            <img src={msg.media_url} alt="Imagen" className="rounded-lg max-w-full h-auto" />
                          )}
                          {msg.media_type === "video" && (
                            <video src={msg.media_url} controls className="rounded-lg max-w-full h-auto" />
                          )}
                          {msg.media_type === "audio" && (
                            <audio src={msg.media_url} controls className="w-full" />
                          )}
                          {msg.text && <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.text}</p>}
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.text}</p>
                      )}
                    </div>

                    {/* Timestamp y checkmarks */}
                    <div className={`flex items-center gap-2 mt-1 px-2 ${isFromMaestro ? "justify-start" : "justify-end"}`}>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {!isFromMaestro && (
                        <div className="flex items-center">
                          {isRead ? (
                            <span className="text-primary text-xs">✓✓</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">✓</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Preview de archivo multimedia */}
        {mediaPreview && (
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {mediaPreview.type === "image" && (
                  <img src={mediaPreview.url} alt="Preview" className="w-16 h-16 rounded object-cover" />
                )}
                {mediaPreview.type === "video" && (
                  <video src={mediaPreview.url} className="w-16 h-16 rounded object-cover" />
                )}
                {mediaPreview.type === "audio" && (
                  <div className="w-16 h-16 bg-primary/20 rounded flex items-center justify-center">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                )}
                <p className="text-sm text-foreground/80">
                  {mediaPreview.type === "image" && "Imagen seleccionada"}
                  {mediaPreview.type === "video" && "Video seleccionado"}
                  {mediaPreview.type === "audio" && "Audio seleccionado"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMediaPreview(null)}
                  className="px-4 py-2 bg-secondary/50 hover:bg-secondary/70 text-foreground rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendMedia}
                  disabled={isUploading}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 text-background rounded-lg transition-colors disabled:opacity-50"
                >
                  {isUploading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input de mensaje */}
        <div className="border-t border-border p-4 sm:p-6 bg-card/50">
          <div className="flex gap-3 items-end">
            {/* Botón de adjuntar archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-secondary/50 hover:bg-secondary/70 text-gold rounded-full transition-colors flex-shrink-0"
              title="Adjuntar archivo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[52px] max-h-32"
              rows={1}
              disabled={isSending}
            />

            <button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
              className="p-3 bg-primary hover:bg-primary/80 text-background rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Presiona Enter para enviar • Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}