"use client";

import { useState } from "react";

interface CardSelectionProps {
  onCardSelected?: () => void;
}

export function CardSelection({ onCardSelected }: CardSelectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    setTimeout(() => {
      onCardSelected?.();
    }, 800);
  };

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
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              disabled={selectedCard !== null}
              className={`relative group transition-all duration-500 ${
                selectedCard === index ? "scale-110" : ""
              } ${
                selectedCard !== null && selectedCard !== index ? "opacity-30 scale-90" : ""
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
              }}
            >
              {/* Card Container */}
              <div 
                className={`relative w-48 h-72 md:w-56 md:h-80 rounded-2xl overflow-hidden transition-all duration-500 ${
                  hoveredCard === index ? "scale-105" : ""
                }`}
                style={{
                  boxShadow: hoveredCard === index 
                    ? "0 0 40px hsl(var(--gold) / 0.6), 0 0 80px hsl(var(--gold) / 0.3)"
                    : "0 10px 40px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Card Back - Imagen de reverso místico */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-purple-900/90 border-4 border-gold/30">
                  <img 
                    src="https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=600&fit=crop"
                    alt="Card back"
                    className="w-full h-full object-cover opacity-40"
                  />
                  
                  {/* Símbolos místicos overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 200 300" className="w-full h-full p-8 opacity-80">
                      {/* Pentagram */}
                      <path
                        d="M100 40 L115 85 L165 85 L125 115 L140 160 L100 130 L60 160 L75 115 L35 85 L85 85 Z"
                        fill="none"
                        stroke="hsl(var(--gold))"
                        strokeWidth="2"
                        className="animate-pulse-glow"
                      />
                      
                      {/* Círculo exterior */}
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke="hsl(var(--gold))"
                        strokeWidth="1.5"
                        opacity="0.5"
                      />
                      
                      {/* Luna */}
                      <path
                        d="M100 180 Q110 200 100 220 Q90 200 100 180"
                        fill="hsl(var(--gold))"
                        opacity="0.6"
                      />
                      
                      {/* Estrellas pequeñas */}
                      {[30, 50, 150, 170].map((x, i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={40 + i * 60}
                          r="2"
                          fill="hsl(var(--gold))"
                          opacity="0.8"
                          className="animate-pulse-glow"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Glow effect on hover */}
                {hoveredCard === index && (
                  <div className="absolute inset-0 bg-gold/10 animate-pulse-glow" />
                )}
              </div>

              {/* Card number indicator */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gold/60 text-sm tracking-widest">
                CARTA {index + 1}
              </div>
            </button>
          ))}
        </div>

        {/* Instrucción */}
        <p className="text-center text-sm text-muted-foreground/80 tracking-wider animate-in fade-in duration-700 delay-700">
          Elige la carta que resuene con tu energía interior
        </p>
      </div>
    </div>
  );
}