"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Paperclip, Image, Video, Mic, FileText, Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { MessageService } from "@/services/messageService";
import { LeadService } from "@/services/leadService";
import { ProfileService } from "@/services/profileService";

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
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [maestroAvatar, setMaestroAvatar] = useState("/api/placeholder/40/40");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar datos y suscribirse a Supabase - VERSIÓN CORREGIDA
  useEffect(() => {
    let isMounted = true;
    let channelSubscription: ReturnType<typeof supabase.channel> | null = null;

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
        if (!isMounted) return;
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
          
          if (!isMounted) return;
          
          if (emergencyLead && !error) {
            currentLeadId = emergencyLead.id;
            localStorage.setItem("currentLeadId", emergencyLead.id);
            console.log("✅ Lead de emergencia creado:", currentLeadId);
          }
        } catch (err) {
          console.error("❌ Error creando lead de emergencia:", err);
          if (!isMounted) return;
        }
      }
      
      if (currentLeadId) {
        console.log("✅ Lead ID obtenido:", currentLeadId);
        setLeadId(currentLeadId);

        // Cargar mensajes existentes
        const messagesData = await MessageService.getByLeadId(currentLeadId);
        if (!isMounted) return;
        
        console.log("✅ Mensajes cargados:", messagesData.length);
        setMessages(messagesData);
        setLastMessageCount(messagesData.length);

        // Marcar como leídos los mensajes del maestro
        MessageService.markAsRead(currentLeadId, false).catch(console.error);

        // --- POLLING DE RESPALDO (cada 3 segundos) ---
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const latestMessages = await MessageService.getByLeadId(currentLeadId);
            setMessages((prev) => {
              // Solo actualizar si hay mensajes nuevos
              if (latestMessages.length > prev.length) {
                console.log(`🔄 Polling: ${latestMessages.length - prev.length} mensajes nuevos detectados`);
                return latestMessages;
              }
              return prev;
            });
          } catch (error) {
            console.error("Error en polling:", error);
          }
        }, 3000);

        // --- SOLUCIÓN AL ERROR DE SUSCRIPCIÓN ---
        // 1. Limpiar cualquier canal existente con el mismo nombre
        const channelName = `messages-${currentLeadId}`;
        const existingChannels = supabase.getChannels();
        existingChannels.forEach((ch) => {
          if (ch.topic === `realtime:${channelName}`) {
            console.log("🧹 Limpiando canal huérfano previo:", channelName);
            supabase.removeChannel(ch);
          }
        });

        // Configurar suscripción en tiempo real
        console.log("🔔 Configurando suscripción realtime para lead:", currentLeadId);
        
        // 2. Crear canal nuevo y limpio
        const realtimeChannel = supabase.channel(channelName);
        
        realtimeChannel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `lead_id=eq.${currentLeadId}`,
          },
          (payload) => {
            console.log("🔔 REALTIME - Cambio detectado:", {
              eventType: payload.eventType,
              table: payload.table,
              leadId: currentLeadId
            });
            
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as Message;
              console.log("📨 REALTIME - Nuevo mensaje recibido:", {
                id: newMessage.id,
                text: newMessage.text?.substring(0, 50),
                is_from_maestro: newMessage.is_from_maestro,
                created_at: newMessage.created_at
              });
              
              setMessages((prev) => {
                if (prev.some(m => m.id === newMessage.id)) {
                  console.log("⚠️ REALTIME - Mensaje duplicado, ignorando");
                  return prev;
                }
                console.log("➕ REALTIME - Añadiendo mensaje al estado");
                return [...prev, newMessage];
              });

              // Si es del maestro y estamos con el chat abierto, marcar como leído
              if (newMessage.is_from_maestro) {
                console.log("✓ REALTIME - Marcando mensaje del maestro como leído");
                MessageService.markAsRead(currentLeadId, false).catch(console.error);
              }
            } else if (payload.eventType === "UPDATE") {
              const updatedMessage = payload.new as Message;
              console.log("🔄 REALTIME - Mensaje actualizado:", updatedMessage.id);
              setMessages((prev) => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
            }
          }
        );
        
        realtimeChannel.subscribe((status) => {
          if (!isMounted) return;
          console.log("📡 Estado de suscripción:", status);
          if (status === "SUBSCRIBED") {
            console.log("✅ Suscripción realtime activa");
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ Error en canal realtime");
          }
        });
        
        channelSubscription = realtimeChannel;

        // Cargar avatar del maestro desde el perfil
        const { data: profiles } = await ProfileService.getAll();
        if (!isMounted) return;
        
        if (profiles && profiles.length > 0) {
          const maestro = profiles[0];
          if (maestro.avatar_url) {
            setMaestroAvatar(maestro.avatar_url);
          }
        }
      }

      if (isMounted) {
        setIsReady(true);
      }
    };

    loadData();

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      isMounted = false;
      if (channelSubscription) {
        console.log("🔌 Cancelando suscripción realtime...");
        supabase.removeChannel(channelSubscription);
      }
      if (pollingIntervalRef.current) {
        console.log("🛑 Deteniendo polling de respaldo...");
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userName, userPhone, userProblem, userCard]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !leadId) return;

    try {
      setIsUploading(true);
      const messageText = newMessage.trim() || (selectedFile ? `Archivo: ${selectedFile.name}` : "");
      console.log("📤 Enviando mensaje del usuario:", messageText);
      
      const messageData: any = {
        lead_id: leadId,
        text: messageText,
        is_from_maestro: false,
      };

      // Si hay archivo, subirlo a Supabase Storage
      if (selectedFile) {
        console.log("📎 Subiendo archivo:", selectedFile.name);
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${leadId}/${Date.now()}.${fileExt}`;
        const filePath = `messages/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(filePath, selectedFile);

        if (uploadError) {
          console.error("❌ Error subiendo archivo:", uploadError);
          throw uploadError;
        }

        console.log("✅ Archivo subido:", filePath);

        // Obtener URL pública del archivo
        const { data: { publicUrl } } = supabase.storage
          .from('chat-files')
          .getPublicUrl(filePath);

        messageData.media_url = publicUrl;

        // Detectar tipo de archivo
        const fileType = selectedFile.type;
        if (fileType.startsWith('image/')) {
          messageData.media_type = 'image';
        } else if (fileType.startsWith('video/')) {
          messageData.media_type = 'video';
        } else if (fileType.startsWith('audio/')) {
          messageData.media_type = 'audio';
        } else {
          messageData.media_type = 'file';
        }
      }

      console.log("💾 Guardando mensaje en DB:", messageData);
      const createdMessage = await MessageService.create(messageData);
      
      if (!createdMessage) {
        console.error("❌ MessageService.create retornó null/undefined");
        throw new Error("No se pudo crear el mensaje");
      }
      
      console.log("✅ Mensaje guardado en DB con ID:", createdMessage.id);

      // Añadir el mensaje a la lista local inmediatamente
      setMessages((prev) => {
        // Evitar duplicados
        if (prev.some(m => m.id === createdMessage.id)) {
          console.log("⚠️ Mensaje duplicado detectado, no se añade");
          return prev;
        }
        console.log("➕ Añadiendo mensaje al estado local");
        return [...prev, createdMessage];
      });

      setNewMessage("");
      setSelectedFile(null);
      setFilePreview(null);
      
      console.log("🎉 Proceso de envío completado exitosamente");
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      alert("Error enviando el mensaje. Por favor intenta de nuevo.");
    } finally {
      setIsUploading(false);
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

  // Auto-scroll cuando llegan mensajes nuevos
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header del Chat */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-secondary via-card to-secondary border-b-2 border-gold/30 p-4 shadow-lg sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative">
            <img
              src={maestroAvatar}
              alt="Maestro Espiritual"
              className="w-12 h-12 rounded-full ring-2 ring-gold/50"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-xl font-bold text-gold">Maestro Espiritual</h2>
            <p className="text-xs text-muted-foreground">En línea</p>
          </div>
          <Sparkles className="w-6 h-6 text-gold animate-pulse" />
        </div>
      </motion.div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
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
                  className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${
                    message.is_from_maestro
                      ? "bg-card border-2 border-gold/20 text-foreground"
                      : "bg-gradient-to-br from-gold to-amber-500 text-background"
                  }`}
                >
                  {message.is_from_maestro && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={maestroAvatar}
                        alt="Maestro"
                        className="w-6 h-6 rounded-full ring-1 ring-gold/50"
                      />
                      <span className="text-xs font-semibold text-gold">Maestro Espiritual</span>
                    </div>
                  )}

                  {/* Imagen */}
                  {message.media_type === 'image' && message.media_url && (
                    <div className="mb-2">
                      <img
                        src={message.media_url}
                        alt="Imagen adjunta"
                        className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition"
                        onClick={() => setViewingImage(message.media_url!)}
                      />
                    </div>
                  )}

                  {/* Video */}
                  {message.media_type === 'video' && message.media_url && (
                    <div className="mb-2">
                      <video
                        src={message.media_url}
                        controls
                        className="rounded-lg max-w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Audio */}
                  {message.media_type === 'audio' && message.media_url && (
                    <div className="mb-2">
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
                      className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
                        message.is_from_maestro ? "bg-muted" : "bg-background/20"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      <span className="text-sm font-medium">Descargar archivo</span>
                      <Download className="w-4 h-4 ml-auto" />
                    </a>
                  )}

                  {/* Texto */}
                  {message.text && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  )}

                  <div className={`flex items-center justify-end gap-1 mt-1 ${message.is_from_maestro ? "text-muted-foreground" : "text-background/70"}`}>
                    <p className="text-[10px]">
                      {new Date(message.created_at).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    {!message.is_from_maestro && (
                      <span className={`text-[12px] font-bold tracking-tighter leading-none ${message.read_at ? "text-blue-500" : ""}`}>
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
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t-2 border-gold/20 p-4 z-20"
      >
        <div className="max-w-4xl mx-auto">
          {/* Preview de archivo */}
          {selectedFile && (
            <div className="mb-3 p-3 bg-card rounded-lg border border-gold/20">
              <div className="flex items-center gap-3">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gold" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Botones multimedia */}
            <div className="flex gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-3 bg-card hover:bg-gold/20 rounded-full border-2 border-gold/30 transition disabled:opacity-50"
                title="Adjuntar archivo"
              >
                <Paperclip className="w-5 h-5 text-gold" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => handleFileSelect(e);
                  input.click();
                }}
                disabled={isUploading}
                className="p-3 bg-card hover:bg-gold/20 rounded-full border-2 border-gold/30 transition disabled:opacity-50"
                title="Enviar foto"
              >
                <Image className="w-5 h-5 text-gold" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e: any) => handleFileSelect(e);
                  input.click();
                }}
                disabled={isUploading}
                className="p-3 bg-card hover:bg-gold/20 rounded-full border-2 border-gold/30 transition disabled:opacity-50"
                title="Enviar video"
              >
                <Video className="w-5 h-5 text-gold" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'audio/*';
                  input.onchange = (e: any) => handleFileSelect(e);
                  input.click();
                }}
                disabled={isUploading}
                className="p-3 bg-card hover:bg-gold/20 rounded-full border-2 border-gold/30 transition disabled:opacity-50"
                title="Enviar audio"
              >
                <Mic className="w-5 h-5 text-gold" />
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
              placeholder={isUploading ? "Subiendo archivo..." : "Escribe tu mensaje..."}
              disabled={isUploading}
              className="flex-1 px-4 py-3 bg-card border-2 border-gold/30 rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-gold/60 transition disabled:opacity-50"
            />

            {/* Botón enviar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || isUploading}
              className="p-3 bg-gradient-to-br from-gold to-amber-500 hover:from-amber-500 hover:to-gold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-background animate-spin" />
              ) : (
                <Send className="w-6 h-6 text-background" />
              )}
            </motion.button>
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
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setViewingImage(null)}
          >
            <button 
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={viewingImage} 
              alt="Vista ampliada" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}