import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Upload,
  Mic,
  Star,
  Phone,
  User,
} from "lucide-react";

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

  // Auto-scroll cuando llegan mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary/20 via-amber-500/20 to-primary/20 border-b-2 border-gold/20 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/Suafazon/dashboard")}
                    className="px-4 py-2 bg-secondary/50 hover:bg-secondary/70 rounded-xl transition-all flex items-center gap-2 border border-border"
                  >
                    ← Volver
                  </button>
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-foreground">
                      {lead?.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {lead?.country_code} {lead?.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Botón de favorito */}
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("leads")
                        .update({ is_favorite: !lead.is_favorite })
                        .eq("id", lead.id);

                      if (!error) {
                        setLead({ ...lead, is_favorite: !lead.is_favorite });
                      }
                    }}
                    className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all ${
                      lead.is_favorite
                        ? "bg-amber-500/20 border-amber-500 text-amber-500"
                        : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {lead.is_favorite ? "⭐ Favorito" : "☆ Marcar favorito"}
                  </button>

                  {/* Selector de estado */}
                  <select
                    value={lead.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      const { error } = await supabase
                        .from("leads")
                        .update({ status: newStatus })
                        .eq("id", lead.id);

                      if (!error) {
                        setLead({ ...lead, status: newStatus });
                      }
                    }}
                    className="px-4 py-2 bg-secondary/50 border-2 border-border rounded-xl font-semibold text-foreground cursor-pointer hover:bg-secondary/70 transition-all"
                  >
                    <option value="nuevo">🆕 Nuevo</option>
                    <option value="enConversacion">💬 En Conversación</option>
                    <option value="clienteCaliente">🔥 Cliente Caliente</option>
                    <option value="listo">✅ Listo</option>
                    <option value="cerrado">🔒 Cerrado</option>
                    <option value="perdido">❌ Perdido</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background/50 to-background/80">
              {messages.map((msg) => {
                // Detectar tipos de mensaje
                const isImage = msg.text?.startsWith("[IMG]");
                const isAudio = msg.text?.startsWith("[AUDIO]");
                const imageData = isImage ? msg.text?.substring(5) : null;
                const audioData = isAudio ? msg.text?.substring(7) : null;
                const textContent = (isImage || isAudio) ? null : msg.text;

                console.log("💬 [MSG-RENDER]", {
                  id: msg.id.substring(0, 8),
                  is_from_maestro: msg.is_from_maestro,
                  tipo: msg.is_from_maestro ? "MAESTRO" : "USUARIO",
                  isImage,
                  isAudio
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.is_from_maestro ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar y nombre - SOLO para usuario (izquierda) */}
                    {!msg.is_from_maestro && (
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/40">
                          {lead?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold max-w-[60px] truncate">
                          {lead?.name || "Usuario"}
                        </span>
                      </div>
                    )}

                    {/* Burbuja de mensaje */}
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${
                        msg.is_from_maestro
                          ? "bg-gradient-to-br from-primary via-amber-500 to-primary text-primary-foreground border-2 border-amber-300"
                          : "bg-white text-gray-900 border-2 border-gray-200"
                      }`}
                    >
                      {textContent && (
                        <p className={`text-sm leading-relaxed ${
                          msg.is_from_maestro ? "text-primary-foreground" : "text-gray-900"
                        }`}>
                          {textContent}
                        </p>
                      )}
                      {isImage && imageData && (
                        <img
                          src={imageData}
                          alt="Imagen enviada"
                          className="mt-2 max-w-full max-h-80 rounded-lg"
                        />
                      )}
                      {isAudio && audioData && (
                        <audio
                          src={audioData}
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

                    {/* Avatar y nombre - SOLO para maestro (derecha) */}
                    {msg.is_from_maestro && (
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                          {maestroProfile?.avatar_url ? (
                            <img
                              src={maestroProfile.avatar_url}
                              alt={maestroProfile.full_name || "Maestro"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-lg">
                              {maestroProfile?.full_name?.charAt(0).toUpperCase() || "M"}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold max-w-[60px] truncate">
                          {maestroProfile?.full_name || "Maestro"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 border-t-2 border-gold/20 p-6">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-3 bg-secondary/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-primary via-amber-500 to-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {sending ? "Enviando..." : "Enviar"}
                  </button>
                </div>

                {/* Botones de multimedia */}
                <div className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || recording}
                    className="flex-1 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 border-2 border-border rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    📷 {uploading ? "Subiendo..." : "Enviar Imagen"}
                  </button>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={uploading}
                    className={`flex-1 px-4 py-2 border-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 ${
                      recording 
                        ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                        : "bg-secondary/50 hover:bg-secondary/70 border-border"
                    }`}
                  >
                    🎤 {recording ? "Detener Grabación" : "Grabar Audio"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}