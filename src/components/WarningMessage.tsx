"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WarningMessageProps {
  onOpenChat: () => void;
}

export function WarningMessage({ onOpenChat }: WarningMessageProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  const PRESS_DURATION = 3000; // 3 segundos

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [pressTimer, progressInterval]);

  const handlePressStart = () => {
    console.log("🔮 [BALL] Iniciando presión de bola de cristal");
    setIsPressing(true);
    setPressProgress(0);

    // Timer para completar la acción
    const timer = setTimeout(() => {
      console.log("✅ [BALL] Presión completada - Abriendo chat");
      onOpenChat();
      handlePressEnd();
    }, PRESS_DURATION);
    setPressTimer(timer);

    // Actualizar progreso cada 50ms
    const interval = setInterval(() => {
      setPressProgress((prev) => {
        const newProgress = prev + (50 / PRESS_DURATION) * 100;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);
    setProgressInterval(interval);
  };

  const handlePressEnd = () => {
    console.log("⏹️ [BALL] Finalizando presión");
    setIsPressing(false);
    setPressProgress(0);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo místico animado */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-purple-900/30 to-background" />
      
      {/* Estrellas flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gold/30 rounded-full animate-pulse-glow"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Mensaje principal */}
        <div className="text-center space-y-6">
          <div className="inline-block">
            <p className="text-gold/80 text-sm tracking-[0.3em] uppercase mb-2 font-medium">
              Mensaje del Cosmos
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-6" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif italic text-gold/90 leading-relaxed">
            "Lo que acabas de confirmar es clave..."
          </h2>
          
          <p className="text-base text-foreground/90 leading-relaxed max-w-xl mx-auto">
            Tu caso muestra una conexión real, pero hay algo bloqueando el resultado
            que mereces.
          </p>
        </div>

        {/* Advertencia */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-red-950/40 to-red-900/30 backdrop-blur-sm border-2 border-red-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-4 text-center">
              <h3 className="text-2xl font-serif text-red-300 tracking-wide">
                Y esto no va a mejorar solo...
              </h3>
              <p className="text-red-200/80 text-sm tracking-wide uppercase font-medium">
                De hecho, puede empeorar
              </p>
              <p className="text-red-100/70 text-sm leading-relaxed">
                Si no se actúa ahora mismo.
              </p>
            </div>
          </div>
        </div>

        {/* Contenedor de bola de cristal y botón WhatsApp - Responsive mejorado */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-8 my-12 px-4">
          {/* Bola de cristal interactiva */}
          <div className="relative flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-56 h-56 sm:w-48 sm:h-48 md:w-64 md:h-64 cursor-pointer"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Resplandor exterior */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold/30 via-accent/30 to-gold/30 rounded-full blur-3xl animate-pulse-glow" />
              
              {/* Indicador de progreso circular */}
              {isPressing && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-gold/30"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 48} ${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - pressProgress / 100)}`}
                    className="text-gold transition-all duration-75"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              
              {/* Bola principal */}
              <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 backdrop-blur-xl border-4 ${isPressing ? "border-gold" : "border-gold/40"} shadow-2xl shadow-gold/50 overflow-hidden transition-all`}>
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

                {/* Símbolo central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: isPressing ? [1, 1.2, 1] : [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: isPressing ? 0.5 : 2, repeat: Infinity },
                    }}
                    className="text-5xl sm:text-6xl md:text-7xl"
                  >
                    🔮
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Texto indicativo debajo de la bola */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gold/80 text-xs sm:text-sm md:text-base font-medium text-center max-w-[200px] sm:max-w-none"
            >
              {isPressing ? (
                <span className="text-gold font-bold animate-pulse">
                  ✨ {Math.round(pressProgress)}%
                </span>
              ) : (
                "Mantén presionada para abrir chat"
              )}
            </motion.p>
          </div>

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
            className="relative w-56 h-56 sm:w-48 sm:h-48 md:w-64 md:h-64 flex flex-col items-center justify-center gap-4 group cursor-pointer"
          >
            {/* Círculo del botón */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all flex items-center justify-center border-4 border-green-400/40">
              {/* Resplandor exterior del botón */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-green-400/30 to-green-500/30 rounded-full blur-3xl animate-pulse-glow" />
              
              {/* Icono de WhatsApp */}
              <div className="relative z-10">
                <svg
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>

              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            </div>

            {/* Texto debajo del botón */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
              <p className="text-green-400 font-bold text-base sm:text-lg md:text-xl drop-shadow-lg">
                Conversar por
              </p>
              <p className="text-green-300 font-bold text-lg sm:text-xl md:text-2xl drop-shadow-lg">
                WHATSAPP
              </p>
            </div>
          </motion.a>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}