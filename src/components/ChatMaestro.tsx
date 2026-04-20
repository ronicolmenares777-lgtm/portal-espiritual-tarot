"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { chatConfig } from "@/lib/config";
import type { Lead } from "@/types/admin";

interface Message {
  texto: string;
  timestamp: string;
  isUser?: boolean;
  imageUrl?: string;
}

interface ChatMaestroProps {
  userName: string;
  userPhone?: string;
  userProblem?: string;
  userCard?: string;
  onBack?: () => void;
}

export function ChatMaestro({ userName, userPhone = "", userProblem = "", userCard = "", onBack }: ChatMaestroProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(chatConfig.maestro.mensajes);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guardar lead en localStorage cuando se monta el componente
  useEffect(() => {
    if (userName && userPhone) {
      const existingLeads = localStorage.getItem("leads");
      const leads: Lead[] = existingLeads ? JSON.parse(existingLeads) : [];
      
      // Verificar si el lead ya existe
      const existingLead = leads.find(lead => lead.whatsapp === userPhone);
      
      if (!existingLead) {
        // Crear nuevo lead
        const newLead: Lead = {
          id: Date.now().toString(),
          name: userName,
          whatsapp: userPhone,
          problem: userProblem,
          card: userCard,
          status: "nuevo",
          timestamp: "hace 1 hora",
          createdAt: new Date().toISOString(),
          messages: messages.map(msg => ({
            id: Date.now().toString() + Math.random(),
            text: msg.texto,
            timestamp: msg.timestamp,
            isFromMaestro: !msg.isUser,
            isUser: msg.isUser
          }))
        };
        
        leads.push(newLead);
        localStorage.setItem("leads", JSON.stringify(leads));
        
        // Guardar autenticación del usuario
        localStorage.setItem("userAuth", JSON.stringify(newLead));
      }
    }
  }, [userName, userPhone, userProblem, userCard]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() && !selectedImage) return;
    
    const newMessage: Message = {
      texto: message || "(imagen)",
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      imageUrl: selectedImage || undefined
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    setSelectedImage(null);
    setPreviewImage(null);

    // Actualizar el lead en localStorage con el nuevo mensaje
    if (userPhone) {
      const existingLeads = localStorage.getItem("leads");
      if (existingLeads) {
        const leads: Lead[] = JSON.parse(existingLeads);
        const leadIndex = leads.findIndex(lead => lead.whatsapp === userPhone);
        
        if (leadIndex !== -1) {
          leads[leadIndex].messages = [
            ...(leads[leadIndex].messages || []),
            {
              id: Date.now().toString(),
              text: message,
              timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
              isFromMaestro: false,
              isUser: true
            }
          ];
          leads[leadIndex].status = "enConversacion";
          localStorage.setItem("leads", JSON.stringify(leads));
          
          // Actualizar también userAuth
          localStorage.setItem("userAuth", JSON.stringify(leads[leadIndex]));
        }
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
                src={chatConfig.maestro.avatar}
                alt={chatConfig.maestro.nombre}
                className="w-12 h-12 rounded-full object-cover border-2 border-gold"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900" />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h3 className="text-gold font-semibold tracking-wide">{chatConfig.maestro.nombre}</h3>
              <p className="text-xs text-green-400 tracking-wider">EN LÍNEA</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`max-w-[80%] ${msg.isUser ? 'bg-gold/20 border-gold/30' : 'bg-purple-900/50 border-purple-700/30'} rounded-2xl p-3 border backdrop-blur-sm`}>
                {msg.imageUrl && (
                  <img 
                    src={msg.imageUrl} 
                    alt="Imagen enviada" 
                    className="rounded-lg mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImage(msg.imageUrl || null)}
                  />
                )}
                {msg.texto !== "(imagen)" && (
                  <p className="text-sm text-foreground leading-relaxed">{msg.texto}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1 text-right">{msg.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Preview de imagen seleccionada */}
        {previewImage && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="h-20 rounded-lg border-2 border-gold/30"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-gradient-to-r from-purple-900/60 to-purple-800/60 backdrop-blur-sm p-4 border-t border-gold/20">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gold/10 rounded-full transition-colors"
              title="Adjuntar imagen"
            >
              <ImageIcon className="w-5 h-5 text-gold/70" />
            </button>
            
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
            
            <button className="p-2 hover:bg-gold/10 rounded-full transition-colors">
              <Mic className="w-5 h-5 text-gold/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de preview de imagen */}
      {previewImage && previewImage !== selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={previewImage} 
              alt="Preview completo" 
              className="max-w-full max-h-[90vh] rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}