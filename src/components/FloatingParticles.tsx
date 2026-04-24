"use client";

import { useState, useEffect } from "react";

interface Particle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generar partículas solo en el cliente para evitar errores de hidratación
    const newParticles = [...Array(10)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${15 + Math.random() * 15}s`,
    }));
    setParticles(newParticles);
  }, []);

  // No renderizar nada en el servidor
  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gold rounded-full opacity-30 animate-float"
          style={particle}
        />
      ))}
    </div>
  );
}