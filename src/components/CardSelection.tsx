"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRandomCards, type TarotCard } from "@/lib/tarotCards";

interface CardSelectionProps {
  onCardSelected: (card: TarotCard, index: number) => void;
}

export function CardSelection({ onCardSelected }: CardSelectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [cards, setCards] = useState<TarotCard[]>([]);

  // Generar 3 cartas aleatorias al montar
  useEffect(() => {
    setCards(getRandomCards());
  }, []);

  const handleCardClick = (index: number) => {
    setSelectedCard(index);
    setTimeout(() => {
      onCardSelected(cards[index], index);
    }, 800);
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16 px-4"
      >
        <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl text-gold tracking-wider">
          SELECCIONA TU CARTA
        </h1>
        <p className="text-gold/70 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase max-w-lg mx-auto">
          El cosmos aguarda tu elección
        </p>
      </motion.div>

      {/* Cartas */}
      <div className="flex gap-4 sm:gap-6 md:gap-12 items-center justify-center mb-8 sm:mb-12 flex-wrap max-w-4xl">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ 
              opacity: selectedCard === null || selectedCard === index ? 1 : 0.3,
              scale: 1,
              y: 0
            }}
            transition={{ 
              duration: 0.6,
              delay: index * 0.15,
              type: "spring",
              stiffness: 100
            }}
            className="relative cursor-pointer"
            onHoverStart={() => setHoveredCard(index)}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => handleCardClick(index)}
            style={{
              perspective: "1000px",
            }}
          >
            <motion.div
              className="w-32 h-44 sm:w-36 sm:h-52 md:w-44 md:h-64"
              animate={{
                rotateY: hoveredCard === index ? 5 : 0,
                z: hoveredCard === index ? 50 : 0,
              }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
              }}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Carta - Reverso místico */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl border-2 border-gold/30 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-300">
                {/* Patrón de fondo místico */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <svg width="80" height="80" viewBox="0 0 120 120" className="sm:w-[100px] sm:h-[100px]">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--gold))" strokeWidth="2"/>
                      <circle cx="60" cy="60" r="40" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5"/>
                      <path d="M60 10 L60 110 M10 60 L110 60" stroke="hsl(var(--gold))" strokeWidth="1"/>
                      <path d="M25 25 L95 95 M95 25 L25 95" stroke="hsl(var(--gold))" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
                
                {/* Pentagrama central */}
                <motion.svg
                  width="60"
                  height="60"
                  viewBox="0 0 100 100"
                  className="relative z-10 sm:w-[70px] sm:h-[70px]"
                  animate={{
                    rotate: hoveredCard === index ? 360 : 0,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <path
                    d="M50 10 L61 40 L92 40 L67 58 L78 88 L50 70 L22 88 L33 58 L8 40 L39 40 Z"
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth="2"
                  />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5"/>
                </motion.svg>

                {/* Símbolos en las esquinas */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 text-gold/50 text-xs">☽</div>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gold/50 text-xs">☀</div>
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 text-gold/50 text-xs">✦</div>
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-gold/50 text-xs">✧</div>

                {/* Efecto de brillo en hover */}
                <AnimatePresence>
                  {hoveredCard === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-gold/20 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Borde brillante en hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: hoveredCard === index
                      ? "0 0 40px rgba(218, 165, 32, 0.6), inset 0 0 20px rgba(218, 165, 32, 0.2)"
                      : "0 0 0px rgba(218, 165, 32, 0)",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Sombra dinámica */}
            <motion.div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-4 sm:h-6 bg-gold/20 rounded-full blur-xl"
              animate={{
                opacity: hoveredCard === index ? 0.6 : 0.3,
                scale: hoveredCard === index ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Partículas brillantes en hover */}
            <AnimatePresence>
              {hoveredCard === index && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-gold/80 rounded-full"
                      initial={{
                        x: "50%",
                        y: "50%",
                        opacity: 0,
                      }}
                      animate={{
                        x: `${50 + Math.cos((i * Math.PI) / 3) * 100}%`,
                        y: `${50 + Math.sin((i * Math.PI) / 3) * 100}%`,
                        opacity: [0, 1, 0],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Instrucción */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center space-y-2 px-4 max-w-2xl"
      >
        <p className="text-foreground/80 text-sm sm:text-base md:text-lg">
          Cierra los ojos, respira profundo y deja que tu intuición te guíe
        </p>
        <p className="text-gold/60 text-xs sm:text-sm tracking-wider">
          Elige la carta que resuene con la energía de tu corazón
        </p>
      </motion.div>

      {/* Círculos decorativos animados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-gold/10"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}