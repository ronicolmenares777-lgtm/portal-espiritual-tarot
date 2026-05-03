"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
      <div className="relative z-10 space-y-8">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif text-gold tracking-wider text-center"
        >
          ANALIZANDO TU ENERGÍA
        </motion.h1>

        {/* Contenedor de bola de cristal y botón WhatsApp */}
        <div className="flex items-center justify-center gap-8">
          {/* Bola de cristal animada */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-64 h-64"
          >
            {/* Resplandor exterior */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold/30 via-accent/30 to-gold/30 rounded-full blur-3xl animate-pulse-glow" />
            
            {/* Bola principal */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 backdrop-blur-xl border-4 border-gold/40 shadow-2xl shadow-gold/50 overflow-hidden">
              {/* Efecto de brillo interno */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
              
              {/* Partículas internas flotantes */}
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-gold/60 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      x: [-5, 5, -5],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Botón de WhatsApp grande */}
          <motion.a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="relative w-64 h-64 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all flex items-center justify-center group cursor-pointer border-4 border-green-400/40"
          >
            {/* Resplandor exterior del botón */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-green-400/30 to-green-500/30 rounded-full blur-3xl animate-pulse-glow" />
            
            {/* Icono de WhatsApp */}
            <div className="relative z-10">
              <svg
                className="w-32 h-32 text-white drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>

            {/* Texto debajo del icono */}
            <div className="absolute bottom-12 text-center">
              <p className="text-white font-bold text-xl drop-shadow-lg">
                ¿Necesitas ayuda?
              </p>
              <p className="text-white/90 text-sm">
                Escríbenos
              </p>
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          </motion.a>
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