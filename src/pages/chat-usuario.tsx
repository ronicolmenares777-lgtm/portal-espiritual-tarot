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

  // Auto-scroll cuando llegan mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            <div className="bg-gradient-to-r from-primary/20 via-amber-500/20 to-primary/20 border-b-2 border-gold/30 p-6 shadow-lg">
              <div className="flex items-center gap-4">
                {/* Avatar del maestro */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-primary shadow-xl shrink-0">
                  {maestroProfile?.avatar_url ? (
                    <img
                      src={maestroProfile.avatar_url}
                      alt={maestroProfile.full_name || "Maestro"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-xl">
                      M
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent">
                    {maestroProfile?.full_name || "Maestro Espiritual"}
                  </h1>
                  <p className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    En línea
                  </p>
                </div>
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
                    {/* Avatar - SOLO para maestro (izquierda) */}
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