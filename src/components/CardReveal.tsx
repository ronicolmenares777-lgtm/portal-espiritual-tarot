"use client";

import { useState, useEffect } from "react";

interface CardRevealProps {
  onComplete?: () => void;
}

// La carta revelada será The Lovers (Los Enamorados)
const revealedCard = {
  name: "THE LOVERS",
  number: "VI",
  image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&h=750&fit=crop",
  title: "Los Enamorados",
  subtitle: "El retorno del amor verdadero"
};

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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-black border-4 border-gold/20" />
          </div>

          {/* Carta central - THE LOVERS REVELADA */}
          <div 
            className={`relative transition-all duration-1000 ${
              isRevealed ? "scale-110" : "scale-100"
            }`}
          >
            <div 
              className="relative w-56 h-80 md:w-64 md:h-96 rounded-2xl overflow-hidden"
              style={{
                boxShadow: isRevealed
                  ? "0 0 60px hsl(var(--gold) / 0.8), 0 0 120px hsl(var(--gold) / 0.4), 0 0 180px hsl(var(--gold) / 0.2)"
                  : "0 10px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* The Lovers Card */}
              <div className="absolute inset-0">
                {/* Imagen del arcano */}
                <img 
                  src={revealedCard.image}
                  alt={revealedCard.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay místico */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-purple-950/40" />
                
                {/* Efectos de luz si está revelado */}
                {isRevealed && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-gold/20 via-transparent to-gold/20 animate-pulse-glow" />
                    
                    {/* Partículas de luz */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-gold rounded-full animate-float"
                        style={{
                          left: `${10 + (i % 4) * 25}%`,
                          top: `${20 + Math.floor(i / 4) * 25}%`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: `${3 + (i % 3)}s`,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Marco ornamental dorado */}
              <div className="absolute inset-0 border-4 border-gold/60 rounded-2xl pointer-events-none" />
              <div className="absolute inset-2 border border-gold/30 rounded-xl pointer-events-none" />
              
              {/* Esquinas decorativas */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 384">
                {/* Esquina superior izquierda */}
                <path d="M20,20 L40,20 M20,20 L20,40" stroke="hsl(var(--gold))" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                {/* Esquina superior derecha */}
                <path d="M236,20 L216,20 M236,20 L236,40" stroke="hsl(var(--gold))" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                {/* Esquina inferior izquierda */}
                <path d="M20,364 L40,364 M20,364 L20,344" stroke="hsl(var(--gold))" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                {/* Esquina inferior derecha */}
                <path d="M236,364 L216,364 M236,364 L236,344" stroke="hsl(var(--gold))" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
              </svg>
              
              {/* Placa con el nombre de la carta */}
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="bg-gradient-to-r from-transparent via-purple-950/90 to-transparent backdrop-blur-sm py-1 px-8 border-t border-b border-gold/30">
                  <p className="text-gold font-serif text-xs tracking-[0.3em]">{revealedCard.number}</p>
                </div>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                <div className="bg-gradient-to-t from-purple-950/95 via-purple-950/90 to-transparent backdrop-blur-sm py-3 px-4 rounded-lg border border-gold/30">
                  <p className="text-gold font-serif text-lg md:text-xl tracking-wider mb-1">{revealedCard.name}</p>
                  <p className="text-gold/70 text-xs tracking-widest uppercase">{revealedCard.title}</p>
                  <p className="text-gold/60 text-xs tracking-wide italic mt-1">{revealedCard.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Rayos de luz celestial */}
            {isRevealed && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-0.5 h-full origin-bottom opacity-20"
                      style={{
                        background: "linear-gradient(to top, transparent, hsl(var(--gold)), transparent)",
                        transform: `rotate(${i * 30}deg)`,
                        animation: "pulse 3s ease-in-out infinite",
                        animationDelay: `${i * 0.15}s`,
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
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-black border-4 border-gold/20" />
          </div>
        </div>

        {/* Mensaje de revelación */}
        <div className="text-center space-y-3 animate-in fade-in duration-1000 delay-1000">
          <p className="text-lg text-foreground font-medium tracking-wide">
            Los arcanos confirman el retorno del amor verdadero
          </p>
          <p className="text-sm text-gold/80 tracking-[0.2em] uppercase italic">
            Interpretando las fuerzas cósmicas...
          </p>
        </div>
      </div>
    </div>
  );
}