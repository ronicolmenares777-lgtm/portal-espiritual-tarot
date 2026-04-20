import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import {
  ArrowLeft,
  Send,
  Mic,
  Paperclip,
  Sparkles,
  ImageIcon,
  User,
  LogOut,
  X
} from "lucide-react";
import type { Lead, ChatMessage } from "@/types/admin";

export default function ChatUsuario() {
  const router = useRouter();
  const [userData, setUserData] = useState<Lead | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{
    type: "image" | "video" | "audio";
    url: string;
    file: File;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const userDataStr = localStorage.getItem("userAuth");
    if (!userDataStr) {
      router.push("/");
      return;
    }
    
    const user = JSON.parse(userDataStr);
    setUserData(user);
  }, [router]);

  // Manejar archivos adjuntos
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo debe ser menor a 10MB");
      return;
    }

    const validTypes = type === "image" 
      ? ["image/jpeg", "image/png", "image/gif", "image/webp"]
      : ["video/mp4", "video/webm", "video/ogg"];
    
    if (!validTypes.includes(file.type)) {
      alert(`Tipo de archivo no válido para ${type}`);
      return;
    }

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

  // Grabar audio
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
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview({
            type: "audio",
            url: reader.result as string,
            file: new File([audioBlob], "audio.webm", { type: "audio/webm" })
          });
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert("No se pudo acceder al micrófono");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMedia = () => {
    if (!mediaPreview || !userData) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: mediaPreview.type === "audio" ? "Audio" : mediaPreview.type === "video" ? "Video" : "Imagen",
      type: mediaPreview.type,
      mediaUrl: mediaPreview.url,
      isFromMaestro: false,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...(userData.messages || []), newMessage];
    const updatedUser = { ...userData, messages: updatedMessages };
    
    setUserData(updatedUser);
    localStorage.setItem("userAuth", JSON.stringify(updatedUser));
    setMediaPreview(null);
  };

  const cancelMediaPreview = () => {
    setMediaPreview(null);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !userData) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isFromMaestro: false,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...(userData.messages || []), newMessage];
    const updatedUser = { ...userData, messages: updatedMessages };
    
    setUserData(updatedUser);
    localStorage.setItem("userAuth", JSON.stringify(updatedUser));
    setMessageInput("");
  };

  const handleLogout = () => {
    localStorage.removeItem("userAuth");
    router.push("/");
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-gold animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Chat Espiritual - Portal Tarot"
        description="Continúa tu conversación espiritual con el Maestro"
      />
      <CustomCursor />
      <FloatingParticles />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-black border-b-2 border-gold/20 px-4 py-3 shadow-xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gold" />
              </button>
              <div>
                <h1 className="text-base font-serif text-gold tracking-wider">
                  Conversación Espiritual
                </h1>
                <p className="text-xs text-muted-foreground">
                  {userData.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-gold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-gradient-to-b from-[hsl(260,35%,10%)] to-[hsl(260,35%,12%)]">
            {!userData.messages || userData.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 max-w-sm mx-auto px-4">
                  <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/20">
                    <Sparkles className="w-10 h-10 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-gold mb-2">Tu Conversación Espiritual</h3>
                    <p className="text-sm text-muted-foreground">
                      El Maestro pronto responderá tus consultas. Mantén la fe.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              userData.messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${msg.isUser ? "flex-row-reverse" : "flex-row"}`}>
                    {!msg.isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-accent/30 flex items-center justify-center border-2 border-gold/50 flex-shrink-0 shadow-lg shadow-gold/20">
                        <Sparkles className="w-4 h-4 text-gold" />
                      </div>
                    )}
                    
                    <div
                      className={`rounded-2xl overflow-hidden shadow-lg ${
                        msg.isUser
                          ? "bg-gradient-to-br from-gold/30 to-accent/30 border-2 border-gold/50 shadow-gold/20"
                          : "bg-[hsl(260,40%,18%)] border-2 border-[hsl(260,30%,25%)] shadow-black/40"
                      }`}
                    >
                      {msg.type === "image" && msg.mediaUrl && (
                        <img src={msg.mediaUrl} alt="Imagen" className="w-full max-w-sm" />
                      )}
                      {msg.type === "video" && msg.mediaUrl && (
                        <video src={msg.mediaUrl} controls className="w-full max-w-sm" />
                      )}
                      {msg.type === "audio" && msg.mediaUrl && (
                        <div className="px-4 py-3">
                          <audio src={msg.mediaUrl} controls className="w-full" />
                        </div>
                      )}
                      {(!msg.type || msg.type === "text") && (
                        <div className="px-4 py-2.5">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        </div>
                      )}
                      <div className="px-4 pb-2">
                        <span className={`text-xs ${msg.isUser ? "text-gold/70" : "text-muted-foreground"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    {msg.isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 flex items-center justify-center border-2 border-blue-500/60 flex-shrink-0 shadow-lg shadow-blue-500/20">
                        <User className="w-4 h-4 text-blue-300" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Input de mensaje */}
          <div className="border-t-2 border-gold/20 bg-[hsl(260,35%,14%)] p-4 shadow-2xl">
            <AnimatePresence>
              {mediaPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-4 p-4 bg-[hsl(260,40%,18%)] rounded-xl border-2 border-gold/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {mediaPreview.type === "image" && (
                        <img src={mediaPreview.url} alt="Preview" className="w-full max-w-xs rounded-lg" />
                      )}
                      {mediaPreview.type === "video" && (
                        <video src={mediaPreview.url} controls className="w-full max-w-xs rounded-lg" />
                      )}
                      {mediaPreview.type === "audio" && (
                        <div className="flex items-center gap-3 p-3 bg-[hsl(260,35%,16%)] rounded-lg">
                          <Mic className="w-5 h-5 text-gold" />
                          <audio src={mediaPreview.url} controls className="w-full" />
                        </div>
                      )}
                    </div>
                    <button onClick={cancelMediaPreview} className="p-2 hover:bg-muted rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={cancelMediaPreview} className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 text-sm">
                      Cancelar
                    </button>
                    <button onClick={handleSendMedia} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium text-sm">
                      Enviar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input type="file" accept="image/*" onChange={(e) => handleFileAttach(e, "image")} className="hidden" id="image-upload" />
            <input type="file" accept="video/*" onChange={(e) => handleFileAttach(e, "video")} className="hidden" id="video-upload" />

            <div className="flex items-end gap-2">
              <div className="flex gap-1">
                <button onClick={() => document.getElementById("image-upload")?.click()} className="p-2 hover:bg-gold/20 rounded-lg transition-all" title="Imagen">
                  <ImageIcon className="w-5 h-5 text-muted-foreground hover:text-gold" />
                </button>
                <button onClick={() => document.getElementById("video-upload")?.click()} className="p-2 hover:bg-gold/20 rounded-lg transition-all" title="Video">
                  <Paperclip className="w-5 h-5 text-muted-foreground hover:text-gold" />
                </button>
                <button onClick={isRecording ? stopRecording : startRecording} className={`p-2 rounded-lg transition-all ${isRecording ? "bg-red-500/30" : "hover:bg-gold/20"}`} title="Audio">
                  <Mic className={`w-5 h-5 ${isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-gold"}`} />
                </button>
              </div>

              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(messageInput);
                  }
                }}
                placeholder="Escribe tu consulta espiritual..."
                rows={1}
                className="flex-1 bg-[hsl(260,40%,18%)] border-2 border-gold/20 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />

              <button
                onClick={() => handleSendMessage(messageInput)}
                disabled={!messageInput.trim()}
                className="p-3 bg-gradient-to-r from-gold to-accent text-background rounded-xl hover:shadow-xl transition-all disabled:opacity-40"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}