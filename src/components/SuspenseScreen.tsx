"use client";

import { useEffect, useRef } from "react";

export function SuspenseScreen() {
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    console.log("⏳ SuspenseScreen iniciado - timer de 3 segundos");

    const timer = setTimeout(() => {
      console.log("✅ Timer de SuspenseScreen completado");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Partículas de fondo */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Contenido central */}
      <div className="text-center z-10">
        <h2 className="font-serif text-4xl md:text-6xl text-primary mb-8 animate-pulse">
          Preparando tu lectura...
        </h2>
        <div className="w-24 h-24 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}