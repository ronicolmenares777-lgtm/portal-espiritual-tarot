"use client";

import { useState } from "react";

interface CardSelectionProps {
  onCardSelected?: () => void;
}

// Arcanos Mayores relacionados con el amor
const tarotCards = [
  {
    id: 0,
    name: "THE LOVERS",
    number: "VI",
    image: "https://images.unsplash.com/photo-1614625383606-c4d7a5d9c2d9?w=400&h=600&fit=crop",
    meaning: "Unión divina"
  },
  {
    id: 1,
    name: "THE STAR",
    number: "XVII",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=600&fit=crop",
    meaning: "Esperanza renovada"
  },
  {
    id: 2,
    name: "THE SUN",
    number: "XIX",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=600&fit=crop",
    meaning: "Alegría radiante"
  }
];

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
          {tarotCards.map((card, index) => (
            <button
              key={card.id}
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
                {/* Card Back - Diseño místico mejorado */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-black">
                  {/* Textura de fondo */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                  
                  {/* Diseño central místico */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <svg viewBox="0 0 200 280" className="w-full h-full">
                      {/* Marco ornamental */}
                      <rect
                        x="15"
                        y="15"
                        width="170"
                        height="250"
                        fill="none"
                        stroke="url(#goldGradient)"
                        strokeWidth="2"
                        rx="8"
                      />
                      <rect
                        x="20"
                        y="20"
                        width="160"
                        height="240"
                        fill="none"
                        stroke="url(#goldGradient)"
                        strokeWidth="1"
                        opacity="0.5"
                        rx="6"
                      />

                      {/* Pentagrama central */}
                      <g transform="translate(100, 100)">
                        <circle
                          r="45"
                          fill="none"
                          stroke="url(#goldGradient)"
                          strokeWidth="1.5"
                          opacity="0.7"
                        />
                        <path
                          d="M0,-45 L13,-14 L43,-14 L18,7 L29,38 L0,17 L-29,38 L-18,7 L-43,-14 L-13,-14 Z"
                          fill="none"
                          stroke="url(#goldGradient)"
                          strokeWidth="2"
                          className="animate-pulse-glow"
                        />
                      </g>

                      {/* Luna creciente superior */}
                      <path
                        d="M100 35 Q95 45 100 55 Q105 45 100 35 M100 38 Q103 45 100 52"
                        fill="url(#goldGradient)"
                        opacity="0.8"
                      />

                      {/* Sol inferior */}
                      <circle cx="100" cy="240" r="8" fill="url(#goldGradient)" opacity="0.8" />
                      {[...Array(8)].map((_, i) => (
                        <line
                          key={i}
                          x1="100"
                          y1="240"
                          x2={100 + Math.cos((i * Math.PI) / 4) * 15}
                          y2={240 + Math.sin((i * Math.PI) / 4) * 15}
                          stroke="url(#goldGradient)"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      ))}

                      {/* Estrellas decorativas */}
                      {[
                        [40, 60], [160, 60], [40, 220], [160, 220],
                        [30, 140], [170, 140]
                      ].map(([x, y], i) => (
                        <g key={i}>
                          <circle
                            cx={x}
                            cy={y}
                            r="2"
                            fill="url(#goldGradient)"
                            className="animate-pulse-glow"
                            style={{ animationDelay: `${i * 0.3}s` }}
                          />
                          <path
                            d={`M${x},${y-4} L${x},${y+4} M${x-4},${y} L${x+4},${y}`}
                            stroke="url(#goldGradient)"
                            strokeWidth="0.5"
                            opacity="0.6"
                          />
                        </g>
                      ))}

                      {/* Texto místico */}
                      <text
                        x="100"
                        y="180"
                        textAnchor="middle"
                        fill="url(#goldGradient)"
                        fontSize="12"
                        fontFamily="serif"
                        letterSpacing="3"
                        opacity="0.7"
                      >
                        ARCANA
                      </text>

                      {/* Gradientes */}
                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--gold))" />
                          <stop offset="50%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--gold))" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Borde ornamental */}
                  <div className="absolute inset-0 border-4 border-gold/20 rounded-2xl" />
                  <div className="absolute inset-2 border border-gold/10 rounded-xl" />
                </div>

                {/* Glow effect on hover */}
                {hoveredCard === index && (
                  <>
                    <div className="absolute inset-0 bg-gold/10 animate-pulse-glow" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gold/20 via-transparent to-gold/20" />
                  </>
                )}
              </div>

              {/* Card meaning indicator */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <p className="text-gold/60 text-xs tracking-widest uppercase">
                  {hoveredCard === index ? card.meaning : `ARCANO ${card.number}`}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Instrucción */}
        <p className="text-center text-sm text-muted-foreground/80 tracking-wider animate-in fade-in duration-700 delay-700 mt-12">
          Elige la carta que resuene con la energía de tu corazón
        </p>
      </div>
    </div>
  );
}