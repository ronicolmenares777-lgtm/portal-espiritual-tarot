import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { mockLeads, mockQuickResponses } from "@/lib/mockData";
import type { Lead, QuickResponse } from "@/types/admin";
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
  Video
} from "lucide-react";
import Link from "next/link";

export default function ChatView() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{
    type: "image" | "video" | "audio";
    url: string;
    file: File;
  } | null>(null);
  const [profileData, setProfileData] = useState({
    name: "Maestro Espiritual",
    headerText: "CANAL SAGRADO",
    email: "admin@tarot.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces"
  });

  // Referencias
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cargar lead y perfil
  useEffect(() => {
    if (id) {
      const foundLead = mockLeads.find(l => l.id === id);
      if (foundLead) {
        setLead(foundLead);
      }
    }
    
    // Cargar perfil desde localStorage
    const savedProfile = localStorage.getItem("maestroProfile");
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, [id]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !lead) return;
    
    // Mock: agregar mensaje (en producción se guardará en Supabase)
    const newMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isFromMaestro: true,
      isUser: false,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    setLead({
      ...lead,
      messages: [...(lead.messages || []), newMessage]
    });
    
    setMessageInput("");
  };

  const handleQuickResponse = (message: string) => {
    handleSendMessage(message);
    setShowQuickResponses(false);
  };

  const handleStatusChange = (newStatus: Lead["status"]) => {
    if (!lead) return;
    setLead({ ...lead, status: newStatus });
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

  // Enviar mensaje multimedia
  const handleSendMedia = () => {
    if (!mediaPreview || !lead) return;

    const newMessage = {
      id: Date.now().toString(),
      text: mediaPreview.type === "audio" ? "Audio" : mediaPreview.type === "video" ? "Video" : "Imagen",
      type: mediaPreview.type,
      mediaUrl: mediaPreview.url,
      isFromMaestro: true,
      isUser: false,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setLead({
      ...lead,
      messages: [...(lead.messages || []), newMessage]
    });

    setMediaPreview(null);
  };

  // Cancelar preview
  const cancelMediaPreview = () => {
    setMediaPreview(null);
  };

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold text-4xl mb-4">✨</div>
          <p className="text-muted-foreground">Cargando alma...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Chat con ${lead?.name || "Lead"}`}
        description="Gestión de conversación espiritual"
      />
      <CustomCursor />
      <FloatingParticles />

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-black border-b border-gold/20 px-3 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => router.push("/Suafazon/dashboard")}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground hover:text-gold" />
              </button>
              <div>
                <h2 className="text-sm md:text-base font-medium text-foreground truncate max-w-[150px] md:max-w-none">
                  {lead?.name}
                </h2>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {lead?.whatsapp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Botón para mostrar panel lateral en móvil */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-gold" />
              </button>

              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 md:gap-3 hover:bg-muted/50 px-2 md:px-3 py-2 rounded-lg transition-colors"
              >
                <span className="text-xs md:text-sm hidden sm:block">{profileData.name}</span>
                <div className="w-7 h-7 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-gold/30">
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
            {/* Área de mensajes */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-black/30 to-transparent">
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {/* Mensajes mock */}
                    {!lead.messages || lead.messages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">💫</div>
                        <p className="text-muted-foreground text-sm">
                          Aún no hay mensajes. Inicia la conversación espiritual.
                        </p>
                      </div>
                    ) : (
                      lead.messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-md rounded-2xl overflow-hidden ${
                              msg.isUser
                                ? "bg-gold/10 text-foreground ml-12"
                                : "bg-muted/50 text-foreground mr-12"
                            }`}
                          >
                            {/* Contenido del mensaje */}
                            {msg.type === "image" && msg.mediaUrl && (
                              <img
                                src={msg.mediaUrl}
                                alt="Imagen enviada"
                                className="w-full max-w-sm rounded-t-2xl"
                              />
                            )}
                            {msg.type === "video" && msg.mediaUrl && (
                              <video
                                src={msg.mediaUrl}
                                controls
                                className="w-full max-w-sm rounded-t-2xl"
                              />
                            )}
                            {msg.type === "audio" && msg.mediaUrl && (
                              <div className="px-4 py-3">
                                <audio
                                  src={msg.mediaUrl}
                                  controls
                                  className="w-full"
                                />
                              </div>
                            )}
                            {(!msg.type || msg.type === "text") && (
                              <div className="px-4 py-3">
                                <p className="text-sm">{msg.text}</p>
                              </div>
                            )}
                            
                            {/* Timestamp */}
                            <div className="px-4 pb-2">
                              <span className="text-xs text-muted-foreground">
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/95 border-t border-gold/20">
                  <div className="max-w-3xl mx-auto">
                    {/* Quick Responses Toggle */}
                    <div className="mb-3 flex justify-between items-center">
                      <button
                        onClick={() => setShowQuickResponses(!showQuickResponses)}
                        className="text-xs text-gold/60 hover:text-gold transition-colors flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3" />
                        Respuestas rápidas
                      </button>
                    </div>

                    {/* Quick Responses */}
                    <AnimatePresence>
                      {showQuickResponses && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2">
                            {mockQuickResponses.slice(0, 6).map((qr) => (
                              <button
                                key={qr.id}
                                onClick={() => handleQuickResponse(qr.message)}
                                className="px-3 py-1.5 bg-card/50 hover:bg-gold/20 border border-gold/20 rounded-full text-xs text-foreground transition-all"
                              >
                                {qr.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Input de mensaje */}
                    <div className="border-t border-border bg-card p-4">
                      {/* Preview de multimedia */}
                      <AnimatePresence>
                        {mediaPreview && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mb-4 p-4 bg-muted/50 rounded-xl border border-gold/20"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                {mediaPreview.type === "image" && (
                                  <img
                                    src={mediaPreview.url}
                                    alt="Preview"
                                    className="w-full max-w-xs rounded-lg"
                                  />
                                )}
                                {mediaPreview.type === "video" && (
                                  <video
                                    src={mediaPreview.url}
                                    controls
                                    className="w-full max-w-xs rounded-lg"
                                  />
                                )}
                                {mediaPreview.type === "audio" && (
                                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                                    <Mic className="w-5 h-5 text-gold" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">Audio grabado</p>
                                      <audio
                                        src={mediaPreview.url}
                                        controls
                                        className="w-full mt-2"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={cancelMediaPreview}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={cancelMediaPreview}
                                className="flex-1 px-4 py-2 rounded-lg border border-gold/30 text-muted-foreground hover:text-foreground hover:border-gold/50 transition-all text-sm"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleSendMedia}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all text-sm"
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

                      <div className="flex items-end gap-2">
                        {/* Botones de adjuntar */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => document.getElementById("image-upload")?.click()}
                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                            title="Enviar imagen"
                          >
                            <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                          </button>
                          <button
                            onClick={() => document.getElementById("video-upload")?.click()}
                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                            title="Enviar video"
                          >
                            <Paperclip className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                          </button>
                          <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-2 hover:bg-muted/50 rounded-lg transition-colors group ${
                              isRecording ? "bg-red-500/20" : ""
                            }`}
                            title={isRecording ? "Detener grabación" : "Grabar audio"}
                          >
                            <Mic className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                              isRecording 
                                ? "text-red-500 animate-pulse" 
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
                            className="w-full bg-muted/30 border border-gold/20 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition-all resize-none"
                            style={{ minHeight: "40px", maxHeight: "120px" }}
                          />
                        </div>

                        {/* Botón enviar */}
                        <button
                          onClick={() => handleSendMessage(messageInput)}
                          disabled={!messageInput.trim()}
                          className="p-2 md:p-3 bg-gradient-to-r from-gold to-accent text-background rounded-xl hover:shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Atributos del Alma */}
              <div className="w-96 bg-black/95 border-l border-gold/20 p-6 overflow-y-auto">
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
                      Desde hace {lead.createdAt}
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

                  {/* Marcar como Listo */}
                  <button 
                    onClick={() => handleStatusChange("listo")}
                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-lg py-3 text-sm font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marcar como Listo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel lateral derecho - Atributos del Alma */}
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
              Desde hace {lead.createdAt}
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

          {/* Marcar como Listo */}
          <button 
            onClick={() => handleStatusChange("listo")}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-lg py-3 text-sm font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar como Listo
          </button>
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
    </>
  );
}