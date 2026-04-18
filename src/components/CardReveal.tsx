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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-purple-900/90 border-4 border-gold/30">
              <img 
                src="https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=600&fit=crop"
                alt="Card back"
                className="w-full h-full object-cover opacity-40"
              />
            </div>
          </div>

          {/* Carta central - The Lovers REVELADA */}
          <div 
            className={`relative transition-all duration-1000 ${
              isRevealed ? "scale-110" : "scale-100"
            }`}
          >
            <div 
              className="relative w-56 h-80 md:w-64 md:h-96 rounded-2xl overflow-hidden"
              style={{
                boxShadow: isRevealed
                  ? "0 0 60px hsl(var(--gold) / 0.8), 0 0 120px hsl(var(--gold) / 0.4)"
                  : "0 10px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* The Lovers Card - Imagen real de tarot */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
                <img 
                  src="https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?w=400&h=600&fit=crop"
                  alt="The Lovers Tarot Card"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay con brillo dorado */}
                {isRevealed && (
                  <div className="absolute inset-0 bg-gradient-to-t from-gold/20 via-transparent to-gold/20 animate-pulse-glow" />
                )}
              </div>

              {/* Marco dorado */}
              <div className="absolute inset-0 border-4 border-gold/50 rounded-2xl" />
              
              {/* Título de la carta */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="bg-purple-900/90 backdrop-blur-sm py-2 px-4 mx-4 rounded-lg border border-gold/30">
                  <p className="text-gold font-serif text-xl tracking-wider">THE LOVERS</p>
                  <p className="text-gold/60 text-xs tracking-widest uppercase">VI</p>
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-purple-900/90 border-4 border-gold/30">
              <img 
                src="https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=600&fit=crop"
                alt="Card back"
                className="w-full h-full object-cover opacity-40"
              />
            </div>
          </div>
        </div>

        {/* Mensaje de revelación */}
        <div className="text-center space-y-3 animate-in fade-in duration-1000 delay-1000">
          <p className="text-lg text-foreground font-medium tracking-wide">
            Tu destino ha sido revelado.
          </p>
          <p className="text-sm text-gold/80 tracking-[0.2em] uppercase italic">
            Interpretando fuerzas...
          </p>
        </div>
      </div>
    </div>
  );
}