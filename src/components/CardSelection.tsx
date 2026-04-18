"use client";

import { useState } from "react";

interface CardSelectionProps {
  onCardSelected?: (cardIndex: number) => void;
}

export function CardSelection({ onCardSelected }: CardSelectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    onCardSelected?.(index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="max-w-5xl w-full space-y-12 relative z-10">
        {/* Título */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-gold tracking-[0.2em]">
            REVELA TU DESTINO
          </h2>
          <p className="text-sm text-foreground/70 tracking-widest uppercase italic">
            El cosmos ha hablado a través de tu intención sagrada
          </p>
        </div>

        {/* Cartas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              {/* Fondo de la carta */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br from-purple-card via-secondary to-purple-deep border-2 transition-all duration-500 ${
                  hoveredCard === index 
                    ? "border-gold shadow-[0_0_40px_rgba(212,175,55,0.6)]" 
                    : "border-purple-border shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                }`}
              />

              {/* Diseño del reverso de la carta */}
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
                {/* Marco decorativo exterior */}
                <div className="absolute inset-4 border-2 border-gold/30 rounded-lg" />
                
                {/* Símbolo central - Pentagrama */}
                <div className="relative w-32 h-32 mb-4">
                  <svg viewBox="0 0 100 100" className={`w-full h-full transition-all duration-500 ${hoveredCard === index ? "scale-110 rotate-12" : ""}`}>
                    {/* Pentagrama */}
                    <path
                      d="M 50 10 L 61 40 L 95 40 L 68 60 L 79 90 L 50 70 L 21 90 L 32 60 L 5 40 L 39 40 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gold/60"
                    />
                    {/* Círculo exterior */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gold/40"
                    />
                  </svg>
                </div>

                {/* Símbolos místicos decorativos */}
                <div className="space-y-2 text-center">
                  <div className="flex justify-center gap-2">
                    <span className="text-gold/50 text-2xl">☽</span>
                    <span className="text-gold/50 text-2xl">✧</span>
                    <span className="text-gold/50 text-2xl">☾</span>
                  </div>
                </div>

                {/* Destellos en hover */}
                {hoveredCard === index && (
                  <>
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold rounded-full animate-ping" />
                    <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gold rounded-full animate-ping delay-75" />
                    <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-gold rounded-full animate-ping delay-150" />
                  </>
                )}
              </div>

              {/* Brillo en hover */}
              <div 
                className={`absolute inset-0 bg-gradient-to-t from-gold/0 via-gold/5 to-gold/0 transition-opacity duration-500 ${
                  hoveredCard === index ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Texto decorativo */}
        <p className="text-center text-xs text-muted-foreground/60 italic animate-in fade-in duration-1000 delay-700">
          Elige la carta que resuene con tu energía interior
        </p>
      </div>
    </div>
  );
}