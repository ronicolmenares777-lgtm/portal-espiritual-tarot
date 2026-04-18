"use client";

import { useState, useEffect } from "react";
import type { TarotCard } from "@/lib/tarotCards";

interface CardRevealProps {
  card: TarotCard;
  cardIndex: number;
  onComplete: () => void;
}

export function CardReveal({ card, cardIndex, onComplete }: CardRevealProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log("CardReveal - Carta recibida:", card.name, "Imagen URL:", card.image);
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(completeTimer);
    };
  }, [card, onComplete]);

  const handleImageError = () => {
    console.error("Error cargando imagen:", card.image);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log("Imagen cargada correctamente:", card.image);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Rayos de luz dorada desde el centro */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-gold/0 via-gold/30 to-gold/0 origin-bottom animate-pulse"
            style={{
              height: "150vh",
              transform: `rotate(${i * 30}deg) translateY(-50%)`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: "3s",
            }}
          />
        ))}
      </div>

      {/* Partículas doradas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Título */}
        <div className="text-center mb-12 space-y-4">
          <h1 
            className="font-serif text-4xl md:text-6xl text-gold tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-1000"
            style={{
              textShadow: "0 0 20px hsl(var(--gold) / 0.5)",
            }}
          >
            REVELA TU DESTINO
          </h1>
          <p className="text-foreground/80 text-sm md:text-base tracking-widest animate-in fade-in duration-1000 delay-300">
            EL COSMOS HA HABLADO A TRAVÉS DE TU INTENCIÓN SAGRADA
          </p>
        </div>

        {/* Cartas */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`relative aspect-[2/3] transition-all duration-1000 ${
                index === cardIndex
                  ? "scale-110 z-20"
                  : "scale-90 opacity-30 blur-sm"
              }`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              {/* Marco exterior */}
              <div
                className={`absolute inset-0 rounded-xl ${
                  index === cardIndex
                    ? "bg-gradient-to-br from-gold via-accent to-gold"
                    : "bg-purple-900/20"
                }`}
                style={{
                  padding: "3px",
                  boxShadow:
                    index === cardIndex
                      ? "0 0 60px hsl(var(--gold) / 0.8), 0 0 100px hsl(var(--gold) / 0.4)"
                      : "none",
                }}
              >
                {/* Carta interior */}
                <div className="w-full h-full bg-white rounded-xl overflow-hidden relative">
                  {index === cardIndex ? (
                    <>
                      {/* Imagen real del tarot */}
                      {!imageError ? (
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                          <div className="text-center space-y-2">
                            <div className="text-6xl">🌟</div>
                            <p className="font-serif text-amber-900 text-lg">{card.name}</p>
                            <p className="text-amber-700 text-sm">{card.number}</p>
                          </div>
                        </div>
                      )}

                      {/* Overlay con efecto de brillo */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent pointer-events-none animate-pulse"
                        style={{ animationDuration: "2s" }}
                      />
                    </>
                  ) : (
                    /* Cartas laterales - reverso */
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 200 300">
                          <circle cx="100" cy="150" r="60" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold" />
                          <path d="M100,90 L120,140 L180,150 L120,160 L100,210 L80,160 L20,150 L80,140 Z" fill="currentColor" className="text-gold/50" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Corazones flotantes alrededor de la carta seleccionada */}
              {index === cardIndex && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-gold/60 animate-float"
                      style={{
                        fontSize: `${12 + Math.random() * 8}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random()}s`,
                      }}
                    >
                      ♥
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Nombre y mensaje de la carta */}
        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
          <div className="inline-block">
            <div 
              className="font-serif text-2xl md:text-4xl text-gold mb-2 tracking-wider px-8 py-4 rounded-lg bg-purple-900/30 backdrop-blur-sm border border-gold/30"
              style={{
                textShadow: "0 0 20px hsl(var(--gold) / 0.6)",
              }}
            >
              {card.name}
            </div>
            <div className="text-gold/60 text-sm tracking-[0.3em] mt-2">
              {card.number}
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-foreground text-lg md:text-xl leading-relaxed px-4">
              {card.loveMessage}
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-6" />
            <p className="text-accent text-sm md:text-base italic px-4">
              ✨ Los astros confirman: El amor verdadero regresa ✨
            </p>
          </div>
        </div>

        {/* Texto inferior */}
        <div className="text-center mt-12 animate-in fade-in duration-1000 delay-1000">
          <p className="text-muted-foreground/60 text-xs tracking-[0.3em] uppercase animate-pulse">
            Interpretando las fuerzas cósmicas...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}