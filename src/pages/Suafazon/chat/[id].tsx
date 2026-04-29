import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { LeadService } from "@/services/leadService";
import { MessageService } from "@/services/messageService";
import { AuthService } from "@/services/authService";
import { ProfileService } from "@/services/profileService";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, Phone, User, Settings, Image as ImageIcon, Send, Loader2, MessageSquare, Mic, Paperclip, X, Download, CheckCircle, Save, FileText, Sparkles, Circle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const leadId = typeof id === "string" ? id : null;
  
  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        console.log("⚠️ No hay sesión Supabase válida");
        router.replace("/Suafazon");
      }
    };
    checkAuth();
  }, [router]);

  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maestroAvatar, setMaestroAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const [maestroProfile, setMaestroProfile] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{
    type: "image" | "audio";
    url: string;
    file?: File;
  } | null>(null);

  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: "Maestro Espiritual",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro",
    headerText: "En línea • Responde en segundos"
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = useIsMobile();

  // Auto-scroll cuando llegan mensajes nuevos
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount]);

  // Agregar atributo al body para cursor normal
  useEffect(() => {
    document.body.setAttribute("data-admin-page", "true");
    return () => {
      document.body.removeAttribute("data-admin-page");
    };
  }, []);

  // Referencias
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Función helper para actualizar lead en localStorage
  const updateLeadInStorage = (updatedLead: Lead) => {
    const storedLeads = localStorage.getItem("leads");
    if (storedLeads) {
      const leads: Lead[] = JSON.parse(storedLeads);
      const leadIndex = leads.findIndex(l => l.id === updatedLead.id);
      
      if (leadIndex !== -1) {
        leads[leadIndex] = updatedLead;
        localStorage.setItem("leads", JSON.stringify(leads));
        console.log("💾 Lead actualizado en localStorage:", updatedLead.id);
        
        // Disparar evento personalizado para notificar a otras páginas
        window.dispatchEvent(new Event("leadsUpdated"));
        
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (leadId) {
      const loadMessages = async () => {
        if (!leadId) return;
        const currentLeadId = leadId;

        console.log("🔗 ADMIN Iniciando carga de mensajes para lead:", currentLeadId);
        
        try {
          const initialMessages = await MessageService.getByLeadId(currentLeadId);
          setMessages(initialMessages);
          setLastMessageCount(initialMessages.length);
          console.log(`✅ ADMIN Mensajes iniciales cargados: ${initialMessages.length}`);

          // Marcar mensajes del usuario como leídos
          MessageService.markAsRead(currentLeadId, false).catch(console.error);
        } catch (error) {
          console.error("❌ ADMIN Error cargando mensajes:", error);
        }

        // --- SOLO POLLING (3 SEGUNDOS) ---
        let isPolling = false;
        const pollInterval = setInterval(async () => {
          if (isPolling) {
            console.log("⏭️ ADMIN Polling saltado - consulta anterior en progreso");
            return;
          }

          try {
            isPolling = true;
            const latestMessages = await MessageService.getByLeadId(currentLeadId);
            setMessages((prev) => {
              if (latestMessages.length !== prev.length) {
                console.log(`🔄 ADMIN Polling: ${Math.abs(latestMessages.length - prev.length)} cambios`);
                return latestMessages;
              }
              return prev;
            });
          } catch (error) {
            console.error("❌ ADMIN Error en polling:", error);
          } finally {
            isPolling = false;
          }
        }, 3000);

        // Cleanup
        return () => {
          console.log("🧹 ADMIN Limpiando polling");
          clearInterval(pollInterval);
        };
      };

      loadMessages();
    }
  }, [leadId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !id) return;

    try {
      const newMsg = await MessageService.create({
        lead_id: id as string,
        text: inputMessage,
      });

      if (newMsg) {
        setInputMessage("");
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("¿Estás seguro de eliminar este mensaje?")) return;
    try {
      const { error } = await supabase.from("messages").delete().eq("id", messageId);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error("Error eliminando mensaje:", error);
      alert("Error al eliminar el mensaje");
    }
  };

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!leadId) return;
    try {
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId);
      
      if (error) throw error;
      
      setLead(prev => prev ? { ...prev, ...updates } as Lead : null);
      console.log("✅ Lead actualizado:", updates);
    } catch (error) {
      console.error("Error actualizando lead:", error);
    }
  };

  const handleQuickReply = async (message: string) => {
    if (!id) return;

    try {
      const quickReply = await MessageService.create({
        lead_id: id as string,
        text: message,
      });

      if (quickReply) {
        setMessages((prev) => [...prev, quickReply]);
      }
    } catch (error) {
      console.error("Error enviando respuesta rápida:", error);
    }
  };

  const handleStatusChange = async (newStatus: Lead["status"]) => {
    if (!lead) return;
    
    const { error } = await LeadService.updateStatus(lead.id, newStatus);
    
    if (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar estado");
      return;
    }

    setLead({ ...lead, status: newStatus });
    console.log("✅ Estado actualizado a:", newStatus);
  };

  // Toggle favorito
  const handleFavoriteToggle = async () => {
    if (!lead) return;
    
    const { error } = await LeadService.toggleFavorite(lead.id);
    
    if (error) {
      console.error("Error actualizando favorito:", error);
      return;
    }

    setLead({ ...lead, is_favorite: !lead.is_favorite });
  };

  // Marcar como listo
  const handleMarkAsComplete = () => {
    if (!lead) return;
    
    const updatedLead: Lead = { ...lead, status: "listo" as const };
    setLead(updatedLead);
    
    // Actualizar en localStorage
    if (updateLeadInStorage(updatedLead)) {
      alert("✅ Marcado como listo. El lead ahora aparecerá en la sección LISTO del dashboard.");
    }
  };

  // Guardar notas
  const handleSaveNotes = async () => {
    if (!lead) return;
    
    const { error } = await LeadService.updateNotes(lead.id, lead.notes || "");
    
    if (error) {
      console.error("Error guardando notas:", error);
      alert("Error al guardar notas");
      return;
    }

    alert("✅ Notas guardadas correctamente");
  };

  // Guardar perfil
  const handleSaveProfile = () => {
    localStorage.setItem("maestroProfile", JSON.stringify(profileData));
    setShowProfile(false);
  };

  // Subir imagen del maestro
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen debe ser menor a 2MB");
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten imágenes");
        return;
      }
      
      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar archivos adjuntos (imagen/audio solamente)
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo debe ser menor a 10MB");
      return;
    }

    // Validar tipo
    const validTypes = type === "image" 
      ? ["image/jpeg", "image/png", "image/gif", "image/webp"]
      : ["video/mp4", "video/webm", "video/ogg"];
    
    if (!validTypes.includes(file.type)) {
      alert(`Tipo de archivo no válido para ${type}`);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({
        type,
        url: reader.result as string,
        file
      });
    };
    reader.readAsDataURL(file);
  };

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
        
        // Convertir a base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview({
            type: "audio",
            url: reader.result as string,
            file: new File([audioBlob], "audio.webm", { type: "audio/webm" })
          });
        };
        reader.readAsDataURL(audioBlob);

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

  const handleSendMedia = async () => {
    if (!mediaPreview || !lead) return;

    try {
      const createdMessage = await MessageService.create({
        lead_id: lead.id,
        text: `[${mediaPreview.type}]`,
      });

      if (createdMessage) {
        setMessages((prev) => [...prev, createdMessage]);
      }

      setMediaPreview(null);

      // Actualizar estado del lead si es necesario
      if (lead.status === "nuevo") {
        await LeadService.updateStatus(lead.id, "enConversacion");
        setLead({ ...lead, status: "enConversacion" });
      }
    } catch (error) {
      console.error("Error enviando media:", error);
      alert("Error al enviar archivo");
    }
  };

  // Cancelar preview
  const cancelMediaPreview = () => {
    setMediaPreview(null);
  };

  if (!leadId) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <Sparkles className="w-16 h-16 text-gold animate-pulse mx-auto" />
          <p className="text-muted-foreground text-lg">Cargando conversación espiritual...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando conversación espiritual...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-serif text-gold mb-2">Lead no encontrado</h2>
          <p className="text-sm text-muted-foreground mb-6">
            No se pudo encontrar la conversación solicitada. 
            Puede que haya sido eliminada o el enlace sea incorrecto.
          </p>
          <button
            onClick={() => router.push("/Suafazon/dashboard")}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header elegante */}
      <div className="bg-gradient-to-r from-black via-[hsl(260,30%,8%)] to-black backdrop-blur-xl border-b border-gold/20 px-3 md:px-6 py-3 md:py-4 shadow-2xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => router.push("/Suafazon/dashboard")}
              className="p-1.5 md:p-2 hover:bg-gold/20 rounded-xl transition-all duration-300 flex-shrink-0 border border-gold/20"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gold" />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm md:text-lg font-serif font-bold text-gold truncate">
                {lead?.name}
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground truncate flex items-center gap-1">
                <Phone className="w-3 h-3 text-green-500" />
                {lead?.whatsapp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
            <button
              onClick={handleFavoriteToggle}
              className="p-2 hover:bg-gold/20 rounded-xl transition-all duration-300 border border-gold/20"
            >
              <Star className={`w-4 h-4 md:w-5 md:h-5 ${lead?.is_favorite ? "fill-gold text-gold" : "text-muted-foreground"}`} />
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-gold/20 rounded-xl transition-all duration-300 border border-gold/20"
            >
              <User className="w-4 h-4 text-gold" />
            </button>

            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-1 md:gap-3 hover:bg-gold/20 px-2 md:px-3 py-2 rounded-xl transition-all duration-300 border border-gold/20"
            >
              <span className="text-[10px] md:text-sm font-medium text-foreground hidden sm:block">{profileData.name}</span>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-gold/30 ring-2 ring-gold/20">
                <img
                  src={profileData.avatar}
                  alt="Maestro"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor principal con flex */}
      <div className="flex flex-1 overflow-hidden">
        {/* Área de mensajes - SCROLL AUTOMÁTICO */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          {/* Overlay oscuro sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(260,20%,5%)] to-[hsl(260,30%,8%)] opacity-80 pointer-events-none" />
          
          {/* Mensajes con scroll automático */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 relative z-10">
            {messages.map((msg) => {
              const isFromMaestro = msg.is_from_maestro;
              const isRead = msg.read_at !== null;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isFromMaestro ? "justify-end" : "justify-start"} group`}
                >
                  <div
                    className={`relative max-w-[90%] sm:max-w-[85%] md:max-w-[60%] rounded-2xl p-2.5 sm:p-3 md:p-4 shadow-lg transition-all duration-300 ${
                      isFromMaestro
                        ? "bg-gradient-to-br from-amber-400 via-gold to-amber-600 text-black shadow-gold/20 border border-amber-500/50 rounded-br-sm"
                        : "bg-[hsl(260,20%,14%)] border border-gold/30 text-foreground shadow-md rounded-bl-sm"
                    }`}
                  >
                    {!isFromMaestro && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gold/10">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                          <span className="text-gold font-bold text-xs">{lead?.name?.charAt(0) || "U"}</span>
                        </div>
                        <span className="text-xs font-semibold text-gold truncate">{lead?.name}</span>
                      </div>
                    )}

                    {msg.media_url ? (
                      <div className="space-y-2">
                        {msg.media_type === "image" && (
                          <div className="group/img relative">
                            <img 
                              src={msg.media_url} 
                              alt="Imagen" 
                              className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-95 transition-all shadow-lg border border-black/20" 
                              onClick={() => setViewingImage(msg.media_url!)} 
                            />
                            <a
                              href={msg.media_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black rounded-lg opacity-0 group-hover/img:opacity-100 transition-all border border-gold/30"
                            >
                              <Download className="w-3.5 h-3.5 text-gold" />
                            </a>
                          </div>
                        )}
                        {msg.media_type === "audio" && (
                          <div className={`p-2 rounded-lg ${isFromMaestro ? "bg-black/20" : "bg-black/40"}`}>
                            <audio src={msg.media_url} controls className="w-full h-8" />
                          </div>
                        )}
                      </div>
                    ) : null}

                    {msg.text && (
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isFromMaestro ? "font-medium" : "font-normal text-foreground/90"
                      } ${msg.media_url ? "mt-2" : ""}`}>
                        {msg.text}
                      </p>
                    )}

                    <div className={`flex items-center gap-1.5 mt-2 ${isFromMaestro ? "justify-end text-black/60" : "justify-start text-muted-foreground/50"}`}>
                      <p className="text-[10px] font-semibold">
                        {new Date(msg.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {isFromMaestro && (
                        <span className={`text-xs font-bold ${isRead ? "text-blue-600" : "text-black/40"}`}>
                          {isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                      
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 ml-auto p-1 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <X className={`w-3 h-3 ${isFromMaestro ? "text-red-700" : "text-red-400"}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensaje - FIJO ABAJO */}
          <div className="border-t border-gold/10 bg-black/95 backdrop-blur-xl p-2 md:p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative z-20">
            {/* Preview de multimedia */}
            <AnimatePresence>
              {mediaPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-3 md:mb-4 p-3 md:p-4 bg-card/80 backdrop-blur-md rounded-3xl border-2 border-gold/30 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    <div className="flex-1">
                      {mediaPreview.type === "image" && (
                        <div className="relative rounded-xl overflow-hidden border-2 border-gold/20 shadow-lg">
                          <img
                            src={mediaPreview.url}
                            alt="Preview"
                            className="w-full max-w-[200px] md:max-w-xs rounded-xl"
                          />
                          <div className="absolute top-2 right-2">
                            <div className="px-2 py-1 md:px-3 md:py-1.5 bg-black/80 rounded-lg text-[10px] md:text-xs text-gold font-medium border border-gold/30">
                              Imagen
                            </div>
                          </div>
                        </div>
                      )}
                      {mediaPreview.type === "audio" && (
                        <div className="p-3 rounded-xl shadow-inner bg-black/20 border border-gold/20">
                          <audio src={mediaPreview.url} controls className="w-full h-10" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={cancelMediaPreview}
                      className="p-1.5 md:p-2 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/50"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground hover:text-red-400" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3 md:mt-4">
                    <button
                      onClick={cancelMediaPreview}
                      className="flex-1 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-gold/30 transition-all text-xs md:text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSendMedia}
                      className="flex-1 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-gradient-to-r from-gold via-amber-500 to-amber-600 hover:from-amber-500 hover:to-gold text-black font-medium hover:shadow-lg hover:shadow-gold/20 transition-all text-xs md:text-sm border-2 border-gold/50"
                    >
                      Enviar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs ocultos para archivos */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileAttach(e, "image")}
              className="hidden"
              id="image-upload"
            />
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileAttach(e, "audio")}
              className="hidden"
              id="audio-upload"
            />

            <div className="flex items-end gap-1.5 sm:gap-2">
              {/* Botones multimedia */}
              <div className="flex gap-1 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => document.getElementById("image-upload")?.click()}
                  className="p-2 sm:p-2.5 md:p-2.5 bg-gradient-to-br from-card to-secondary hover:from-gold/20 hover:to-gold/10 rounded-xl transition-all group border-2 border-gold/20 hover:border-gold/40 shadow-lg hover:shadow-gold/20"
                  title="Enviar imagen"
                >
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gold group-hover:text-amber-300 transition-colors" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 sm:p-2.5 md:p-2.5 rounded-xl transition-all group border-2 shadow-lg ${
                    isRecording 
                      ? "bg-red-500/30 border-red-500/60 shadow-red-500/20" 
                      : "bg-gradient-to-br from-card to-secondary border-gold/20 hover:border-gold/40 hover:from-gold/20 hover:to-gold/10 hover:shadow-gold/20"
                  }`}
                  title={isRecording ? "Detener grabación" : "Grabar audio"}
                >
                  <Mic className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    isRecording 
                      ? "text-red-400 animate-pulse" 
                      : "text-gold group-hover:text-amber-300"
                  }`} />
                </motion.button>
              </div>

              {/* Input de texto */}
              <div className="flex-1 min-w-0">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="w-full bg-[hsl(260,20%,12%)] border border-gold/20 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition-all resize-none shadow-inner"
                  style={{ minHeight: "40px", maxHeight: "100px" }}
                />
              </div>

              {/* Botón enviar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSending}
                className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-gold via-amber-500 to-amber-600 hover:from-amber-500 hover:to-gold text-black rounded-xl hover:shadow-md hover:shadow-gold/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Panel lateral - Atributos del Alma */}
        <AnimatePresence>
          {(showSidebar || !isMobile) && (
            <motion.div
              initial={isMobile ? { x: "100%" } : false}
              animate={isMobile ? { x: 0 } : {}}
              exit={isMobile ? { x: "100%" } : {}}
              transition={{ type: "spring", damping: 25 }}
              className={`${
                isMobile 
                  ? "fixed inset-0 z-50 bg-[hsl(260,35%,10%)]"
                  : "w-80 border-l-2 border-gold/20"
              } bg-gradient-to-b from-[hsl(260,35%,12%)] to-[hsl(260,40%,10%)] overflow-y-auto`}
            >
              {/* Header móvil */}
              {isMobile && (
                <div className="sticky top-0 bg-gradient-to-r from-secondary/95 to-card/95 backdrop-blur-xl border-b border-gold/20 p-4 flex items-center justify-between z-10">
                  <h3 className="text-lg font-serif font-bold text-gold">Atributos del Alma</h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gold/20 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5 text-gold" />
                  </button>
                </div>
              )}

              <div className="p-4 md:p-6 space-y-6">
                {/* Motivo de consulta */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gold uppercase tracking-wider">
                    Motivo de Consulta
                  </label>
                  <div className="p-3 bg-card/50 rounded-xl border border-gold/20">
                    <p className="text-sm text-foreground/80">{lead?.problem || "No especificado"}</p>
                  </div>
                </div>

                {/* Estado del ritual */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gold uppercase tracking-wider">
                    Estado del Ritual
                  </label>
                  <select
                    value={lead?.status || "nuevo"}
                    onChange={(e) => handleUpdateLead({ status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-card/50 border border-gold/20 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm"
                  >
                    <option value="nuevo">● Nuevo</option>
                    <option value="en_conversacion">● En Conversación</option>
                    <option value="cliente_caliente">● Cliente Caliente</option>
                    <option value="listo">● Listo</option>
                    <option value="cerrado">● Cerrado</option>
                    <option value="perdido">● Perdido</option>
                  </select>
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <label className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                    WhatsApp
                  </label>
                  <a
                    href={`https://wa.me/${lead?.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 rounded-xl border border-green-500/30 transition-all text-green-400 text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    {lead?.whatsapp}
                  </a>
                </div>

                {/* Notas internas */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gold uppercase tracking-wider">Notas Internas</label>
                  <textarea
                    value={lead?.notes || ""}
                    onChange={(e) => handleUpdateLead({ notes: e.target.value })}
                    onBlur={handleSaveNotes}
                    placeholder="Añade anotaciones..."
                    className="w-full px-4 py-3 bg-card/50 border border-gold/20 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none text-sm"
                    rows={4}
                  />
                </div>

                {/* Botón marcar como listo */}
                <button
                  onClick={() => handleUpdateLead({ status: "listo" })}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marcar como Listo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Perfil del Maestro */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-card rounded-2xl p-8 border border-gold/30 relative"
              style={{
                boxShadow: "0 0 50px hsl(var(--gold) / 0.3)",
              }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Título */}
              <h2 className="text-2xl font-serif text-gold text-center mb-8 tracking-wider">
                PERFIL SAGRADO
              </h2>

              {/* Avatar */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full overflow-hidden border-2 border-gold/50"
                    style={{
                      boxShadow: "0 0 30px hsl(var(--gold) / 0.4)",
                    }}
                  >
                    <img
                      src={profileData.avatar}
                      alt="Maestro"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-background" />
                  </div>
                </div>
              </div>

              {/* Formulario editable */}
              <div className="space-y-6">
                {/* Upload de Foto */}
                <div className="space-y-2">
                  <label className="text-xs text-gold tracking-wider uppercase flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" />
                    Foto del Maestro
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload-chat"
                    />
                    <label
                      htmlFor="avatar-upload-chat"
                      className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground hover:bg-muted/70 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Seleccionar imagen
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tamaño máximo: 2MB
                  </p>
                </div>

                {/* Nombre del Maestro */}
                <div className="space-y-2">
                  <label className="text-xs text-gold/60 tracking-[0.2em] uppercase flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Nombre del Maestro
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                </div>

                {/* Texto del Header */}
                <div className="space-y-2">
                  <label className="text-xs text-gold/60 tracking-[0.2em] uppercase flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Estado / Texto del Header
                  </label>
                  <input
                    type="text"
                    value={profileData.headerText}
                    onChange={(e) => setProfileData({ ...profileData, headerText: e.target.value })}
                    placeholder="Ej: CANAL SAGRADO, VISIÓN ESPIRITUAL, etc."
                    className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowProfile(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-gold/30 text-muted-foreground hover:text-foreground hover:border-gold/50 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    GUARDAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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