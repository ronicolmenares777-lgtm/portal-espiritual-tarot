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

export function ChatMaestro({ userName, userProblem = "", userCard = "" }: ChatMaestroProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [maestroAvatar, setMaestroAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const [leadId, setLeadId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar datos y suscribirse a Supabase
  useEffect(() => {
    let subscription: any = null;

    const loadData = async () => {
      // 1. Obtener lead ID de la sesión actual
      const currentLeadId = localStorage.getItem("currentLeadId");
      if (!currentLeadId) return;
      
      setLeadId(currentLeadId);
      
      // 2. Cargar mensajes previos de Supabase
      const { data: messagesData } = await MessageService.getByLeadId(currentLeadId);
      
      if (messagesData && messagesData.length > 0) {
        setMessages(messagesData);
      } else {
        // Si no hay mensajes, crear el mensaje de bienvenida en Supabase
        const welcomeText = `Hola ${userName}, he analizado tu situación sobre "${userProblem}" y lo que nos revela la carta ${userCard}. El universo tiene un mensaje importante para ti. ¿Estás listo para escucharlo?`;
        
        const { data: newMsg } = await MessageService.create({
          lead_id: currentLeadId,
          text: welcomeText,
          is_from_maestro: true
        });
        
        if (newMsg) setMessages([newMsg]);
      }

      // 3. Suscribirse a nuevos mensajes en tiempo real
      subscription = MessageService.subscribeToMessages(currentLeadId, (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });
    };

    loadData();

    // 4. Cargar avatar real del maestro
    ProfileService.getAll().then(({ data: profiles }) => {
      if (profiles && profiles.length > 0 && profiles[0].avatar_url) {
        setMaestroAvatar(profiles[0].avatar_url);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [userName, userProblem, userCard]);

  // Enviar mensaje a Supabase
  const handleSend = async () => {
    if (!message.trim() || !leadId) return;
    
    const textToSend = message;
    setMessage(""); // Limpiar input rápido para mejor UX

    try {
      const { error } = await MessageService.create({
        lead_id: leadId,
        text: textToSend,
        is_from_maestro: false
      });

      if (error) {
        console.error("Error enviando mensaje:", error);
        alert("Error al enviar el mensaje. Intenta de nuevo.");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

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
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
            />
            
            <button 
              onClick={handleSend}
              className="p-2 hover:bg-gold/10 rounded-full transition-colors"
            >
              <Send className="w-5 h-5 text-gold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}