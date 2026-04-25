"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface SuspenseScreenProps {
  onComplete?: () => void;
}

export function SuspenseScreen({ onComplete }: SuspenseScreenProps) {
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    console.log("⏳ SuspenseScreen iniciado - timer de 3 segundos");

    const timer = setTimeout(() => {
      console.log("✅ Timer de SuspenseScreen completado");
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-2xl mx-auto px-4"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent"
          >
            Tu camino comienza
          </motion.h2>
        </motion.div>
        <div className="w-24 h-24 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}