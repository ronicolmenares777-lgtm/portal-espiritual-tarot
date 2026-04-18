"use client";

import { useState, useEffect } from "react";

interface CardRevealProps {
  onComplete?: () => void;
}

export function CardReveal({ onComplete }: CardRevealProps) {
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
            TU ÁNGEL GUARDIÁN HABLA
          </h2>
          <p className="text-sm text-gold/70 tracking-[0.15em] uppercase animate-in fade-in duration-700 delay-300">
            El amor verdadero siempre encuentra su camino de regreso
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/90 border-4 border-gold/30" />
          </div>

          {/* Carta central - ÁNGEL DEL AMOR REVELADA */}
          <div 
            className={`relative transition-all duration-1000 ${
              isRevealed ? "scale-110" : "scale-100"
            }`}
          >
            <div 
              className="relative w-56 h-80 md:w-64 md:h-96 rounded-2xl overflow-hidden"
              style={{
                boxShadow: isRevealed
                  ? "0 0 60px hsl(var(--gold) / 0.8), 0 0 120px hsl(var(--gold) / 0.4), 0 0 180px hsl(45 100% 70% / 0.2)"
                  : "0 10px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Carta del Ángel del Amor */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100">
                {/* Imagen del ángel - usando imagen angelical hermosa */}
                <img 
                  src="https://images.unsplash.com/photo-1518176258769-f227c798150e?w=400&h=600&fit=crop&sat=-20&brightness=10"
                  alt="Ángel del Retorno del Amor"
                  className="w-full h-full object-cover opacity-90"
                />
                
                {/* Overlay celestial */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 via-transparent to-gold/20" />
                
                {/* Elementos decorativos angelicales */}
                <div className="absolute inset-0">
                  {/* Alas doradas en las esquinas superiores */}
                  <svg viewBox="0 0 400 600" className="absolute inset-0 w-full h-full opacity-40">
                    {/* Ala izquierda superior */}
                    <path
                      d="M50 100 Q20 80 10 110 Q15 140 50 130 L60 120 Z"
                      fill="hsl(var(--gold))"
                      opacity="0.6"
                    />
                    {/* Ala derecha superior */}
                    <path
                      d="M350 100 Q380 80 390 110 Q385 140 350 130 L340 120 Z"
                      fill="hsl(var(--gold))"
                      opacity="0.6"
                    />
                  </svg>

                  {/* Corazones flotantes */}
                  {[
                    { top: "15%", left: "10%", delay: "0s" },
                    { top: "25%", right: "12%", delay: "0.5s" },
                    { top: "70%", left: "8%", delay: "1s" },
                    { top: "75%", right: "10%", delay: "1.5s" }
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 opacity-60 animate-float"
                      style={{
                        ...pos,
                        animationDelay: pos.delay,
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="hsl(var(--gold))">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  ))}
                </div>
                
                {/* Overlay con brillo dorado */}
                {isRevealed && (
                  <div className="absolute inset-0 bg-gradient-to-t from-gold/30 via-transparent to-gold/30 animate-pulse-glow" />
                )}
              </div>

              {/* Marco dorado ornamentado */}
              <div className="absolute inset-0 border-4 border-gold/60 rounded-2xl" />
              <div className="absolute inset-2 border-2 border-gold/30 rounded-xl" />
              
              {/* Título de la carta */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="bg-gradient-to-r from-pink-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-sm py-3 px-4 mx-4 rounded-xl border-2 border-gold/40 shadow-2xl">
                  <p className="text-gold font-serif text-xl md:text-2xl tracking-wider font-bold">EL RETORNO DEL AMOR</p>
                  <p className="text-gold/80 text-xs tracking-widest uppercase mt-1">Ángel de la Reunión</p>
                </div>
              </div>
            </div>

            {/* Rayos de luz angelical */}
            {isRevealed && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%]">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-t from-transparent via-gold/30 to-transparent origin-bottom"
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/90 border-4 border-gold/30" />
          </div>
        </div>

        {/* Mensaje de revelación */}
        <div className="text-center space-y-4 animate-in fade-in duration-1000 delay-1000">
          <p className="text-xl text-foreground font-medium tracking-wide font-serif">
            Los ángeles confirman: El amor verdadero regresa.
          </p>
          <p className="text-sm text-gold/80 tracking-[0.2em] uppercase italic">
            Interpretando señales divinas...
          </p>
        </div>
      </div>
    </div>
  );
}