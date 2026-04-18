"use client";

import { useState, useEffect } from "react";
import type { TarotCard } from "@/lib/tarotCards";

interface CardRevealProps {
  card: TarotCard;
  cardIndex: number;
  onComplete?: () => void;
}

export function CardReveal({ card, onComplete }: CardRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Trigger reveal animation after mount
    setTimeout(() => setIsRevealed(true), 500);
    
    // Auto-advance after revealing
    setTimeout(() => {
      onComplete?.();
    }, 5000);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="max-w-6xl w-full space-y-12 relative z-10">
        {/* Título */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gold tracking-[0.2em] animate-in slide-in-from-top duration-700">
            REVELA TU DESTINO
          </h2>
          <p className="text-sm text-gold/70 tracking-[0.15em] uppercase animate-in fade-in duration-700 delay-300">
            El cosmos ha hablado a través de tu intención sagrada
          </p>
        </div>

        {/* Cartas */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Carta izquierda - oscurecida */}
          <div 
            className="relative w-48 h-72 md:w-56 md:h-80 rounded-2xl overflow-hidden opacity-20 scale-90 transition-all duration-1000"
            style={{
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950" />
          </div>

          {/* Carta central - REVELADA */}
          <div 
            className={`relative transition-all duration-1000 ${
              isRevealed ? "scale-110" : "scale-100"
            }`}
          >
            <div 
              className="relative w-56 h-80 md:w-64 md:h-96 rounded-2xl overflow-hidden bg-white"
              style={{
                boxShadow: isRevealed
                  ? "0 0 60px hsl(var(--gold) / 0.8), 0 0 120px hsl(var(--gold) / 0.4)"
                  : "0 10px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Imagen real del Tarot */}
              <img 
                src={card.image}
                alt={card.nameEs}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback si la imagen de Wikipedia falla
                  e.currentTarget.src = `https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?w=400&h=600&fit=crop`;
                }}
              />

              {/* Overlay con brillo dorado sutil */}
              {isRevealed && (
                <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-transparent to-gold/10 animate-pulse-glow" />
              )}

              {/* Marco dorado */}
              <div className="absolute inset-0 border-4 border-gold/60 rounded-2xl pointer-events-none" />
              
              {/* Información de la carta */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-950/95 via-purple-900/90 to-transparent backdrop-blur-sm p-4">
                <div className="text-center space-y-1">
                  <p className="text-gold/60 text-xs tracking-[0.3em] font-serif uppercase">
                    {card.number}
                  </p>
                  <p className="text-gold font-serif text-xl tracking-wider">
                    {card.nameEs}
                  </p>
                  <p className="text-gold/70 text-xs tracking-wide italic">
                    {card.meaning}
                  </p>
                </div>
              </div>
            </div>

            {/* Rayos de luz */}
            {isRevealed && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-t from-transparent via-gold/20 to-transparent origin-bottom"
                      style={{
                        transform: `rotate(${i * 30}deg)`,
                        animation: "pulse 3s ease-in-out infinite",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Carta derecha - oscurecida */}
          <div 
            className="relative w-48 h-72 md:w-56 md:h-80 rounded-2xl overflow-hidden opacity-20 scale-90 transition-all duration-1000"
            style={{
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950" />
          </div>
        </div>

        {/* Mensaje de la carta */}
        <div className="text-center space-y-4 animate-in fade-in duration-1000 delay-1000 max-w-2xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-4" />
          <p className="text-lg text-foreground/90 font-medium tracking-wide italic">
            "{card.loveMessage}"
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mt-4" />
          <p className="text-sm text-gold/80 tracking-[0.2em] uppercase">
            Interpretando las fuerzas cósmicas...
          </p>
        </div>
      </div>
    </div>
  );
}