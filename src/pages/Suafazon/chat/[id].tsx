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
import {
  ArrowLeft,
  Send,
  Mic,
  Paperclip,
  Star,
  Phone,
  X,
  Circle,
  CheckCircle,
  User,
  Mail,
  Save,
  Sparkles,
  ImageIcon,
  MessageCircle,
  FileText,
  Download
} from "lucide-react";
import Link from "next/link";

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
  const [newMessage, setNewMessage] = useState("");
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
    type: "image" | "video" | "audio";
    url: string;
    file?: File;
  } | null>(null);
  const [profileData, setProfileData] = useState({
    name: "Maestro Espiritual",
    email: "maestro@portal.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro",
    headerText: ""
  });
  const [viewingImage, setViewingImage] = useState<string | null>(null);
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

  // Cargar datos iniciales y configurar suscripción realtime
  useEffect(() => {
    if (!leadId) return;

    let isMounted = true;
    let channelSubscription: any = null;

    const initializeChat = async () => {
      console.log("🔄 Iniciando chat del administrador para lead:", leadId);

      try {
        // Cargar datos del lead
        const { data: leadData, error: leadError } = await LeadService.getById(leadId);
        if (leadError) throw leadError;
        if (!isMounted) return;
        
        if (!leadData) {
          console.error("❌ Lead no encontrado");
          return;
        }
        setLead(leadData);
        console.log("✅ Lead cargado:", leadData);

        // Cargar mensajes existentes
        const messagesData = await MessageService.getByLeadId(leadId);
        if (!isMounted) return;
        
        setMessages(messagesData);
        console.log("✅ Mensajes cargados:", messagesData.length);

        // Marcar como leídos los mensajes del usuario
        MessageService.markAsRead(leadId, true).catch(console.error);

        // --- SOLUCIÓN AL ERROR DE SUSCRIPCIÓN ---
        const channelName = `admin-messages-${leadId}`;
        const existingChannels = supabase.getChannels();
        existingChannels.forEach((ch) => {
          if (ch.topic === `realtime:${channelName}`) {
            console.log("🧹 Limpiando canal huérfano previo admin:", channelName);
            supabase.removeChannel(ch);
          }
        });

        // Configurar suscripción en tiempo real
        console.log("🔌 Configurando suscripción realtime para admin");
        
        const realtimeChannel = supabase.channel(channelName);
        
        realtimeChannel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `lead_id=eq.${leadId}`,
          },
          (payload) => {
            console.log("🔔 Cambio detectado:", payload.eventType);
            
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as Message;
              console.log("📨 Nuevo mensaje recibido:", newMessage);
              
              setMessages((prev) => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
              });

              // Si es del usuario y estamos con el chat abierto, marcar como leído
              if (!newMessage.is_from_maestro) {
                MessageService.markAsRead(leadId, true).catch(console.error);
              }
            } else if (payload.eventType === "UPDATE") {
              const updatedMessage = payload.new as Message;
              setMessages((prev) => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
            }
          }
        );
        
        realtimeChannel.subscribe((status) => {
          if (!isMounted) return;
          console.log("📡 Estado de suscripción realtime:", status);
          if (status === "SUBSCRIBED") {
            console.log("✅ Suscripción realtime activa para admin");
          }
        });
        
        channelSubscription = realtimeChannel;

      } catch (error) {
        console.error("❌ Error inicializando chat:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();

    // Cleanup
    return () => {
      isMounted = false;
      if (channelSubscription) {
        console.log("🔌 Cerrando suscripción realtime del admin");
        supabase.removeChannel(channelSubscription);
      }
    };
  }, [leadId]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || messageInput;
    if (!messageText.trim() || !id || typeof id !== "string") return;

    setMessageInput("");

    try {
      const createdMessage = await MessageService.create({
        lead_id: id,
        text: messageText.trim(),
        is_from_maestro: true,
      });

      if (createdMessage) {
        setMessages((prev) => [...prev, createdMessage]);
      }
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      setMessageInput(messageText);
    }
  };

  const handleQuickResponse = async (text: string) => {
    if (!id || typeof id !== "string") return;

    try {
      const createdMessage = await MessageService.create({
        lead_id: id,
        text,
        is_from_maestro: true,
      });

      if (createdMessage) {
        setMessages((prev) => [...prev, createdMessage]);
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

  // Manejar archivos adjuntos (imagen/video)
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
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
        text: "",
        media_url: mediaPreview.url,
        media_type: mediaPreview.type,
        is_from_maestro: true
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
    <>
      <SEO
        title="Chat - Portal Espiritual Admin"
        description="Conversación con cliente"
      />

      {/* Cursor personalizado DESHABILITADO en admin */}
      {/* <CustomCursor /> */}
      <FloatingParticles />

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-black border-b border-gold/20 px-2 md:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.push("/Suafazon/dashboard")}
                className="p-1.5 md:p-2 hover:bg-muted/50 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground hover:text-gold" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-xs md:text-base font-medium text-foreground truncate">
                  {lead?.name}
                </h2>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                  {lead?.whatsapp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              {/* Botón para mostrar panel lateral en móvil */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-1.5 md:p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-gold" />
              </button>

              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-1 md:gap-3 hover:bg-muted/50 px-1.5 md:px-3 py-1.5 md:py-2 rounded-lg transition-colors"
              >
                <span className="text-[10px] md:text-sm hidden sm:block">{profileData.name}</span>
                <div className="w-6 h-6 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-gold/30">
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

        {/* Main Content */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Layout del chat */}
          <div className="flex h-[calc(100vh-57px)] md:h-[calc(100vh-65px)] overflow-hidden">
            {/* Área de mensajes - siempre visible */}
            <div className="flex-1 flex flex-col min-w-0 bg-[hsl(260,35%,12%)]">
              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                      <div className={`flex gap-3 max-w-[70%] ${isFromMaestro ? "flex-row-reverse" : "flex-row"}`}>
                        {!isFromMaestro && lead && (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {isFromMaestro && (
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold/30">
                            <img
                              src={maestroAvatar}
                              alt="Maestro"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="relative flex-1">
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              isFromMaestro
                                ? "bg-primary/20 text-foreground"
                                : "bg-secondary/50 text-foreground"
                            }`}
                          >
                            {msg.media_url ? (
                              <div className="space-y-2">
                                {msg.media_type === "image" && (
                                  <img 
                                    src={msg.media_url} 
                                    alt="Imagen" 
                                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition" 
                                    onClick={() => setViewingImage(msg.media_url!)} 
                                  />
                                )}
                                {msg.media_type === "video" && (
                                  <video src={msg.media_url} controls className="rounded-lg max-w-full h-auto" />
                                )}
                                {msg.media_type === "audio" && (
                                  <audio src={msg.media_url} controls className="w-full" />
                                )}
                                {msg.media_type === "file" && (
                                  <a
                                    href={msg.media_url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-muted/80 transition"
                                  >
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm font-medium">Descargar archivo</span>
                                    <Download className="w-4 h-4 ml-auto" />
                                  </a>
                                )}
                                {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            )}
                          </div>

                          {/* Timestamp, checkmarks y botón eliminar */}
                          <div className={`flex items-center gap-2 mt-1 px-2 ${isFromMaestro ? "justify-end" : "justify-start"}`}>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {isFromMaestro && (
                              <div className="flex items-center">
                                {isRead ? (
                                  <span className="text-blue-500 text-[12px] font-bold tracking-tighter leading-none">✓✓</span>
                                ) : (
                                  <span className="text-muted-foreground text-[12px] font-bold tracking-tighter leading-none">✓</span>
                                )}
                              </div>
                            )}
                            
                            {/* Botón eliminar - solo visible al hacer hover */}
                            <button
                              onClick={async () => {
                                if (confirm("¿Eliminar este mensaje?")) {
                                  try {
                                    await MessageService.delete(msg.id);
                                    setMessages(prev => prev.filter(m => m.id !== msg.id));
                                  } catch (error) {
                                    console.error("Error eliminando mensaje:", error);
                                    alert("Error al eliminar mensaje");
                                  }
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
                              title="Eliminar mensaje"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensaje */}
              <div className="border-t-2 border-gold/20 bg-[hsl(260,35%,14%)] p-2 md:p-4 shadow-2xl">
                {/* Preview de multimedia */}
                <AnimatePresence>
                  {mediaPreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mb-2 md:mb-4 p-3 md:p-4 bg-[hsl(260,40%,18%)] rounded-xl border-2 border-gold/30 backdrop-blur-sm shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-2 md:gap-4">
                        <div className="flex-1">
                          {mediaPreview.type === "image" && (
                            <div className="relative rounded-lg overflow-hidden border-2 border-gold/20">
                              <img
                                src={mediaPreview.url}
                                alt="Preview"
                                className="w-full max-w-[200px] md:max-w-xs rounded-lg"
                              />
                              <div className="absolute top-1 right-1 md:top-2 md:right-2">
                                <div className="px-2 py-1 md:px-3 md:py-1.5 bg-black/80 rounded-lg text-[10px] md:text-xs text-gold font-medium border border-gold/30">
                                  Imagen
                                </div>
                              </div>
                            </div>
                          )}
                          {mediaPreview.type === "video" && (
                            <div className="relative rounded-lg overflow-hidden border-2 border-gold/20">
                              <video
                                src={mediaPreview.url}
                                controls
                                className="w-full max-w-[200px] md:max-w-xs rounded-lg"
                              />
                              <div className="absolute top-1 right-1 md:top-2 md:right-2">
                                <div className="px-2 py-1 md:px-3 md:py-1.5 bg-black/80 rounded-lg text-[10px] md:text-xs text-gold font-medium border border-gold/30">
                                  Video
                                </div>
                              </div>
                            </div>
                          )}
                          {mediaPreview.type === "audio" && (
                            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-[hsl(260,35%,16%)] rounded-lg border-2 border-gold/30">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/40">
                                <Mic className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1 text-gold">Audio grabado</p>
                                <audio
                                  src={mediaPreview.url}
                                  controls
                                  className="w-full"
                                />
                              </div>
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
                      <div className="flex gap-2 mt-2 md:mt-4">
                        <button
                          onClick={cancelMediaPreview}
                          className="flex-1 px-3 py-2 md:px-4 md:py-2.5 rounded-lg border-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-gold/30 transition-all text-xs md:text-sm font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSendMedia}
                          className="flex-1 px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all text-xs md:text-sm border-2 border-gold/50"
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
                  accept="video/*"
                  onChange={(e) => handleFileAttach(e, "video")}
                  className="hidden"
                  id="video-upload"
                />

                <div className="flex items-end gap-1.5 md:gap-2.5">
                  {/* Botones de adjuntar */}
                  <div className="flex gap-0.5 md:gap-1.5">
                    <button
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="p-1.5 md:p-2.5 hover:bg-gold/20 rounded-lg transition-all group border-2 border-transparent hover:border-gold/40 shadow-sm"
                      title="Enviar imagen"
                    >
                      <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                    </button>
                    <button
                      onClick={() => document.getElementById("video-upload")?.click()}
                      className="p-1.5 md:p-2.5 hover:bg-gold/20 rounded-lg transition-all group border-2 border-transparent hover:border-gold/40 shadow-sm"
                      title="Enviar video"
                    >
                      <Paperclip className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                    </button>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-1.5 md:p-2.5 rounded-lg transition-all group border-2 shadow-sm ${
                        isRecording 
                          ? "bg-red-500/30 border-red-500/60 shadow-red-500/20" 
                          : "border-transparent hover:border-gold/40 hover:bg-gold/20"
                      }`}
                      title={isRecording ? "Detener grabación" : "Grabar audio"}
                    >
                      <Mic className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                        isRecording 
                          ? "text-red-400 animate-pulse" 
                          : "text-muted-foreground group-hover:text-gold"
                      }`} />
                    </button>
                  </div>

                  {/* Input de texto */}
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(messageInput);
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      rows={1}
                      className="w-full bg-[hsl(260,40%,18%)] border-2 border-gold/20 rounded-xl px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all resize-none shadow-md"
                      style={{ minHeight: "36px", maxHeight: "100px" }}
                    />
                  </div>

                  {/* Botón enviar */}
                  <button
                    onClick={() => handleSendMessage(messageInput)}
                    disabled={!messageInput.trim()}
                    className="p-2 md:p-3 bg-gradient-to-r from-gold to-accent text-background rounded-xl hover:shadow-xl hover:shadow-gold/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none border-2 border-gold/50 disabled:border-gold/20"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Panel lateral derecho - Atributos del Alma */}
            {/* Overlay para móvil */}
            {showSidebar && (
              <div
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={() => setShowSidebar(false)}
              />
            )}
            
            <div className={`
              fixed lg:relative inset-y-0 right-0 z-50
              w-80 md:w-96
              bg-card/30 border-l border-gold/20 p-4 md:p-6 overflow-y-auto
              transform transition-transform duration-300 ease-in-out
              ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
              {/* Botón cerrar en móvil */}
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden absolute top-4 right-4 p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="space-y-6">
                {/* Avatar y Estrella */}
                <div className="text-center space-y-4">
                  <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                    Atributos del Alma
                  </p>
                  
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-purple-500/30 flex items-center justify-center">
                        <span className="text-3xl font-serif text-gold">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <button className="absolute -top-2 -right-2 w-10 h-10 bg-black border-2 border-gold/50 rounded-full flex items-center justify-center hover:bg-gold/20 transition-all">
                        <Star className="w-5 h-5 text-gold" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-serif text-gold">{lead.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    Desde hace {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Motivo de Consulta */}
                <div className="space-y-2">
                  <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                    Motivo de Consulta
                  </p>
                  <p className="text-sm text-foreground/80 bg-card/30 rounded-lg p-3 border border-gold/10">
                    "{lead.problem}"
                  </p>
                </div>

                {/* Estado del Ritual */}
                <div className="space-y-3">
                  <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                    Estado del Ritual
                  </p>
                  
                  <div className="space-y-2">
                    {[
                      { value: "nuevo", label: "Nuevo", color: "blue" },
                      { value: "enConversacion", label: "En Conversación", color: "purple" },
                      { value: "clienteCaliente", label: "Cliente Caliente", color: "orange" },
                      { value: "listo", label: "Listo", color: "emerald" },
                      { value: "cerrado", label: "Cerrado", color: "green" },
                      { value: "perdido", label: "Perdido", color: "gray" }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value as Lead["status"])}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          lead.status === status.value
                            ? `bg-${status.color}-500/20 border-2 border-${status.color}-500 text-${status.color}-400`
                            : 'bg-card/30 border border-gold/10 text-muted-foreground hover:bg-card/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Circle className={`w-2 h-2 fill-current ${
                            lead.status === status.value ? `text-${status.color}-400` : 'text-muted-foreground'
                          }`} />
                          <span className="text-sm">{status.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">WhatsApp</p>
                  <div className="flex items-center justify-between bg-card/30 rounded-lg p-3 border border-gold/10">
                    <span className="text-sm text-foreground">{lead.whatsapp}</span>
                    <button className="text-xs text-green-400 hover:text-green-300 transition-colors uppercase tracking-wider">
                      Contactar
                    </button>
                  </div>
                </div>

                {/* Notas Internas */}
                <div className="space-y-2">
                  <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                    Notas Internas
                  </p>
                  <textarea
                    rows={4}
                    value={lead.notes || ""}
                    onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                    placeholder="Añade anotaciones..."
                    className="w-full bg-card/30 border border-gold/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all resize-none"
                  />
                </div>

                {/* Botón Marcar como Listo */}
                <button
                  onClick={handleMarkAsComplete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 transition-all font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  MARCAR COMO LISTO
                </button>
              </div>
            </div>
          </div>
        </div>
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
                  <label className="text-xs text-gold tracking-wider uppercase flex items-center gap-2">
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
                  <label className="text-xs text-gold tracking-wider uppercase flex items-center gap-2">
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
    </>
  );
}