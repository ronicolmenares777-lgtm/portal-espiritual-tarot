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
};

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [maestroProfile, setMaestroProfile] = useState<any>(null);

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

  // Función de audio deshabilitada por ahora
  // const handleAudioRecord se implementará en una versión futura

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/Suafazon/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-accent/20 text-accent">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{lead.name}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {lead.whatsapp}
          </p>
        </div>
        {lead.is_favorite && <Star className="h-5 w-5 fill-primary text-primary" />}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          // Detectar si es imagen por el prefijo [IMG]
          const isImage = msg.text?.startsWith("[IMG]");
          const imageData = isImage ? msg.text?.substring(5) : null;
          const textContent = isImage ? null : msg.text;

          console.log("💬 [MSG-RENDER]", {
            id: msg.id.substring(0, 8),
            is_from_maestro: msg.is_from_maestro,
            tipo: msg.is_from_maestro ? "MAESTRO" : "USUARIO",
            isImage
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

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        {/* Input de mensaje */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={sending}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              📷 {uploading ? "Subiendo..." : "Enviar Imagen"}
            </button>
            <button
              disabled
              className="flex-1 px-4 py-2 bg-secondary/30 border border-border rounded-xl font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
            >
              🎤 Audio (Próximamente)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}