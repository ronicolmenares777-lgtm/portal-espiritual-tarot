import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { ArrowLeft, Send, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { MessageService } from "@/services/messageService";
import { ProfileService } from "@/services/profileService";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function ChatUsuario() {
  const router = useRouter();
  const { leadId } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maestroAvatar, setMaestroAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=maestro");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!leadId || typeof leadId !== "string") {
      return;
    }

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
}