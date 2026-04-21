"use client";

import { useEffect, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // Prevenir múltiples llamadas
    if (hasCalledRef.current) {
      return;
    }

    console.log("⏳ LoadingScreen montado, iniciando timer de 3 segundos...");

    const timer = setTimeout(() => {
      if (!hasCalledRef.current) {
        hasCalledRef.current = true;
        console.log("✅ Timer completado, avanzando a cartas");
        onComplete();
      }
    }, 3000); // Reducido a 3 segundos

    return () => {
      console.log("🧹 LoadingScreen limpiando timer");
      clearTimeout(timer);
    };
  }, []); // Sin dependencias para evitar re-ejecución

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Partículas de fondo */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Contenido central */}
      <div className="relative z-10 text-center max-w-md px-6">
        {/* Círculos concéntricos animados */}
        <div className="relative w-40 h-40 mx-auto mb-12">
          <div className="absolute inset-0 border-2 border-gold/20 rounded-full animate-ping" />
          <div
            className="absolute inset-4 border-2 border-gold/40 rounded-full animate-ping"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute inset-8 border-2 border-gold/60 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-serif text-gold tracking-[0.3em] mb-4">
          CONEXIÓN DIGITAL
        </h1>

        {/* Subtítulo */}
        <p className="text-sm md:text-base text-gold/70 tracking-[0.2em] mb-8">
          ANALIZANDO FRECUENCIA DEL ALMA
        </p>

        {/* Barra de progreso */}
        <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
          <div className="progress-bar h-full bg-gradient-to-r from-gold via-accent to-gold rounded-full" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .progress-bar {
          animation: progress 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}