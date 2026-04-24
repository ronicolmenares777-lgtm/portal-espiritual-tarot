"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TarotCard } from "@/lib/tarotCards";

interface CardRevealProps {
  card: TarotCard;
  cardIndex: number;
  onComplete: () => void;
}

export function CardReveal({ card, cardIndex, onComplete }: CardRevealProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Iniciar animación de volteo después de un momento
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
    }, 800);

    // Completar después de mostrar la carta - Aumentado a 5 segundos
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000); // Cambiado de 3000ms a 5000ms

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleImageError = () => {
    console.error("Error cargando imagen:", card.image);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log("Imagen cargada correctamente:", card.image);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-4 mb-12"
      >
        <h1 className="font-serif text-4xl md:text-6xl text-gold tracking-wider">
          REVELA TU DESTINO
        </h1>
        <p className="text-gold/70 text-sm tracking-[0.3em] uppercase">
          El cosmos ha hablado a través de tu intención sagrada
        </p>
      </motion.div>

      {/* Contenedor de cartas */}
      <div className="flex gap-6 md:gap-8 items-center justify-center mb-12">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ 
              opacity: index === cardIndex ? 1 : 0.3,
              scale: index === cardIndex ? 1.1 : 0.9,
              y: 0
            }}
            transition={{ 
              duration: 0.8,
              delay: index * 0.2,
              type: "spring",
              stiffness: 100
            }}
            className={`relative ${index === cardIndex ? 'z-10' : 'z-0'}`}
            style={{
              perspective: "1000px",
            }}
          >
            <motion.div
              className="relative w-40 h-60 md:w-48 md:h-72"
              style={{
                transformStyle: "preserve-3d",
              }}
              animate={{
                rotateY: index === cardIndex && isFlipped ? 180 : 0,
              }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
              }}
            >
              {/* Reverso de la carta */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl border-2 border-gold/30 flex items-center justify-center relative overflow-hidden shadow-2xl">
                  {/* Patrón de fondo místico */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--gold))" strokeWidth="2"/>
                        <circle cx="60" cy="60" r="40" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5"/>
                        <path d="M60 10 L60 110 M10 60 L110 60" stroke="hsl(var(--gold))" strokeWidth="1"/>
                        <path d="M25 25 L95 95 M95 25 L25 95" stroke="hsl(var(--gold))" strokeWidth="1"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Pentagrama central */}
                  <svg width="80" height="80" viewBox="0 0 100 100" className="relative z-10">
                    <path
                      d="M50 10 L61 40 L92 40 L67 58 L78 88 L50 70 L22 88 L33 58 L8 40 L39 40 Z"
                      fill="none"
                      stroke="hsl(var(--gold))"
                      strokeWidth="2"
                    />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>

              {/* Frente de la carta (imagen del tarot) */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {index === cardIndex && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="w-full h-full bg-white rounded-2xl overflow-hidden relative shadow-2xl"
                  >
                    {/* Imagen real del tarot */}
                    {!imageError ? (
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                        <div className="text-center space-y-2">
                          <div className="text-6xl">🌟</div>
                          <p className="font-serif text-amber-900 text-lg">{card.name}</p>
                          <p className="text-amber-700 text-sm">{card.number}</p>
                        </div>
                      </div>
                    )}

                    {/* Efecto de brillo dorado sobre la carta revelada */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        background: "radial-gradient(circle at center, rgba(218, 165, 32, 0.4) 0%, transparent 70%)",
                      }}
                    />

                    {/* Borde brillante */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-gold/50 pointer-events-none shadow-[0_0_30px_rgba(218,165,32,0.5)]" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Sombra debajo de la carta */}
            {index === cardIndex && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-gold/20 rounded-full blur-xl"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Mensaje de la carta */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 30 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="max-w-2xl text-center space-y-6"
      >
        <div className="space-y-2">
          <h2 className="font-serif text-3xl text-gold">
            {card.name}
          </h2>
          <p className="text-gold/60 text-sm tracking-[0.2em]">
            {card.number}
          </p>
        </div>
        
        <p className="text-foreground/90 text-lg leading-relaxed">
          {card.loveMessage}
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="text-gold/70 text-sm italic flex items-center justify-center gap-2"
        >
          ✨ Los astros confirman: El amor verdadero regresará ✨
        </motion.p>
      </motion.div>

      {/* Rayos de luz dorados desde la carta */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFlipped ? 0.15 : 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: "100%",
              height: "2px",
              background: "linear-gradient(90deg, hsl(var(--gold)) 0%, transparent 100%)",
              transform: `rotate(${(i * 360) / 12}deg)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>

      {/* Partículas flotantes doradas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Texto inferior */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-12 text-gold/50 text-xs tracking-[0.3em] uppercase"
      >
        Interpretando las fuerzas cósmicas...
      </motion.p>

      <style jsx>{`
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}