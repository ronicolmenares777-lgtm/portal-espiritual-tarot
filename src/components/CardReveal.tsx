"use client";

import { useState, useEffect } from "react";
import type { TarotCard } from "@/lib/tarotCards";

interface CardRevealProps {
  card: TarotCard;
  cardIndex: number;
  onComplete?: () => void;
}

export function CardReveal({ card, cardIndex, onComplete }: CardRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Trigger reveal animation after mount
    setTimeout(() => setIsRevealed(true), 500);
    
    // Auto-advance after revealing
    setTimeout(() => {
      onComplete?.();
    }, 4000);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="max-w-6xl w-full space-y-12 relative z-10">
        {/* Título */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gold tracking-[0.2em] animate-in slide-in-from-top duration-700">
            TU DESTINO REVELADO
          </h2>
          <p className="text-sm text-gold/70 tracking-[0.15em] uppercase animate-in fade-in duration-700 delay-300">
            Los arcanos han hablado
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-purple-900/90">
              {/* Reverso de carta */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <svg viewBox="0 0 200 300" className="w-full h-full opacity-60">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "hsl(var(--gold))", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "hsl(var(--gold))", stopOpacity: 0.3 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M100 40 L115 85 L165 85 L125 115 L140 160 L100 130 L60 160 L75 115 L35 85 L85 85 Z"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="2"
                  />
                  <circle cx="100" cy="100" r="70" fill="none" stroke="url(#grad1)" strokeWidth="1.5" opacity="0.5" />
                </svg>
              </div>
            </div>
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
              {/* Imagen real de la carta del tarot */}
              <img 
                src={card.image}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/RWS_Tarot_06_Lovers.jpg/400px-RWS_Tarot_06_Lovers.jpg";
                }}
              />
              
              {/* Overlay con brillo dorado suave */}
              {isRevealed && (
                <div className="absolute inset-0 bg-gradient-to-t from-gold/10 via-transparent to-gold/10 animate-pulse-glow pointer-events-none" />
              )}

              {/* Marco dorado */}
              <div className="absolute inset-0 border-4 border-gold/50 rounded-2xl pointer-events-none" />
              
              {/* Título de la carta en la parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                <div className="text-center">
                  <p className="text-gold font-serif text-xl md:text-2xl tracking-wider font-bold">
                    {card.name}
                  </p>
                  <p className="text-gold/70 text-sm tracking-widest uppercase mt-1">
                    {card.number}
                  </p>
                </div>
              </div>
            </div>

            {/* Rayos de luz */}
            {isRevealed && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-t from-transparent via-gold/20 to-transparent origin-bottom"
                      style={{
                        transform: `rotate(${i * 45}deg)`,
                        animation: "pulse 2s ease-in-out infinite",
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-purple-900/90">
              {/* Reverso de carta */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <svg viewBox="0 0 200 300" className="w-full h-full opacity-60">
                  <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "hsl(var(--gold))", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "hsl(var(--gold))", stopOpacity: 0.3 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M100 40 L115 85 L165 85 L125 115 L140 160 L100 130 L60 160 L75 115 L35 85 L85 85 Z"
                    fill="none"
                    stroke="url(#grad2)"
                    strokeWidth="2"
                  />
                  <circle cx="100" cy="100" r="70" fill="none" stroke="url(#grad2)" strokeWidth="1.5" opacity="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de revelación */}
        <div className="text-center space-y-3 animate-in fade-in duration-1000 delay-1000">
          <p className="text-xl md:text-2xl text-gold font-serif font-semibold tracking-wide">
            {card.loveMessage}
          </p>
          <p className="text-sm text-gold/60 tracking-[0.2em] uppercase italic">
            Interpretando las fuerzas cósmicas...
          </p>
        </div>
      </div>
    </div>
  );
}