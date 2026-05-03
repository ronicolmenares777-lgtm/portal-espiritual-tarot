"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { TarotCard } from "@/lib/tarotCards";

interface CardRevealProps {
  card: TarotCard;
  onContinue: () => void;
}

export function CardReveal({ card, onContinue }: CardRevealProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Iniciar animación de volteo después de un momento
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
    }, 800);

    // Completar después de mostrar la carta - 4 segundos
    const completeTimer = setTimeout(() => {
      onContinue();
    }, 4000); // 4 segundos para mejor ritmo

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(completeTimer);
    };
  }, [onContinue]);

  const handleImageError = () => {
    console.error("Error cargando imagen:", card.image);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log("Imagen cargada correctamente:", card.image);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Partículas de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto space-y-6 sm:space-y-8 md:space-y-12">
        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-3 sm:space-y-4"
        >
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gold tracking-wider px-4">
            {card.name.toUpperCase()}
          </h1>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="h-px w-12 sm:w-16 md:w-24 bg-gradient-to-r from-transparent to-gold/50" />
            <span className="text-gold/70 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em]">
              ARCANO DEL TAROT
            </span>
            <div className="h-px w-12 sm:w-16 md:w-24 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </motion.div>

        {/* Carta revelada */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            rotateY: 0,
          }}
          transition={{
            duration: 1.2,
            delay: 0.3,
            type: "spring",
            stiffness: 100,
          }}
          className="relative mx-auto"
          style={{ perspective: "1000px" }}
        >
          <div className="relative w-48 h-64 sm:w-56 sm:h-80 md:w-72 md:h-96 mx-auto">
            {/* Resplandor de fondo */}
            <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-gold/20 via-accent/20 to-gold/20 rounded-3xl blur-3xl animate-pulse-glow" />
            
            {/* Imagen de la carta */}
            <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-gold/40 shadow-2xl shadow-gold/50">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>

            {/* Decoraciones en las esquinas */}
            <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 text-2xl sm:text-3xl md:text-4xl">✦</div>
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-2xl sm:text-3xl md:text-4xl">✦</div>
            <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 text-2xl sm:text-3xl md:text-4xl">✦</div>
            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 text-2xl sm:text-3xl md:text-4xl">✦</div>
          </div>
        </motion.div>

        {/* Significado */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-gold/10 via-accent/10 to-gold/10 rounded-2xl sm:rounded-3xl blur-xl" />
          
          <div className="relative bg-card/60 backdrop-blur-xl border-2 border-gold/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-gold mb-3 sm:mb-4 text-center">
              Mensaje del Cosmos
            </h2>
            <p className="text-foreground/90 text-sm sm:text-base md:text-lg leading-relaxed text-center">
              {card.interpretation}
            </p>
          </div>
        </motion.div>

        {/* Botón continuar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center pt-4 sm:pt-6 md:pt-8"
        >
          <motion.button
            onClick={onContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group overflow-hidden rounded-xl px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 font-bold text-base sm:text-lg md:text-xl tracking-wide transition-all shadow-lg shadow-gold/30 hover:shadow-2xl hover:shadow-gold/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold via-accent to-gold transition-all group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-background flex items-center justify-center gap-2 sm:gap-3">
              <span>Continuar</span>
              <span className="text-xl sm:text-2xl">→</span>
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Círculos decorativos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-gold/5"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}