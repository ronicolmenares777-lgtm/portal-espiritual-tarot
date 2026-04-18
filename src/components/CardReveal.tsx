"use client";

import { useState, useEffect } from "react";

interface CardRevealProps {
  onComplete?: () => void;
}

export function CardReveal({ onComplete }: CardRevealProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(timer);
  }, []);

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
          {/* Carta izquierda - oscurecida */}
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden opacity-30 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-card via-secondary to-purple-deep border-2 border-purple-border" />
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
              <div className="absolute inset-4 border-2 border-gold/30 rounded-lg" />
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 50 10 L 61 40 L 95 40 L 68 60 L 79 90 L 50 70 L 21 90 L 32 60 L 5 40 L 39 40 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gold/60"
                  />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/40" />
                </svg>
              </div>
            </div>
          </div>

          {/* Carta central - revelada (The Lovers) */}
          <div 
            className={`relative aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-1000 ${
              revealed ? "scale-110 shadow-[0_0_80px_rgba(212,175,55,0.8)]" : "scale-100"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-4 border-gold">
              {/* Imagen de The Lovers simulada */}
              <div className="absolute inset-0 p-4 flex flex-col">
                {/* Header de la carta */}
                <div className="text-center space-y-1">
                  <div className="text-gold text-xs tracking-[0.3em] font-serif">THE LOVERS</div>
                  <div className="text-gold text-sm font-bold">VI</div>
                </div>

                {/* Ilustración central */}
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Aura dorada */}
                    <div className="absolute inset-0 bg-gradient-radial from-gold/30 via-gold/10 to-transparent rounded-full animate-pulse-glow" />
                    
                    {/* Símbolos místicos */}
                    <div className="text-6xl">💑</div>
                    
                    {/* Decoración - corazón */}
                    <div className="absolute bottom-4 text-2xl animate-pulse">❤️</div>
                  </div>
                </div>

                {/* Footer decorativo */}
                <div className="text-center">
                  <div className="flex justify-center gap-1 text-gold/60 text-xl">
                    <span>✧</span>
                    <span>◆</span>
                    <span>✧</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Brillo exterior */}
            {revealed && (
              <div className="absolute -inset-2 bg-gold/20 rounded-2xl blur-xl animate-pulse-glow" />
            )}
          </div>

          {/* Carta derecha - oscurecida */}
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden opacity-30 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-card via-secondary to-purple-deep border-2 border-purple-border" />
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
              <div className="absolute inset-4 border-2 border-gold/30 rounded-lg" />
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M 50 10 L 61 40 L 95 40 L 68 60 L 79 90 L 50 70 L 21 90 L 32 60 L 5 40 L 39 40 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gold/60"
                  />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/40" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Texto de resultado */}
        <div className="text-center space-y-4 animate-in fade-in duration-1000 delay-1000">
          <p className="text-xl text-foreground font-light">
            Tu destino ha sido revelado.
          </p>
          <p className="text-sm text-gold/80 italic tracking-wider uppercase">
            Interpretando fuerzas...
          </p>
        </div>
      </div>
    </div>
  );
}