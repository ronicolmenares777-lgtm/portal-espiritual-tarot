import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { ArrowLeft, Send, Sparkles, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { MessageService } from "@/services/messageService";
import { ProfileService } from "@/services/profileService";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function ChatUsuario() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maestroAvatar, setMaestroAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const [leadId, setLeadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Intentar obtener leadId de localStorage
    const storedLeadId = localStorage.getItem("currentLeadId");
    
    if (storedLeadId) {
      setLeadId(storedLeadId);
    } else {
      console.warn("No se encontró leadId en localStorage");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!leadId) return;

    const loadData = async () => {
      setIsLoading(true);

      // Cargar mensajes
      const { data: messagesData } = await MessageService.getByLeadId(leadId);
      if (messagesData) {
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

      setIsLoading(false);
    };

    loadData();

    // Suscribirse a cambios en tiempo real
    const subscription = MessageService.subscribeToMessages(leadId, (newMsg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMsg.id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [leadId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    setIsSending(true);

    try {
      const { data, error } = await MessageService.create({
        lead_id: leadId,
        text: newMessage,
        is_from_maestro: false
      });

      if (error) {
        console.error("Error enviando mensaje:", error);
        alert("Error al enviar mensaje");
        setIsSending(false);
        return;
      }

      if (data) {
        setMessages((prev) => [...prev, data]);
      }

      setNewMessage("");
      setIsSending(false);
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error al enviar mensaje");
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <SEO title="Chat - Portal Espiritual" />
        <CustomCursor />
        <FloatingParticles />
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-gold">Conectando con el maestro...</p>
        </div>
      </div>
    );
  }

  if (!leadId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <SEO title="Chat - Portal Espiritual" />
        <CustomCursor />
        <FloatingParticles />
        <div className="text-center max-w-md">
          <Sparkles className="w-16 h-16 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-gold mb-2">
            Sesión no encontrada
          </h2>
          <p className="text-foreground/60 mb-6">
            Por favor, completa primero la lectura de tarot para acceder al chat.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all"
          >
            Iniciar lectura
          </button>
        </div>
      </div>
    );
  }
}