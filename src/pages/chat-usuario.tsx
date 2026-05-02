import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Send, Image, Mic } from "lucide-react";

export default function ChatUsuario() {
  const router = useRouter();
  const { leadId } = router.query;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [maestroProfile, setMaestroProfile] = useState<any>(null);
  const [userName, setUserName] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const hasScrolledInitially = useRef(false);

  // Cargar nombre del usuario y perfil del maestro
  useEffect(() => {
    const loadData = async () => {
      if (!leadId) return;
      const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
      if (!finalLeadId) return;

      // Cargar datos del lead
      const { data: leadData } = await supabase
        .from("leads")
        .select("name")
        .eq("id", finalLeadId)
        .single();

      if (leadData) {
        setUserName(leadData.name);
      }

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
      console.log("👤 [PROFILE] Cargando perfil del maestro...");
      
      // Obtener el primer perfil (maestro/admin)
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("❌ [PROFILE] Error cargando perfil:", error);
        return;
      }

      if (profiles) {
        setMaestroProfile(profiles);
        console.log("✅ [PROFILE] Perfil del maestro cargado:", profiles);
        console.log("  - Nombre:", profiles.full_name);
        console.log("  - Avatar URL:", profiles.avatar_url);
      } else {
        console.log("⚠️ [PROFILE] No se encontró perfil del maestro");
      }
    };

    loadMaestroProfile();
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
    if (!finalLeadId) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      lead_id: finalLeadId,
      text: messageText,
      is_from_maestro: false,
    });

    if (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
    }

    setSending(false);
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

  return (
    <>
      <SEO 
        title="Chat con Maestro Espiritual"
        description="Continúa tu conversación con el maestro espiritual"
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background text-foreground">
        <div className="container mx-auto max-w-4xl h-screen flex flex-col">
          <div className="flex-1 flex flex-col bg-card/30 backdrop-blur-sm rounded-t-3xl shadow-2xl border-2 border-gold/20 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 via-amber-500/20 to-primary/20 border-b-2 border-gold/20 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                    {maestroProfile?.avatar_url ? (
                      <img
                        src={maestroProfile.avatar_url}
                        alt={maestroProfile.full_name || "Maestro Espiritual"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-2xl">
                        M
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-foreground">
                      Maestro Espiritual
                    </h1>
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      En línea
                    </p>
                  </div>
                </div>

                {/* Botón de WhatsApp */}
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-secondary/10">
              {messages.map((msg) => {
                const isImage = msg.text?.startsWith("[IMG]");
                const isAudio = msg.text?.startsWith("[AUDIO]");
                const imageData = isImage ? msg.text?.substring(5) : null;
                const audioData = isAudio ? msg.text?.substring(7) : null;
                const textContent = (isImage || isAudio) ? null : msg.text;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.is_from_maestro ? "justify-start" : "justify-end"
                    }`}
                  >
                    {/* Avatar y nombre - SOLO para maestro (izquierda) */}
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

                    {/* Burbuja de mensaje */}
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${
                        msg.is_from_maestro
                          ? "bg-white text-gray-900 border-2 border-gray-200"
                          : "bg-gradient-to-br from-primary via-amber-500 to-primary text-primary-foreground border-2 border-amber-300"
                      }`}
                    >
                      {textContent && (
                        <p className={`text-sm leading-relaxed ${
                          msg.is_from_maestro ? "text-gray-900" : "text-primary-foreground"
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
                        msg.is_from_maestro ? "text-gray-500" : "text-primary-foreground/80"
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>

                    {/* Avatar - SOLO para usuario (derecha) */}
                    {!msg.is_from_maestro && (
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/40">
                          {userName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold max-w-[60px] truncate">
                          {userName || "Tú"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="bg-card/80 backdrop-blur-sm border-t-2 border-gold/20 p-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-4 py-3 bg-secondary/50 border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    disabled={sending || uploading || recording}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim() || uploading || recording}
                    className="px-6 py-3 bg-gradient-to-r from-primary via-amber-500 to-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {sending ? "Enviando..." : "Enviar"}
                  </button>
                </div>

                {/* Botones de multimedia */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || recording || sending}
                    className="flex-1 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 border-2 border-border rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    📷 {uploading ? "Subiendo..." : "Enviar Imagen"}
                  </button>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={uploading || sending}
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