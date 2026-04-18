"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip } from "lucide-react";
import { chatConfig } from "@/lib/config";

export function ChatMaestro() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chatConfig.maestro.mensajes);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, {
      texto: message,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isUser: true
    }]);
    setMessage("");
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
                <p className="text-sm text-foreground leading-relaxed">{msg.texto}</p>
                <p className="text-xs text-muted-foreground mt-1 text-right">{msg.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-gradient-to-r from-purple-900/60 to-purple-800/60 backdrop-blur-sm p-4 border-t border-gold/20">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gold/10 rounded-full transition-colors">
              <Paperclip className="w-5 h-5 text-gold/70" />
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
    </div>
  );
}