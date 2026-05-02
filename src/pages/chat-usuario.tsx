import React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

export default function ChatUsuario() {
  const router = useRouter();
  const { leadId } = router.query;
  const [lead, setLead] = useState<Tables<"leads"> | null>(null);
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cargar lead
  useEffect(() => {
    if (!leadId || typeof leadId !== "string") {
      console.log("❌ leadId no válido:", leadId);
      return;
    }

    console.log("✅ leadId válido:", leadId);

    const loadLead = async () => {
      console.log("🔍 Cargando lead...");
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) {
        console.error("❌ Error cargando lead:", error);
        return;
      }

      if (data) {
        console.log("✅ Lead cargado:", data);
        setLead(data);
      }
    };

    loadLead();
  }, [leadId]);

  // Sistema de POLLING - actualiza mensajes cada 2 segundos
  useEffect(() => {
    if (!leadId) return;
    
    const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
    if (!finalLeadId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    const finalLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
    if (!finalLeadId) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("chat_messages").insert({
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
    setSending(true);

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log("✅ [USER-UPLOAD] Archivo convertido a base64");

        // Insertar mensaje en la NUEVA tabla chat_messages
        const { error: dbError } = await supabase.from("chat_messages").insert({
          lead_id: finalLeadId,
          media_url: base64String,
          is_from_maestro: false,
        });

        if (dbError) {
          console.error("❌ [USER-UPLOAD] Error insertando mensaje:", dbError);
          alert(`Error al enviar archivo: ${dbError.message}`);
        } else {
          console.log("✅ [USER-UPLOAD] Mensaje multimedia enviado exitosamente");
        }

        setSending(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        console.error("❌ [USER-UPLOAD] Error leyendo archivo");
        alert("Error al leer el archivo");
        setSending(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("❌ [USER-UPLOAD] Error general:", err);
      alert("Error al procesar el archivo");
      setSending(false);
    }
  };

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          background-color: #000000 !important;
        }
      `}</style>

      <div className="flex flex-col h-screen bg-black">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 bg-background/95 backdrop-blur border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 bg-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Maestro Espiritual</h1>
            <p className="text-sm text-primary">En línea</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isImage = msg.media_url?.startsWith("data:image/");
            const isAudio = msg.media_url?.startsWith("data:audio/");

            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.is_from_maestro ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.is_from_maestro
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  {isImage && (
                    <img
                      src={msg.media_url || ""}
                      alt="Imagen enviada"
                      className="mt-2 max-w-full rounded"
                    />
                  )}
                  {isAudio && (
                    <audio
                      src={msg.media_url || ""}
                      controls
                      className="mt-2 max-w-full"
                    />
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-background/95 backdrop-blur border-t border-border"
        >
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-card border-border text-foreground"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-primary hover:bg-primary/90"
            >
              {sending ? (
                <Sparkles className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}