"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, X } from "lucide-react";
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

export function ChatMaestro({ userName, userPhone, userProblem, userCard, onBack }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [maestroAvatar, setMaestroAvatar] = useState<string>("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const [mediaPreview, setMediaPreview] = useState<{
    type: "audio" | "image" | "video";
    url: string;
    file?: File;
    blob?: Blob;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Iniciar grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setMediaPreview({
          type: "audio",
          url: audioUrl,
          blob: audioBlob
        });

        // Detener stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert("No se pudo acceder al micrófono");
      console.error(error);
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Enviar audio
  const handleSendAudio = async () => {
    if (!mediaPreview || !mediaPreview.blob) return;

    try {
      // Subir audio a Supabase Storage
      const fileName = `audio-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, mediaPreview.blob, {
          contentType: "audio/webm"
        });

      if (uploadError) {
        console.error("Error subiendo audio:", uploadError);
        alert("Error al subir el audio");
        return;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(fileName);

      // Crear mensaje con el audio
      const currentLeadId = localStorage.getItem("currentLeadId");
      if (!currentLeadId) {
        alert("Error: No se encontró el ID del lead");
        return;
      }

      await MessageService.create({
        lead_id: currentLeadId,
        text: "",
        media_url: publicUrl,
        media_type: "audio",
        is_from_maestro: false
      });

      setMediaPreview(null);
    } catch (error) {
      console.error("Error enviando audio:", error);
      alert("Error al enviar el audio");
    }
  };

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

        // Configurar suscripción en tiempo real
        console.log("🔔 Configurando suscripción realtime para lead:", currentLeadId);
        
        subscription = supabase
          .channel(`messages-${currentLeadId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "messages",
              filter: `lead_id=eq.${currentLeadId}`,
            },
            (payload) => {
              console.log("🔔 Cambio detectado:", payload.eventType);
              
              if (payload.eventType === "INSERT") {
                const newMessage = payload.new as Message;
                console.log("📨 Nuevo mensaje recibido:", newMessage);
                
                setMessages((prev) => {
                  if (prev.some(m => m.id === newMessage.id)) {
                    console.log("⚠️ Mensaje duplicado, ignorando");
                    return prev;
                  }
                  return [...prev, newMessage];
                });
              }
            }
          )
          .subscribe((status) => {
            console.log("📡 Estado de suscripción:", status);
            
            if (status === "SUBSCRIBED") {
              console.log("✅ Suscripción realtime activa");
            } else if (status === "CLOSED") {
              console.error("❌ Suscripción cerrada, reconectando...");
              setTimeout(() => {
                if (subscription) subscription.subscribe();
              }, 2000);
            }
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
    if (!newMessage.trim() || isSending) return;

    // Validar leadId
    if (!leadId) {
      console.error("❌ No hay leadId disponible");
      return;
    }

    setIsSending(true);

    try {
      const createdMessage = await MessageService.create({
        lead_id: leadId,
        text: newMessage.trim(),
        is_from_maestro: false
      });

      if (createdMessage) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === createdMessage.id);
          if (exists) return prev;
          return [...prev, createdMessage];
        });
      }

      setNewMessage("");
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
                            <div className="relative group">
                              <img 
                                src={msg.media_url} 
                                alt="Imagen" 
                                className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => window.open(msg.media_url, '_blank')}
                              />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <a
                                  href={msg.media_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm transition-all"
                                  title="Abrir en nueva ventana"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                                <a
                                  href={msg.media_url}
                                  download
                                  className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg backdrop-blur-sm transition-all"
                                  title="Descargar imagen"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                              </div>
                            </div>
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

        {/* Input de mensaje y Previews unificados */}
        <div className="border-t border-gold/20 bg-card/50 p-4 shadow-2xl relative">
          {/* Preview Multimedia Unificado */}
          {mediaPreview && (
            <div className="mb-4 p-4 bg-primary/10 rounded-xl border border-primary/30 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {mediaPreview.type === "image" && (
                    <img src={mediaPreview.url} alt="Preview" className="w-12 h-12 rounded object-cover border border-primary/20" />
                  )}
                  {mediaPreview.type === "video" && (
                    <video src={mediaPreview.url} className="w-12 h-12 rounded object-cover border border-primary/20" />
                  )}
                  {mediaPreview.type === "audio" && (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                      <Mic className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {mediaPreview.type === "image" && "Imagen lista para enviar"}
                      {mediaPreview.type === "video" && "Video listo para enviar"}
                      {mediaPreview.type === "audio" && "Audio grabado"}
                    </p>
                    {mediaPreview.type === "audio" && <audio src={mediaPreview.url} controls className="mt-2 h-8" />}
                  </div>
                </div>
                <button
                  onClick={() => setMediaPreview(null)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-red-400" />
                </button>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setMediaPreview(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={mediaPreview.type === "audio" && mediaPreview.blob ? handleSendAudio : handleSendMedia}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-50"
                >
                  {isUploading ? "Enviando..." : "Enviar Archivo"}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 items-end">
            {/* Input oculto para adjuntos */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*"
            />

            <div className="flex gap-1 sm:gap-2">
              {/* Botón adjuntar imagen/video */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-3 bg-muted/50 hover:bg-muted border border-border hover:border-gold/40 rounded-lg transition-all"
                title="Adjuntar archivo"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>

              {/* Botón de grabar audio */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 sm:p-3 rounded-lg transition-all ${
                  isRecording 
                    ? "bg-red-500/30 border-2 border-red-500/60 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                    : "bg-muted/50 hover:bg-muted border border-border hover:border-gold/40"
                }`}
                title={isRecording ? "Detener grabación" : "Grabar audio"}
              >
                <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${isRecording ? "text-red-400" : "text-muted-foreground"}`} />
              </button>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Escribe tu mensaje..."
                rows={1}
                className="w-full bg-muted/50 border border-gold/20 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all resize-none"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="p-2 sm:p-3 bg-gradient-to-r from-gold to-accent text-background rounded-lg hover:shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}