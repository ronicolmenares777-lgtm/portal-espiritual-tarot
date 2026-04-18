"use client";

import { useState, useEffect } from "react";

interface WarningMessageProps {
  onContinue?: () => void;
}

export function WarningMessage({ onContinue }: WarningMessageProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPressing && !isComplete) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 2;
          if (next >= 100) {
            setIsComplete(true);
            setTimeout(() => {
              onContinue?.();
            }, 300);
            return 100;
          }
          return next;
        });
      }, 40); // 2000ms total / 50 steps
    } else if (!isPressing && !isComplete) {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isPressing, isComplete, onContinue]);

  const handleMouseDown = () => {
    setIsPressing(true);
  };

  const handleMouseUp = () => {
    setIsPressing(false);
  };

  const handleMouseLeave = () => {
    setIsPressing(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full space-y-8 relative z-10">
        {/* Mensaje superior */}
        <div className="text-center space-y-4 animate-in slide-in-from-top duration-700">
          <p className="text-lg md:text-xl text-gold/90 italic tracking-wide font-serif">
            "Lo que acabas de confirmar es clave..."
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed max-w-xl mx-auto">
            Tu caso muestra una conexión real, pero hay algo bloqueando el resultado
            que mereces.
          </p>
        </div>

        {/* Cuadro de advertencia */}
        <div 
          className="bg-gradient-to-br from-red-950/40 to-red-900/30 border-2 border-red-500/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-in fade-in duration-700 delay-300"
          style={{
            boxShadow: "0 0 40px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div className="text-center space-y-4">
            <p className="text-red-400 text-base md:text-lg font-semibold tracking-wide">
              Y esto no va a mejorar solo...
            </p>
            <div className="space-y-2 text-sm text-red-200/80">
              <p className="uppercase tracking-wider">De hecho, puede empeorar</p>
              <p className="uppercase tracking-wider">Si no se actúa ahora mismo.</p>
            </div>
          </div>
        </div>

        {/* Bola de cristal interactiva */}
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-700 delay-500">
          <p className="text-sm text-gold/70 tracking-wider uppercase text-center">
            Mantén presionada la esfera para consultar al maestro
          </p>
          
          <div className="relative">
            {/* Círculo de progreso */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="hsl(var(--gold))"
                strokeWidth="3"
                opacity="0.2"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="hsl(var(--gold))"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-100"
                style={{
                  filter: progress > 0 ? "drop-shadow(0 0 8px hsl(var(--gold)))" : "none",
                }}
              />
            </svg>

            {/* Bola de cristal */}
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={isComplete}
              className="relative w-48 h-48 rounded-full focus:outline-none transition-all duration-300 disabled:cursor-default"
              style={{
                transform: isPressing ? "scale(0.95)" : "scale(1)",
              }}
            >
              {/* Esfera exterior con gradiente */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-indigo-600/40 to-purple-700/30 backdrop-blur-md border-4 border-gold/40 transition-all duration-300"
                style={{
                  boxShadow: isPressing 
                    ? "0 0 60px hsl(var(--gold) / 0.6), 0 0 100px hsl(var(--primary) / 0.4), inset 0 0 40px rgba(139, 92, 246, 0.3)"
                    : "0 0 30px hsl(var(--gold) / 0.3), 0 0 50px hsl(var(--primary) / 0.2), inset 0 0 20px rgba(139, 92, 246, 0.2)",
                }}
              />

              {/* Brillo superior (highlight) */}
              <div className="absolute top-6 left-6 right-12 h-16 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-xl" />

              {/* Efecto de niebla interior */}
              <div 
                className="absolute inset-8 rounded-full bg-gradient-radial from-purple-400/20 via-transparent to-transparent animate-pulse-slow"
                style={{
                  animationDuration: isPressing ? "1s" : "3s",
                }}
              />

              {/* Partículas mágicas */}
              {isPressing && (
                <div className="absolute inset-0">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-gold rounded-full animate-float"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: "2s",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Símbolo místico central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-24 h-24 opacity-60">
                  {/* Ojo místico */}
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="30"
                    ry="20"
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth="2"
                    className={isPressing ? "animate-pulse-glow" : ""}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="8"
                    fill="hsl(var(--gold))"
                    className={isPressing ? "animate-pulse" : ""}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="4"
                    fill="hsl(var(--background))"
                  />
                </svg>
              </div>

              {/* Texto de progreso */}
              {isPressing && progress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gold text-xs font-semibold tracking-wider animate-pulse">
                    {Math.round(progress)}%
                  </span>
                </div>
              )}

              {isComplete && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gold text-sm font-semibold tracking-wider animate-pulse">
                    ✓
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Texto inferior */}
          <p className="text-xs text-muted-foreground/60 text-center max-w-sm italic">
            La bola de cristal conectará tu energía con el maestro espiritual
          </p>
        </div>
      </div>
    </div>
  );
}