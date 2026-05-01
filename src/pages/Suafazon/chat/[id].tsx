import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Star, 
  StarOff, 
  ImageIcon,
  Mic,
  Loader2,
  Play,
  Pause
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type Lead = Tables<"leads">;
type Message = Tables<"messages">;

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar datos y suscribirse a realtime
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    let mounted = true;

    const loadData = async () => {
      try {
        // Cargar lead
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", id)
          .single();

        if (leadError) throw leadError;
        if (mounted && leadData) setLead(leadData);

        // Cargar mensajes
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("lead_id", id)
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;
        if (mounted && messagesData) setMessages(messagesData);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    // Suscripción realtime - UN SOLO CANAL COMPARTIDO
    console.log("📡 [ADMIN] Configurando suscripción realtime para chat:", id);
    
    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `lead_id=eq.${id}`,
        },
        (payload) => {
          console.log("📨 [ADMIN] Nuevo mensaje recibido:", payload.new);
          const newMsg = payload.new as Message;
          
          if (mounted) {
            setMessages((prev) => {
              // Evitar duplicados
              if (prev.some(m => m.id === newMsg.id)) {
                console.log("⚠️ [ADMIN] Mensaje duplicado ignorado");
                return prev;
              }
              console.log("✅ [ADMIN] Mensaje agregado al estado");
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 [ADMIN] Estado de suscripción:", status);
      });

    return () => {
      console.log("🔌 [ADMIN] Limpiando suscripción");
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Enviar mensaje de texto
  const sendMessage = async () => {
    if (!newMessage.trim() || !lead || isSending) return;

    setIsSending(true);
    const tempMessage = newMessage.trim();
    setNewMessage(""); // Limpiar input inmediatamente

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          lead_id: lead.id,
          text: tempMessage,
          is_from_maestro: true,
        });

      if (error) throw error;
      console.log("✅ [ADMIN] Mensaje enviado");
    } catch (error) {
      console.error("❌ [ADMIN] Error enviando mensaje:", error);
      setNewMessage(tempMessage); // Restaurar mensaje si falla
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Subir imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lead) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Solo se permiten imágenes",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen es muy grande (máximo 5MB)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Subir a Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${lead.id}/${fileName}`;

      console.log("📤 [ADMIN] Subiendo imagen:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ [ADMIN] Error subiendo imagen:", uploadError);
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(filePath);

      console.log("✅ [ADMIN] Imagen subida:", publicUrl);

      // Guardar mensaje con imagen
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          lead_id: lead.id,
          text: null,
          media_type: "image",
          media_url: publicUrl,
          is_from_maestro: true,
        });

      if (messageError) throw messageError;

      toast({
        title: "Imagen enviada",
        description: "La imagen se ha enviado correctamente",
      });
    } catch (error: any) {
      console.error("❌ [ADMIN] Error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Grabar audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("🎤 [ADMIN] Grabando audio...");
    } catch (error) {
      console.error("❌ [ADMIN] Error grabando:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("⏹️ [ADMIN] Grabación detenida");
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    if (!lead) return;

    setIsUploading(true);

    try {
      const fileName = `audio-${Date.now()}.webm`;
      const filePath = `${lead.id}/${fileName}`;

      console.log("📤 [ADMIN] Subiendo audio:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, audioBlob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(filePath);

      console.log("✅ [ADMIN] Audio subido:", publicUrl);

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          lead_id: lead.id,
          text: null,
          media_type: "audio",
          media_url: publicUrl,
          is_from_maestro: true,
        });

      if (messageError) throw messageError;

      toast({
        title: "Audio enviado",
        description: "El audio se ha enviado correctamente",
      });
    } catch (error: any) {
      console.error("❌ [ADMIN] Error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el audio",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle favorito
  const toggleFavorite = async () => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ is_favorite: !lead.is_favorite })
        .eq("id", lead.id);

      if (error) throw error;

      setLead({ ...lead, is_favorite: !lead.is_favorite });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Actualizar clasificación
  const updateClassification = async (classification: Lead["classification"]) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ classification })
        .eq("id", lead.id);

      if (error) throw error;

      setLead({ ...lead, classification });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Lead no encontrado</p>
      </div>
    );
  }

  const getClassificationColor = (classification: Lead["classification"]) => {
    switch (classification) {
      case "hot": return "bg-red-500 hover:bg-red-600";
      case "warm": return "bg-orange-500 hover:bg-orange-600";
      case "cold": return "bg-blue-500 hover:bg-blue-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getClassificationLabel = (classification: Lead["classification"]) => {
    switch (classification) {
      case "hot": return "Caliente 🔥";
      case "warm": return "Tibio 🟠";
      case "cold": return "Frío 🧊";
      default: return "Sin clasificar";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 backdrop-blur-md border-b border-primary/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Volver + Avatar + Info */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/Suafazon/dashboard")}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-md" />
                <Avatar className="relative h-12 w-12 ring-2 ring-gold/50">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}`} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-col">
                <h2 className="font-bold text-foreground text-lg">{lead.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {lead.country_code} {lead.whatsapp}
                </p>
              </div>
            </div>

            {/* Clasificación + Favorito */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${getClassificationColor(lead.classification)} text-white border-0`}
                  >
                    {getClassificationLabel(lead.classification)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => updateClassification("hot")}>
                    🔥 Caliente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateClassification("warm")}>
                    🟠 Tibio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateClassification("cold")}>
                    🧊 Frío
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateClassification(null)}>
                    ❌ Sin clasificar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className="hover:bg-primary/10"
              >
                {lead.is_favorite ? (
                  <Star className="h-5 w-5 fill-gold text-gold" />
                ) : (
                  <StarOff className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.is_from_maestro ? "justify-start" : "justify-end"
              }`}
            >
              <div className={`flex gap-3 max-w-[75%] ${
                message.is_from_maestro ? "" : "flex-row-reverse"
              }`}>
                {/* Avatar solo para maestro */}
                {message.is_from_maestro && (
                  <Avatar className="h-10 w-10 ring-2 ring-gold/50">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=maestro" />
                    <AvatarFallback className="bg-gold/20 text-gold">M</AvatarFallback>
                  </Avatar>
                )}

                {/* Burbuja */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-md ${
                    message.is_from_maestro
                      ? "bg-gradient-to-br from-gold via-amber-500 to-amber-600 text-white"
                      : "bg-white/90 text-gray-900"
                  }`}
                >
                  {!message.is_from_maestro && (
                    <p className="text-xs font-semibold mb-1 text-gray-700">
                      {lead.name}
                    </p>
                  )}

                  {/* Texto */}
                  {message.text && (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}

                  {/* Imagen */}
                  {message.media_type === "image" && message.media_url && (
                    <img 
                      src={message.media_url} 
                      alt="Imagen"
                      className="rounded-lg max-w-full h-auto mt-2"
                    />
                  )}

                  {/* Audio */}
                  {message.media_type === "audio" && message.media_url && (
                    <audio controls className="mt-2 w-full">
                      <source src={message.media_url} type="audio/webm" />
                    </audio>
                  )}

                  <p className={`text-xs mt-1.5 ${
                    message.is_from_maestro ? "opacity-80" : "text-gray-600"
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input área */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-primary/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="hover:bg-primary/10"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isUploading}
              className={`hover:bg-primary/10 ${isRecording ? "bg-red-500 text-white" : ""}`}
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-background/50"
              disabled={isSending}
            />

            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-gradient-to-r from-gold to-amber-600 hover:from-amber-600 hover:to-gold text-white"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}