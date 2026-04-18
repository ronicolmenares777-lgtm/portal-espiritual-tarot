"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "maestro" | "user";
  timestamp: string;
}

export function ChatMaestro() {
  const [messages] = useState<Message[]>([
    {
      id: 1,
      text: "Hola, soy el Maestro. Veo que el destino te ha guiado hasta el portal con éxito.",
      sender: "maestro",
      timestamp: "22:02",
    },
    {
      id: 2,
      text: "Deseo ayudarte a encontrar la claridad y resolver lo que te aflige. Cuéntame con confianza, ¿qué situación sentimental o espiritual te trajo aquí y cómo puedo guiarte hoy?",
      sender: "maestro",
      timestamp: "22:02",
    },
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    // Aquí se manejaría el envío del mensaje
    setInputMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black animate-in fade-in duration-1000">
      {/* Header del chat */}
      <div className="bg-gradient-to-r from-purple-deep to-secondary border-b border-purple-border p-4 md:p-6 animate-in slide-in-from-top-4 duration-700">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          {/* Avatar del maestro */}
          <div className="relative">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold flex items-center justify-center text-2xl md:text-3xl">
              🔮
            </div>
            {/* Indicador online */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-purple-deep">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
            </div>
          </div>

          {/* Info del maestro */}
          <div className="flex-1">
            <h2 className="text-gold text-lg md:text-xl font-serif font-bold">
              Maestro Espiritual
            </h2>
            <p className="text-green-400 text-xs md:text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              En línea
            </p>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-in fade-in duration-1000 delay-300">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] ${
                  message.sender === "maestro"
                    ? "bg-card border border-purple-border"
                    : "bg-gold/20 border border-gold/30"
                } rounded-2xl p-4 md:p-5 space-y-2`}
              >
                <p className="text-foreground text-sm md:text-base leading-relaxed">
                  {message.text}
                </p>
                <p className="text-xs text-muted-foreground text-right">
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de mensaje */}
      <div className="border-t border-purple-border p-4 md:p-6 bg-gradient-to-t from-purple-deep/50 to-transparent animate-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4 bg-card border-2 border-purple-border rounded-full px-4 md:px-6 py-3 md:py-4 focus-within:border-gold/50 transition-colors duration-300">
            {/* Botón adjuntar */}
            <button className="text-muted-foreground hover:text-gold transition-colors duration-300">
              <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base"
            />

            {/* Botón micrófono */}
            <button className="text-muted-foreground hover:text-gold transition-colors duration-300">
              <Mic className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Botón enviar */}
            <button
              onClick={handleSendMessage}
              className="bg-gold hover:bg-gold/90 text-purple-deep rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}