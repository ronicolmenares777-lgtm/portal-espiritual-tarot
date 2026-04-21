"use client";

import { useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  // Auto-avanzar después de 5 segundos
  useEffect(() => {
    console.log("⏳ LoadingScreen montado, iniciando timer de 5 segundos...");
    const timer = setTimeout(() => {
      console.log("✅ Timer de LoadingScreen completado, llamando onComplete");
      onComplete();
    }, 5000);

    return () => {
      console.log("🧹 LoadingScreen desmontado, limpiando timer");
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="max-w-md w-full space-y-12 relative z-10">
        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gold text-center tracking-[0.3em] animate-in fade-in duration-1000">
          CONEXIÓN
          <br />
          DIGITAL
        </h2>

        {/* Animación de círculos concéntricos */}
        <div className="relative w-64 h-64 mx-auto">
          {/* Círculo exterior */}
          <div 
            className="absolute inset-0 border-2 border-gold/30 rounded-full animate-ping"
            style={{ animationDuration: "3s" }}
          />
          
          {/* Círculo medio */}
          <div 
            className="absolute inset-8 border-2 border-gold/40 rounded-full animate-ping"
            style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}
          />
          
          {/* Círculo interior */}
          <div 
            className="absolute inset-16 border-2 border-gold/50 rounded-full animate-ping"
            style={{ animationDuration: "2s", animationDelay: "0.6s" }}
          />
          
          {/* Símbolo central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-gold rounded-full opacity-60 animate-pulse-glow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-l-transparent border-gold rounded-full transform rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* Texto inferior */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gold/80 tracking-[0.2em] uppercase animate-pulse">
            Analizando frecuencia del alma
          </p>
          
          {/* Barra de progreso */}
          <div className="w-full max-w-xs mx-auto h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold rounded-full animate-progress"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes animate-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: animate-progress 5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}