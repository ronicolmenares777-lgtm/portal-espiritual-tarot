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
            Los ángeles guardianes te guían hacia el reencuentro
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
                {/* Card Back - Reverso angelical */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/90">
                  {/* Fondo celestial */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]" />
                  </div>
                  
                  {/* Marco dorado ornamentado */}
                  <div className="absolute inset-3 border-2 border-gold/40 rounded-xl">
                    <div className="absolute inset-2 border border-gold/20 rounded-lg" />
                  </div>

                  {/* Símbolos angelicales en el centro */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 200 300" className="w-full h-full p-12 opacity-90">
                      {/* Alas angelicales */}
                      <g className="animate-pulse-glow">
                        {/* Ala izquierda */}
                        <path
                          d="M70 100 Q40 90 30 110 Q35 130 70 120 Z"
                          fill="none"
                          stroke="hsl(var(--gold))"
                          strokeWidth="1.5"
                          opacity="0.7"
                        />
                        <path
                          d="M65 110 Q35 105 28 125 Q33 140 65 130 Z"
                          fill="none"
                          stroke="hsl(var(--gold))"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                        
                        {/* Ala derecha */}
                        <path
                          d="M130 100 Q160 90 170 110 Q165 130 130 120 Z"
                          fill="none"
                          stroke="hsl(var(--gold))"
                          strokeWidth="1.5"
                          opacity="0.7"
                        />
                        <path
                          d="M135 110 Q165 105 172 125 Q167 140 135 130 Z"
                          fill="none"
                          stroke="hsl(var(--gold))"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      </g>

                      {/* Corazón celestial en el centro */}
                      <path
                        d="M100 140 L85 125 Q80 115 90 110 Q100 115 100 115 Q100 115 110 110 Q120 115 115 125 Z"
                        fill="hsl(var(--gold))"
                        opacity="0.5"
                        className="animate-pulse-glow"
                        style={{ animationDelay: "0.5s" }}
                      />

                      {/* Halo */}
                      <ellipse
                        cx="100"
                        cy="80"
                        rx="30"
                        ry="8"
                        fill="none"
                        stroke="hsl(var(--gold))"
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-pulse-glow"
                      />

                      {/* Estrellas divinas */}
                      {[
                        [50, 60], [150, 60], [40, 150], [160, 150],
                        [100, 50], [70, 180], [130, 180]
                      ].map(([x, y], i) => (
                        <g key={i}>
                          <circle
                            cx={x}
                            cy={y}
                            r="2"
                            fill="hsl(var(--gold))"
                            opacity="0.8"
                            className="animate-pulse-glow"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                          <line
                            x1={x}
                            y1={y - 5}
                            x2={x}
                            y2={y + 5}
                            stroke="hsl(var(--gold))"
                            strokeWidth="0.5"
                            opacity="0.5"
                          />
                          <line
                            x1={x - 5}
                            y1={y}
                            x2={x + 5}
                            y2={y}
                            stroke="hsl(var(--gold))"
                            strokeWidth="0.5"
                            opacity="0.5"
                          />
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* Texto místico */}
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-gold/60 text-xs tracking-[0.3em] font-serif">ÁNGELES</p>
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
          Elige la carta que los ángeles te revelan
        </p>
      </div>
    </div>
  );
}