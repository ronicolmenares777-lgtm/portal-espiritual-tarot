"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { MessageService } from "@/services/messageService";
import { LeadService } from "@/services/leadService";
import { ProfileService } from "@/services/profileService";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface ChatMaestroProps {
  userName: string;
  userPhone: string;
  userProblem: string;
  userCard?: string;
}

export function ChatMaestro({ userName, userPhone, userProblem, userCard }: ChatMaestroProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [maestroAvatar, setMaestroAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Maestro");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar datos y suscribirse a Supabase - VERSIÓN CORREGIDA
  useEffect(() => {
    let isMounted = true;
    let channelSubscription: ReturnType<typeof supabase.channel> | null = null;

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
        if (!isMounted) return;
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
          
          if (!isMounted) return;
          
          if (emergencyLead && !error) {
            currentLeadId = emergencyLead.id;
            localStorage.setItem("currentLeadId", emergencyLead.id);
            console.log("✅ Lead de emergencia creado:", currentLeadId);
          }
        } catch (err) {
          console.error("❌ Error creando lead de emergencia:", err);
          if (!isMounted) return;
        }
      }
      
      if (currentLeadId) {
        console.log("✅ Lead ID obtenido:", currentLeadId);
        setLeadId(currentLeadId);

        // Cargar mensajes existentes
        const messagesData = await MessageService.getByLeadId(currentLeadId);
        if (!isMounted) return;
        
        console.log("✅ Mensajes cargados:", messagesData.length);
        setMessages(messagesData);

        // --- SOLUCIÓN AL ERROR DE SUSCRIPCIÓN ---
        // 1. Limpiar cualquier canal existente con el mismo nombre
        const channelName = `messages-${currentLeadId}`;
        const existingChannels = supabase.getChannels();
        existingChannels.forEach((ch) => {
          if (ch.topic === `realtime:${channelName}`) {
            console.log("🧹 Limpiando canal huérfano previo:", channelName);
            supabase.removeChannel(ch);
          }
        });

        // Configurar suscripción en tiempo real
        console.log("🔔 Configurando suscripción realtime para lead:", currentLeadId);
        
        // 2. Crear canal nuevo y limpio
        const realtimeChannel = supabase.channel(channelName);
        
        realtimeChannel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `lead_id=eq.${currentLeadId}`,
          },
          (payload) => {
            console.log("🔔 Cambio detectado:", payload.eventType);
            
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new as Message;
              console.log("📨 Nuevo mensaje recibido:", newMessage);
              
              setMessages((prev) => {
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
              });
            }
          }
        );
        
        realtimeChannel.subscribe((status) => {
          if (!isMounted) return;
          console.log("📡 Estado de suscripción:", status);
          if (status === "SUBSCRIBED") {
            console.log("✅ Suscripción realtime activa");
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ Error en canal realtime");
          }
        });
        
        channelSubscription = realtimeChannel;

        // Cargar avatar del maestro desde el perfil
        const { data: profiles } = await ProfileService.getAll();
        if (!isMounted) return;
        
        if (profiles && profiles.length > 0) {
          const maestro = profiles[0];
          if (maestro.avatar_url) {
            setMaestroAvatar(maestro.avatar_url);
          }
        }
      }

      if (isMounted) {
        setIsReady(true);
      }
    };

    loadData();

    // Cleanup: cancelar suscripción al desmontar
    return () => {
      isMounted = false;
      if (channelSubscription) {
        console.log("🔌 Cancelando suscripción realtime...");
        supabase.removeChannel(channelSubscription);
      }
    };
  }, [userName, userPhone, userProblem, userCard]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    try {
      console.log("📤 Enviando mensaje del usuario:", newMessage);
      
      const messageData = {
        lead_id: leadId,
        text: newMessage.trim(),
        is_from_maestro: false,
      };

      const createdMessage = await MessageService.create(messageData);
      console.log("✅ Mensaje enviado:", createdMessage);

      setNewMessage("");
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-foreground/70 font-medium">Conectando con el maestro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header del Chat */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-secondary via-card to-secondary border-b-2 border-gold/30 p-4 shadow-lg sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="relative">
            <img
              src={maestroAvatar}
              alt="Maestro Espiritual"
              className="w-12 h-12 rounded-full ring-2 ring-gold/50"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-xl font-bold text-gold">Maestro Espiritual</h2>
            <p className="text-xs text-muted-foreground">En línea</p>
          </div>
          <Sparkles className="w-6 h-6 text-gold animate-pulse" />
        </div>
      </motion.div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.is_from_maestro ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${
                    message.is_from_maestro
                      ? "bg-card border-2 border-gold/20 text-foreground"
                      : "bg-gradient-to-br from-gold to-amber-500 text-background"
                  }`}
                >
                  {message.is_from_maestro && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={maestroAvatar}
                        alt="Maestro"
                        className="w-6 h-6 rounded-full ring-1 ring-gold/50"
                      />
                      <span className="text-xs font-semibold text-gold">Maestro Espiritual</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-2 ${message.is_from_maestro ? "text-muted-foreground" : "text-background/70"}`}>
                    {new Date(message.created_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de Mensaje */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 border-t-2 border-gold/20 backdrop-blur-md"
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-secondary/50 border-2 border-gold/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/60 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-gold to-amber-500 text-background p-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}