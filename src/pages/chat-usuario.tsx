import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { Send, Image, Mic, Sparkles, User, Upload, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatUsuario() {
  const router = useRouter();
  const { toast } = useToast();
  const [leadId, setLeadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [maestroProfile, setMaestroProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasScrolledInitially = useRef(false);

  // Obtener lead_id desde URL o localStorage
  useEffect(() => {
    console.log("🔍 [INIT] ========== INICIALIZANDO CHAT ==========");
    
    const getLeadId = () => {
      // Prioridad 1: Desde URL query params
      const urlLeadId = router.query.leadId as string;
      if (urlLeadId) {
        console.log("✅ [INIT] Lead ID desde URL:", urlLeadId);
        return urlLeadId;
      }

      // Prioridad 2: Desde localStorage
      const storedLeadId = localStorage.getItem("currentLeadId");
      if (storedLeadId) {
        console.log("✅ [INIT] Lead ID desde localStorage:", storedLeadId);
        return storedLeadId;
      }

      console.error("❌ [INIT] No se encontró lead_id en URL ni localStorage");
      return null;
    };

    const id = getLeadId();
    console.log("📋 [INIT] Lead ID final establecido:", id);
    setLeadId(id);
  }, [router.query.leadId]);

  // Cargar nombre del usuario y perfil del maestro
  useEffect(() => {
    const loadData = async () => {
      if (!leadId) return;
      const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
      if (!finalLeadId) return;

      // Cargar datos del lead (sin usar el nombre en este componente)
      const { data: leadData } = await supabase
        .from("leads")
        .select("name")
        .eq("id", finalLeadId)
        .single();

      console.log("📋 [LEAD] Datos del lead cargados:", leadData);

      // Cargar perfil del maestro (primer admin)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .limit(1);

      if (profiles && profiles.length > 0) {
        setMaestroProfile(profiles[0]);
      }
    };

    loadData();
  }, [leadId]);

  // Cargar perfil del maestro al inicio
  useEffect(() => {
    const loadMaestroProfile = async () => {
      console.log("👤 [PROFILE] Iniciando carga del perfil del maestro...");
      
      try {
        // Forzar recarga completa sin caché
        const timestamp = Date.now();
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .not("avatar_url", "is", null)
          .limit(1);

        if (error) {
          console.error("❌ [PROFILE] Error cargando perfil:", error);
          return;
        }

        console.log("📊 [PROFILE] Datos recibidos de Supabase:", profiles);

        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          setMaestroProfile(profile);
          console.log("✅ [PROFILE] Perfil del maestro cargado correctamente:");
          console.log("  - ID:", profile.id);
          console.log("  - Nombre:", profile.full_name);
          console.log("  - Avatar URL:", profile.avatar_url);
          console.log("  - Email:", profile.email);
        } else {
          console.log("⚠️ [PROFILE] No se encontró ningún perfil con avatar_url en la tabla profiles");
          
          // Intentar cargar cualquier perfil como fallback
          const { data: anyProfile } = await supabase
            .from("profiles")
            .select("*")
            .limit(1);
          
          if (anyProfile && anyProfile.length > 0) {
            setMaestroProfile(anyProfile[0]);
            console.log("📋 [PROFILE] Cargado perfil sin avatar:", anyProfile[0]);
          }
        }
      } catch (err) {
        console.error("❌ [PROFILE] Error general:", err);
      }
    };

    loadMaestroProfile();
    
    // Recargar perfil cada 5 segundos para obtener actualizaciones
    const interval = setInterval(loadMaestroProfile, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!leadId) return;
    
    const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
    if (!finalLeadId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", finalLeadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      if (data) {
        setMessages(data);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [leadId]);

  // Auto-scroll solo al cargar el chat inicialmente
  useEffect(() => {
    if (messages.length > 0 && !hasScrolledInitially.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      hasScrolledInitially.current = true;
    }
  }, [messages.length]);

  // Enviar mensaje de texto
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      lead_id: leadId,
      text: messageText,
      is_from_maestro: false,
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !leadId) return;

    const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
    if (!finalLeadId) return;

    console.log("📤 [USER-UPLOAD] Iniciando upload de archivo:", file.name);
    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log("✅ [USER-UPLOAD] Archivo convertido a base64");

        const messageContent = `[IMG]${base64String}`;

        const { data, error: dbError } = await supabase.from("messages").insert({
          lead_id: finalLeadId,
          text: messageContent,
          is_from_maestro: false,
        }).select();

        if (dbError) {
          console.error("❌ [USER-UPLOAD] Error insertando mensaje:", dbError);
          alert(`Error al enviar archivo: ${dbError.message}`);
        } else {
          console.log("✅ [USER-UPLOAD] Mensaje con imagen enviado exitosamente");
        }

        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        console.error("❌ [USER-UPLOAD] Error leyendo archivo");
        alert("Error al leer el archivo");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ [USER-UPLOAD] Error general:", err);
      alert("Error al procesar el archivo");
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      console.log("🎤 [AUDIO] Grabación iniciada");
    } catch (err) {
      console.error("❌ [AUDIO] Error iniciando grabación:", err);
      alert("Error al acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      console.log("⏹️ [AUDIO] Grabación detenida");
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    if (!leadId) return;

    const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
    if (!finalLeadId) return;

    setUploading(true);
    console.log("📤 [AUDIO] Procesando audio...");

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log("✅ [AUDIO] Audio convertido a base64");

        const messageContent = `[AUDIO]${base64String}`;

        const { data, error: dbError } = await supabase.from("messages").insert({
          lead_id: finalLeadId,
          text: messageContent,
          is_from_maestro: false,
        }).select();

        if (dbError) {
          console.error("❌ [AUDIO] Error insertando mensaje:", dbError);
          alert(`Error al enviar audio: ${dbError.message}`);
        } else {
          console.log("✅ [AUDIO] Audio enviado exitosamente");
        }

        setUploading(false);
      };

      reader.onerror = () => {
        console.error("❌ [AUDIO] Error leyendo blob");
        setUploading(false);
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error("❌ [AUDIO] Error general:", err);
      setUploading(false);
    }
  };

  // Cargar mensajes
  const loadMessages = async () => {
    if (!leadId) {
      console.log("⚠️ [CHAT] No hay lead_id, esperando...");
      return [];
    }

    console.log("🔄 [CHAT] Cargando mensajes para lead_id:", leadId);

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ [CHAT] Error cargando mensajes:", error);
        return [];
      }

      console.log("📊 [CHAT] Mensajes cargados:", data?.length || 0);
      setMessages(data || []);
      return data || [];
    } catch (err) {
      console.error("❌ [CHAT] Error general cargando mensajes:", err);
      return [];
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Header mejorado */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-gold/20 shadow-lg shadow-gold/5">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            {/* Avatar del maestro mejorado */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-gold/50 via-accent/50 to-gold/50 rounded-full blur-md animate-pulse-glow" />
              <Avatar className="relative h-14 w-14 border-2 border-gold/40">
                {maestroProfile?.avatar_url ? (
                  <img src={maestroProfile.avatar_url} alt="Maestro" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-gold/20 to-accent/20 text-gold">
                    <Sparkles className="h-7 w-7" />
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Indicador en línea */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
            </div>

            {/* Info del maestro */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-xl font-bold text-gold tracking-wide">
                {maestroProfile?.full_name || "Maestro Espiritual"}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                En línea • Responde en minutos
              </p>
            </div>

            {/* Botón WhatsApp mejorado */}
            <motion.a
              href="https://wa.me/message/XH42ORU47RJCF1"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/50 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Área de mensajes mejorada */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.is_from_maestro ? "justify-end" : "justify-start"}`}
          >
            {/* Avatar usuario */}
            {!msg.is_from_maestro && (
              <Avatar className="h-9 w-9 mt-1 flex-shrink-0 border-2 border-accent/20">
                <AvatarFallback className="bg-gradient-to-br from-accent/10 to-accent/20 text-accent">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            )}

            {/* Burbuja de mensaje mejorada */}
            <div
              className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                msg.is_from_maestro
                  ? "bg-gradient-to-br from-gold via-accent to-gold text-background shadow-gold/20"
                  : "bg-card text-foreground border border-border/50 shadow-black/5"
              }`}
            >
              {msg.media_type === "image" && msg.media_url && (
                <div className="rounded-xl overflow-hidden mb-2 border-2 border-white/10">
                  <img
                    src={msg.media_url}
                    alt="Imagen"
                    className="max-w-full h-auto"
                    loading="lazy"
                  />
                </div>
              )}
              {msg.media_type === "audio" && msg.media_url && (
                <audio controls className="mb-2 w-full max-w-xs">
                  <source src={msg.media_url} type="audio/webm" />
                </audio>
              )}
              {msg.text && (
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {msg.text}
                </p>
              )}
              <p className={`text-[10px] mt-1.5 ${msg.is_from_maestro ? "text-background/60" : "text-muted-foreground/60"}`}>
                {formatTime(msg.created_at)}
              </p>
            </div>

            {/* Avatar maestro */}
            {msg.is_from_maestro && (
              <Avatar className="h-9 w-9 mt-1 flex-shrink-0 border-2 border-gold/30">
                {maestroProfile?.avatar_url ? (
                  <img src={maestroProfile.avatar_url} alt="Maestro" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-gold/20 to-accent/20 text-gold">
                    <Sparkles className="h-5 w-5" />
                  </AvatarFallback>
                )}
              </Avatar>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input área mejorada */}
      <div className="sticky bottom-0 bg-card/80 backdrop-blur-xl border-t border-gold/20 shadow-2xl shadow-black/10">
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            
            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-shrink-0 h-10 w-10 rounded-xl hover:bg-gold/10 hover:text-gold transition-all"
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
                className={`flex-shrink-0 h-10 w-10 rounded-xl transition-all ${
                  recording 
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                    : "hover:bg-gold/10 hover:text-gold"
                }`}
              >
                {recording ? (
                  <MicOff className="h-5 w-5 animate-pulse" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Input de texto mejorado */}
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-secondary/30 border-2 border-gold/20 rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/50 focus:bg-secondary/40 transition-all pr-12"
                disabled={sending || uploading}
              />
            </div>
            
            {/* Botón enviar mejorado */}
            <Button
              type="submit"
              size="icon"
              disabled={sending || !newMessage.trim()}
              className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-r from-gold to-accent hover:from-accent hover:to-gold text-background shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all disabled:opacity-50"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>

          {/* Indicador de estado */}
          {(uploading || recording) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              {uploading && "Subiendo archivo..."}
              {recording && "Grabando audio..."}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}