"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Paperclip, Image, Mic, FileText, Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { MessageService } from "@/services/messageService";
import { LeadService } from "@/services/leadService";
import { ProfileService } from "@/services/profileService";
import type { Lead } from "@/types/admin";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface ChatMaestroProps {
  userName: string;
  userPhone: string;
  userProblem: string;
  userCard?: string;
}

export function ChatMaestro({ userName, userPhone, userProblem, userCard }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [lead, setLead] = useState<Lead | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [maestroAvatar, setMaestroAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar datos y suscribirse a Supabase - VERSIÓN SIMPLIFICADA
  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 ChatMaestro: Iniciando...");
      
      // Obtener leadId del localStorage
      const currentLeadId = localStorage.getItem("currentLeadId");
      
      if (!currentLeadId) {
        console.error("❌ No se encontró leadId en localStorage");
        setIsReady(true); // Mostrar chat vacío en lugar de quedarse cargando
        return;
      }
      
      console.log("✅ Lead ID obtenido:", currentLeadId);
      setLeadId(currentLeadId);

      // Cargar mensajes existentes
      const messagesData = await MessageService.getByLeadId(currentLeadId);
      console.log("✅ Mensajes cargados:", messagesData.length);
      setMessages(messagesData);

      // Polling simple cada 3 segundos
      const pollInterval = setInterval(async () => {
        try {
          const latestMessages = await MessageService.getByLeadId(currentLeadId);
          if (latestMessages.length > messages.length) {
            console.log(`🔄 Nuevos mensajes: ${latestMessages.length - messages.length}`);
            setMessages(latestMessages);
          }
        } catch (error) {
          console.error("Error en polling:", error);
        }
      }, 3000);

      // Suscripción realtime con nombre único para evitar colisiones
      const channelName = `messages_${currentLeadId}_${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `lead_id=eq.${currentLeadId}`
          },
          (payload) => {
            console.log('🔔 Nuevo mensaje realtime:', payload.new);
            setMessages((prev) => {
              if (!prev.some(m => m.id === payload.new.id)) {
                return [...prev, payload.new as Message];
              }
              return prev;
            });
          }
        )
        .subscribe();

      // Cargar avatar del maestro
      const { data: profiles } = await ProfileService.getAll();
      if (profiles && profiles.length > 0 && profiles[0].avatar_url) {
        setMaestroAvatar(profiles[0].avatar_url);
      }

      setIsReady(true);

      // Cleanup
      return () => {
        clearInterval(pollInterval);
        supabase.removeChannel(channel);
      };
    };

    loadData();
  }, []);

  // Auto-scroll cuando llegan mensajes nuevos
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount]);

  // Cargar lead
  useEffect(() => {
    if (!leadId) return;

    const fetchLead = async () => {
      console.log("Cargando lead:", leadId);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error cargando lead:", error);
      } else {
        console.log("Lead cargado:", data);
        setLead(data as Lead);
      }
    };

    fetchLead();
  }, [leadId]);

  // Cargar mensajes
  useEffect(() => {
    if (!leadId) return;

    const fetchMessages = async () => {
      console.log("Cargando mensajes para lead:", leadId);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error cargando mensajes:", error);
      } else {
        console.log("Mensajes cargados:", data);
        setMessages(data || []);
      }
    };

    fetchMessages();
  }, [leadId]);

  // Realtime subscription
  useEffect(() => {
    if (!leadId) return;

    const timestamp = Date.now();
    const channelName = `messages:${leadId}:${timestamp}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          console.log("Nuevo mensaje recibido:", payload);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  // Scroll automático
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    try {
      const createdMessage = await MessageService.create({
        lead_id: leadId,
        text: newMessage,
        is_from_maestro: false,
      });

      if (createdMessage) {
        setMessages((prev) => [...prev, createdMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-foreground/70 font-medium">Conectando con el maestro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header del Chat */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-secondary/95 via-card/95 to-secondary/95 backdrop-blur-xl border-b border-gold/20 p-6 shadow-2xl sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img
              src={maestroAvatar}
              alt="Maestro Espiritual"
              className="relative w-14 h-14 rounded-full ring-2 ring-gold/50 shadow-lg group-hover:ring-gold transition-all duration-300"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-lg animate-pulse" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-bold text-gold drop-shadow-lg">Maestro Espiritual</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-muted-foreground font-medium">En línea • Responde en segundos</p>
            </div>
          </div>
          <Sparkles className="w-7 h-7 text-gold animate-pulse drop-shadow-lg" />
        </div>
      </motion.div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-32 md:pb-40">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.is_from_maestro ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl p-5 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                    message.is_from_maestro
                      ? "bg-gradient-to-br from-card via-card/95 to-secondary/50 border border-gold/30 text-foreground backdrop-blur-sm"
                      : "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-background shadow-gold/50"
                  }`}
                >
                  {message.is_from_maestro && (
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gold/20">
                      <img
                        src={maestroAvatar}
                        alt="Maestro"
                        className="w-8 h-8 rounded-full ring-2 ring-gold/40 shadow-md"
                      />
                      <span className="text-sm font-semibold text-gold tracking-wide">Maestro Espiritual</span>
                    </div>
                  )}

                  {/* Imagen */}
                  {message.media_type === 'image' && message.media_url && (
                    <div className="mb-3 group">
                      <img
                        src={message.media_url}
                        alt="Imagen adjunta"
                        className="rounded-2xl max-w-full h-auto cursor-pointer hover:opacity-95 transition-all duration-300 shadow-xl group-hover:shadow-2xl border border-gold/20"
                        onClick={() => setViewingImage(message.media_url!)}
                      />
                    </div>
                  )}

                  {/* Video */}
                  {message.media_type === 'video' && message.media_url && (
                    <div className="mb-3">
                      <video
                        src={message.media_url}
                        controls
                        className="rounded-2xl max-w-full h-auto shadow-xl border border-gold/20"
                      />
                    </div>
                  )}

                  {/* Audio */}
                  {message.media_type === 'audio' && message.media_url && (
                    <div className="mb-3 p-3 bg-background/20 rounded-xl">
                      <audio
                        src={message.media_url}
                        controls
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Archivo */}
                  {message.media_type === 'file' && message.media_url && (
                    <a
                      href={message.media_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 mb-3 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                        message.is_from_maestro ? "bg-muted/50 hover:bg-muted/70" : "bg-background/20 hover:bg-background/30"
                      }`}
                    >
                      <FileText className="w-6 h-6 flex-shrink-0" />
                      <span className="text-sm font-medium flex-1">Archivo adjunto</span>
                      <Download className="w-5 h-5 ml-auto animate-bounce" />
                    </a>
                  )}

                  {/* Texto */}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.is_from_maestro
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className={`flex items-center justify-end gap-2 mt-2 ${message.is_from_maestro ? "text-muted-foreground/70" : "text-background/80"}`}>
                    <p className="text-xs font-medium tracking-wide">
                      {new Date(message.created_at).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    {!message.is_from_maestro && (
                      <span className={`text-sm font-bold tracking-tighter leading-none transition-all duration-300 ${message.read_at ? "text-blue-400 scale-110" : "text-background/60"}`}>
                        {message.read_at ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Formulario de envío */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl border-t border-gold/20 p-3 pb-safe md:p-6 z-20 shadow-2xl"
      >
        <div className="max-w-4xl mx-auto">
          {/* Preview de archivo */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 md:mb-4 p-3 md:p-4 bg-card/80 backdrop-blur-md rounded-2xl border border-gold/20 shadow-xl"
            >
              <div className="flex items-center gap-3 md:gap-4">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl shadow-md" />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-muted/50 rounded-xl flex items-center justify-center shadow-inner">
                    <FileText className="w-8 h-8 md:w-10 md:h-10 text-gold" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {isUploading && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-gold to-amber-500 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-gold mt-1">{uploadProgress}% subido</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={removeFile}
                  disabled={isUploading}
                  className="p-2 hover:bg-destructive/20 rounded-xl transition-all duration-300 hover:scale-110 group disabled:opacity-50"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-destructive group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2 md:gap-3">
              {/* Botones multimedia */}
              <div className="flex gap-1 md:gap-2 flex-shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* MÓVIL: Botón único con menú desplegable estilo WhatsApp */}
                <div className="relative md:hidden">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMediaMenu(!showMediaMenu)}
                    className="p-3 bg-gradient-to-br from-card to-secondary hover:from-gold/20 hover:to-gold/10 rounded-2xl border-2 border-gold/30 transition-all duration-300 shadow-lg hover:shadow-gold/20 hover:shadow-xl"
                    title="Adjuntar multimedia"
                  >
                    <Paperclip className="w-6 h-6 text-gold" />
                  </motion.button>

                  {/* Menú desplegable de opciones multimedia */}
                  <AnimatePresence>
                    {showMediaMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gold/30 p-2 min-w-[200px] z-50"
                      >
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e: any) => {
                              handleFileSelect(e);
                              setShowMediaMenu(false);
                            };
                            input.click();
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gold/20 rounded-xl transition-all text-left"
                        >
                          <Image className="w-5 h-5 text-gold" />
                          <span className="text-sm font-medium text-foreground">Foto</span>
                        </button>
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'audio/*';
                            input.onchange = (e: any) => {
                              handleFileSelect(e);
                              setShowMediaMenu(false);
                            };
                            input.click();
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gold/20 rounded-xl transition-all text-left"
                        >
                          <Mic className="w-5 h-5 text-gold" />
                          <span className="text-sm font-medium text-foreground">Audio</span>
                        </button>
                        <button
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowMediaMenu(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gold/20 rounded-xl transition-all text-left"
                        >
                          <FileText className="w-5 h-5 text-gold" />
                          <span className="text-sm font-medium text-foreground">Archivo</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* DESKTOP: Botones separados */}
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="hidden md:block p-4 bg-gradient-to-br from-card to-secondary hover:from-gold/20 hover:to-gold/10 rounded-2xl border-2 border-gold/30 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-gold/20 hover:shadow-xl group"
                  title="Adjuntar archivo"
                >
                  <Paperclip className="w-6 h-6 text-gold group-hover:text-amber-300 transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15, rotate: -15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => handleFileSelect(e);
                    input.click();
                  }}
                  disabled={isUploading}
                  className="hidden md:block p-4 bg-gradient-to-br from-card to-secondary hover:from-gold/20 hover:to-gold/10 rounded-2xl border-2 border-gold/30 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-gold/20 hover:shadow-xl group"
                  title="Enviar foto"
                >
                  <Image className="w-6 h-6 text-gold group-hover:text-amber-300 transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15, rotate: -15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'audio/*';
                    input.onchange = (e: any) => handleFileSelect(e);
                    input.click();
                  }}
                  disabled={isUploading}
                  className="hidden md:block p-4 bg-gradient-to-br from-card to-secondary hover:from-gold/20 hover:to-gold/10 rounded-2xl border-2 border-gold/30 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-gold/20 hover:shadow-xl group"
                  title="Enviar audio"
                >
                  <Mic className="w-6 h-6 text-gold group-hover:text-amber-300 transition-colors" />
                </motion.button>
              </div>

              {/* Input de texto */}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isUploading ? "Subiendo..." : "Mensaje..."}
                disabled={isUploading}
                className="flex-1 w-full min-w-0 px-4 py-3 md:px-6 md:py-4 bg-card/80 backdrop-blur-md border-2 border-gold/30 rounded-2xl md:rounded-3xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 transition-all duration-300 disabled:opacity-50 shadow-inner text-sm md:text-[15px] font-medium"
              />

              {/* Botón enviar */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                className="p-3 md:p-4 bg-gradient-to-br from-gold via-amber-500 to-amber-600 hover:from-amber-500 hover:to-gold rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group flex-shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 md:w-7 md:h-7 text-background animate-spin" />
                ) : (
                  <Send className="w-5 h-5 md:w-7 md:h-7 text-background group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lightbox para imágenes */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setViewingImage(null)}
          >
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setViewingImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-md shadow-2xl group z-10"
            >
              <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>
            <motion.img 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              src={viewingImage} 
              alt="Vista ampliada" 
              className="max-w-[90%] max-h-[90%] object-contain rounded-3xl shadow-2xl border-2 border-gold/30"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}