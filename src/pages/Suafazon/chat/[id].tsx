import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Upload,
  Mic,
  MicOff,
  Star,
  Phone,
  User,
  Download,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  lead_id: string;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  is_from_maestro: boolean;
  created_at: string;
};

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  problem: string;
  classification: string | null;
  is_favorite: boolean;
  created_at: string;
  cards_selected: string[];
  answers: any;
  country_code: string;
  last_interaction_at: string;
  status: string;
};

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [maestroProfile, setMaestroProfile] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cargar perfil del maestro al inicio
  useEffect(() => {
    const loadMaestroProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setMaestroProfile(profile);
        console.log("👤 [PROFILE] Perfil del maestro cargado:", profile);
      }
    };

    loadMaestroProfile();
  }, []);

  // Cargar datos del lead
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadLead = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading lead:", error);
        return;
      }

      if (data) {
        setLead(data);
      }
    };

    loadLead();
  }, [id]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      if (data) {
        console.log("🔍 [DEBUG] Mensajes cargados:", data.length);
        data.forEach((msg, idx) => {
          console.log(`📨 [MSG ${idx + 1}]`, {
            id: msg.id.substring(0, 8),
            is_from_maestro: msg.is_from_maestro,
            tipo: msg.is_from_maestro ? "MAESTRO ➡️" : "USUARIO ⬅️",
            text: msg.text?.substring(0, 30) + "..."
          });
        });
        setMessages(data);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  // Auto-scroll solo al cargar el chat inicialmente
  const hasScrolledInitially = useRef(false);

  useEffect(() => {
    if (messages.length > 0 && !hasScrolledInitially.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      hasScrolledInitially.current = true;
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    console.log("📤 [SEND] Enviando mensaje del MAESTRO, lead_id:", lead.id);

    const { data, error } = await supabase.from("messages").insert({
      lead_id: lead.id,
      text: messageText,
      is_from_maestro: true, // CRÍTICO: El maestro envía el mensaje
    }).select();

    if (error) {
      console.error("❌ [SEND] Error sending message:", error);
      setNewMessage(messageText);
    } else {
      console.log("✅ [SEND] Mensaje enviado correctamente:", data);
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
    if (!file || !lead) return;

    console.log("📤 [UPLOAD] Iniciando upload de archivo:", file.name, "Tipo:", file.type);
    setUploading(true);

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log("✅ [UPLOAD] Archivo convertido a base64, tamaño:", base64String.length);

        // Guardar en la columna TEXT con prefijo especial para identificar que es imagen
        const messageContent = `[IMG]${base64String}`;
        
        console.log("📤 [UPLOAD] Enviando mensaje con imagen, lead_id:", lead.id);

        const { data, error: dbError } = await supabase.from("messages").insert({
          lead_id: lead.id,
          text: messageContent,
          is_from_maestro: true,
        }).select();

        if (dbError) {
          console.error("❌ [UPLOAD] Error insertando mensaje:", dbError);
          alert(`Error al enviar archivo: ${dbError.message}`);
        } else {
          console.log("✅ [UPLOAD] Mensaje con imagen enviado exitosamente:", data);
        }

        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        console.error("❌ [UPLOAD] Error leyendo archivo");
        alert("Error al leer el archivo");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ [UPLOAD] Error general:", err);
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
    if (!lead) return;

    setUploading(true);
    console.log("📤 [AUDIO] Procesando audio...");

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log("✅ [AUDIO] Audio convertido a base64");

        // Guardar con prefijo [AUDIO]
        const messageContent = `[AUDIO]${base64String}`;

        const { data, error: dbError } = await supabase.from("messages").insert({
          lead_id: lead.id,
          text: messageContent,
          is_from_maestro: true,
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

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`Chat con ${lead?.name || "Lead"} - Portal Espiritual Admin`}
        description="Chat en vivo con consultante"
      />

      <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Ventana de chat - Diseño mejorado */}
          <div className="bg-card/80 backdrop-blur-sm border-2 border-gold/30 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border p-3 sm:p-4 flex items-center gap-3 shadow-sm">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-accent/20 text-accent">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground truncate text-sm sm:text-base">{lead?.name}</h2>
                <p className="text-xs text-muted-foreground truncate">{lead?.country_code} {lead?.whatsapp}</p>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {messages.map((msg) => {
                const isImage = msg.text?.startsWith("[IMG]");
                const isAudio = msg.text?.startsWith("[AUDIO]");
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 sm:gap-3 ${msg.is_from_maestro ? "justify-start" : "justify-end"}`}
                  >
                    {msg.is_from_maestro && (
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                        msg.is_from_maestro
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground border border-border"
                      }`}
                    >
                      {msg.text && (
                        <p className={`text-sm leading-relaxed ${
                          msg.is_from_maestro ? "text-primary-foreground" : "text-gray-900"
                        }`}>
                          {msg.text}
                        </p>
                      )}
                      {isImage && msg.text?.substring(5) && (
                        <img
                          src={msg.text?.substring(5)}
                          alt="Imagen enviada"
                          className="mt-2 max-w-full max-h-80 rounded-lg"
                        />
                      )}
                      {isAudio && msg.text?.substring(7) && (
                        <audio
                          src={msg.text?.substring(7)}
                          controls
                          className="mt-2 max-w-full"
                        />
                      )}
                      <p className={`text-[10px] mt-2 font-medium ${
                        msg.is_from_maestro ? "text-primary-foreground/80" : "text-gray-500"
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input área */}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} className="sticky bottom-0 bg-card border-t border-border p-3 sm:p-4">
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
                  className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  className={`flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 ${recording ? "text-destructive animate-pulse" : ""}`}
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 text-sm sm:text-base"
                  disabled={sending || uploading}
                />
                
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !newMessage.trim()}
                  className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
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
    </>
  );
}