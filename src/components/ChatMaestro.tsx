"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { MessageService } from "@/services/messageService";
import { ProfileService } from "@/services/profileService";
import { LeadService } from "@/services/leadService";
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

export function ChatMaestro({ userName, userPhone, userProblem, userCard }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [maestroAvatar, setMaestroAvatar] = useState<string>("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar datos y suscribirse a Supabase
  useEffect(() => {
    let subscription: any = null;

    const loadData = async () => {
      console.log("🔄 ChatMaestro: Iniciando...");
      
      // Intentar obtener leadId del localStorage (máximo 6 intentos = 3 segundos)
      let attempts = 0;
      let currentLeadId = null;
      
      while (!currentLeadId && attempts < 6) {
        currentLeadId = localStorage.getItem("currentLeadId");
        if (currentLeadId) break;
        
        console.log(`⏳ Intento ${attempts + 1}/6 - Esperando leadId...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      // Si después de 3 segundos no hay leadId, crear uno de emergencia
      if (!currentLeadId) {
        console.warn("⚠️ No se encontró leadId - Creando lead de emergencia...");
        try {
          const { data: emergencyLead, error } = await LeadService.create({
            name: userName || "Usuario",
            whatsapp: userPhone || "0000000000",
            country_code: "+52",
            problem: userProblem || "Consulta desde chat",
            status: "nuevo",
            selected_cards: userCard ? [userCard] : [],
            precision_answers: []
          });
          
          if (emergencyLead && !error) {
            currentLeadId = emergencyLead.id;
            localStorage.setItem("currentLeadId", emergencyLead.id);
            console.log("✅ Lead de emergencia creado:", currentLeadId);
          }
        } catch (err) {
          console.error("❌ Error creando lead de emergencia:", err);
        }
      }
      
      if (currentLeadId) {
        console.log("✅ Lead ID obtenido:", currentLeadId);
        setLeadId(currentLeadId);

        // Cargar mensajes existentes
        const messagesData = await MessageService.getByLeadId(currentLeadId);
        console.log("✅ Mensajes cargados:", messagesData.length);
        setMessages(messagesData);

        // Suscribirse a cambios en tiempo real
        console.log("🔔 Configurando suscripción realtime para lead:", currentLeadId);
        subscription = MessageService.subscribeToMessages(currentLeadId, (newMsg) => {
          console.log("📨 Nuevo mensaje recibido en ChatMaestro:", newMsg);
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) {
              console.log("⚠️ Mensaje duplicado ignorado");
              return prev;
            }
            console.log("✅ Mensaje agregado a la lista");
            return [...prev, newMsg];
          });
        });
        
        console.log("✅ Suscripción realtime configurada");

        // Cargar avatar del maestro desde el perfil
        const { data: profiles } = await ProfileService.getAll();
        if (profiles && profiles.length > 0) {
          const maestro = profiles[0];
          console.log("👤 Perfil del maestro:", maestro);
          if (maestro.avatar_url) {
            console.log("✅ Avatar del maestro cargado:", maestro.avatar_url);
            setMaestroAvatar(maestro.avatar_url);
          }
        }
      }

      setIsReady(true);
    };

    loadData();

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      if (subscription) {
        console.log("🔌 Cancelando suscripción realtime...");
        subscription.unsubscribe();
      }
    };
  }, [userName, userPhone, userProblem, userCard]);

  // Enviar mensaje a Supabase
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    // Validar leadId
    if (!leadId) {
      console.error("❌ No hay leadId disponible");
      return;
    }

    setIsSending(true);

    try {
      const createdMessage = await MessageService.create({
        lead_id: leadId,
        text: message.trim(),
        is_from_maestro: false
      });

      if (createdMessage) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === createdMessage.id);
          if (exists) return prev;
          return [...prev, createdMessage];
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