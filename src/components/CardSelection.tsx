"use client";

import { useState, useEffect } from "react";
import { getRandomCards, type TarotCard } from "@/lib/tarotCards";

interface CardSelectionProps {
  onCardSelected: (card: TarotCard, index: number) => void;
}

export function CardSelection({ onCardSelected }: CardSelectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [cards, setCards] = useState<TarotCard[]>([]);

  // Generar 3 cartas aleatorias al montar
  useEffect(() => {
    setCards(getRandomCards());
  }, []);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    setTimeout(() => {
      onCardSelected(cards[index], index);
    }, 800);
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

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
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              disabled={selectedCard !== null}
              className={`relative group transition-all duration-500 animate-in slide-in-from-bottom delay-${index * 200} ${
                selectedCard === index ? "scale-110" : ""
              } ${
                selectedCard !== null && selectedCard !== index ? "opacity-30 scale-90" : ""
              }`}
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
                {/* Card Back - Diseño mejorado con símbolos místicos */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950">
                  {/* Patron de fondo */}
                  <div className="absolute inset-0 opacity-30">
                    <svg className="w-full h-full" viewBox="0 0 200 300">
                      <defs>
                        <pattern id={`stars-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <circle cx="5" cy="5" r="1" fill="hsl(var(--gold))" opacity="0.3" />
                          <circle cx="25" cy="15" r="0.5" fill="hsl(var(--gold))" opacity="0.4" />
                          <circle cx="15" cy="30" r="0.8" fill="hsl(var(--gold))" opacity="0.3" />
                        </pattern>
                      </defs>
                      <rect width="200" height="300" fill={`url(#stars-${index})`} />
                    </svg>
                  </div>

                  {/* Marco ornamental dorado */}
                  <div className="absolute inset-4 border-2 border-gold/40 rounded-xl">
                    <div className="absolute inset-2 border border-gold/20 rounded-lg" />
                  </div>

                  {/* Símbolos centrales */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 200 300" className="w-full h-full p-12">
                      {/* Pentagrama central */}
                      <g className="animate-pulse-glow" style={{ animationDuration: "3s" }}>
                        <path
                          d="M100 80 L115 120 L160 120 L125 145 L140 185 L100 160 L60 185 L75 145 L40 120 L85 120 Z"
                          fill="none"
                          stroke="hsl(var(--gold))"
                          strokeWidth="2"
                          opacity="0.8"
                        />
                        <circle
                          cx="100"
                          cy="132.5"
                          r="55"
                          fill="none"
                          stroke="hsl(var(--gold))"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      </g>

                      {/* Luna creciente superior */}
                      <g transform="translate(100, 40)">
                        <path
                          d="M -10 0 Q 0 -15 10 0 Q 0 10 -10 0"
                          fill="hsl(var(--gold))"
                          opacity="0.7"
                          className="animate-pulse-glow"
                          style={{ animationDelay: "0.5s", animationDuration: "4s" }}
                        />
                      </g>

                      {/* Sol inferior */}
                      <g transform="translate(100, 220)">
                        <circle cx="0" cy="0" r="12" fill="hsl(var(--gold))" opacity="0.7" />
                        {[...Array(8)].map((_, i) => (
                          <line
                            key={i}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="-20"
                            stroke="hsl(var(--gold))"
                            strokeWidth="2"
                            opacity="0.6"
                            transform={`rotate(${i * 45})`}
                          />
                        ))}
                      </g>

                      {/* Estrellas en las esquinas */}
                      {[
                        { x: 30, y: 50 },
                        { x: 170, y: 50 },
                        { x: 30, y: 250 },
                        { x: 170, y: 250 }
                      ].map((pos, i) => (
                        <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                          <path
                            d="M 0 -5 L 1 -1 L 5 0 L 1 1 L 0 5 L -1 1 L -5 0 L -1 -1 Z"
                            fill="hsl(var(--gold))"
                            opacity="0.7"
                            className="animate-pulse-glow"
                            style={{ animationDelay: `${i * 0.3}s` }}
                          />
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Texto místico en el centro */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <p className="text-gold/80 text-xs tracking-[0.3em] font-serif uppercase">
                        Arcano
                      </p>
                      <div className="w-16 h-px bg-gold/50 mx-auto" />
                      <p className="text-gold/80 text-xs tracking-[0.3em] font-serif uppercase">
                        Mayor
                      </p>
                    </div>
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
          Elige la carta que resuene con la energía de tu corazón
        </p>
      </div>
    </div>
  );
}