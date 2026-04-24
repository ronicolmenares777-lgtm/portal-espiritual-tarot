"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { MessageService } from "@/services/messageService";
import { ProfileService } from "@/services/profileService";
import type { Database } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface ChatMaestroProps {
  userName: string;
  userPhone?: string;
  userProblem?: string;
  userCard?: string;
  onBack?: () => void;
}

export function ChatMaestro({ userName, userPhone, userProblem, userCard, onBack }: ChatMaestroProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [maestroAvatar, setMaestroAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar datos y suscribirse a Supabase
  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 ChatMaestro: Iniciando...");
      
      // Esperar a que el leadId esté disponible (máximo 3 segundos)
      let attempts = 0;
      let currentLeadId = null;
      
      while (!currentLeadId && attempts < 6) {
        currentLeadId = localStorage.getItem("currentLeadId");
        if (currentLeadId) break;
        
        console.log(`⏳ Intento ${attempts + 1}/6 - Esperando leadId...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      if (!currentLeadId) {
        console.error("❌ No se pudo obtener leadId después de 6 intentos");
        setIsReady(true); // Mostrar chat de todos modos
        return;
      }
      
      console.log("✅ Lead ID obtenido:", currentLeadId);
      setLeadId(currentLeadId);

      // Cargar mensajes existentes
      const { data: messagesData } = await MessageService.getByLeadId(currentLeadId);
      if (messagesData) {
        console.log("✅ Mensajes cargados:", messagesData.length);
        setMessages(messagesData);
      }

      // Cargar avatar del maestro
      const { data: profiles } = await ProfileService.getAll();
      if (profiles && profiles.length > 0) {
        const maestro = profiles[0];
        if (maestro.avatar_url) {
          setMaestroAvatar(maestro.avatar_url);
        }
      }

      setIsReady(true);

      // Suscribirse a cambios en tiempo real
      const subscription = MessageService.subscribeToMessages(currentLeadId, (newMsg) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    loadData();
  }, []);

  // Enviar mensaje a Supabase
  const handleSendMessage = async () => {
    if (!message.trim() || !leadId || isSending) return;

    setIsSending(true);

    try {
      const { data, error } = await MessageService.create({
        lead_id: leadId,
        text: message.trim(),
        is_from_maestro: false
      });

      if (error) {
        console.error("❌ Error:", error);
        setIsSending(false);
        return;
      }

      if (data) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
      }

      setMessage("");
      setIsSending(false);
    } catch (err) {
      console.error("❌ Error:", err);
      setIsSending(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gold">Conectando con el maestro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-black/60 backdrop-blur-md rounded-3xl overflow-hidden border border-gold/20 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 backdrop-blur-sm p-4 border-b border-gold/20">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <img
                src={maestroAvatar}
                alt="Maestro"
                className="w-12 h-12 rounded-full object-cover border-2 border-gold"
                onError={(e) => {
                  e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro";
                }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900" />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h3 className="text-gold font-semibold tracking-wide">Maestro Espiritual</h3>
              <p className="text-xs text-green-400 tracking-wider">EN LÍNEA</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${
                !msg.is_from_maestro ? "flex-row-reverse" : ""
              }`}
            >
              {msg.is_from_maestro && (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/30 flex-shrink-0">
                  <img 
                    src={maestroAvatar} 
                    alt="Maestro"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro";
                    }}
                  />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.is_from_maestro
                    ? "bg-gold/20 text-foreground"
                    : "bg-muted/50 text-foreground"
                }`}
              >
                {msg.text && <p className="text-sm">{msg.text}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(msg.created_at).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-gradient-to-r from-purple-900/60 to-purple-800/60 backdrop-blur-sm p-4 border-t border-gold/20">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Escribe un mensaje..."
              disabled={isSending || !leadId}
              className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all disabled:opacity-50"
            />
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              disabled={isSending || !message.trim() || !leadId}
              className="p-2 hover:bg-gold/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-gold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}