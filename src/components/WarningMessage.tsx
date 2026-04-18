"use client";

import { useState, useEffect } from "react";

interface WarningMessageProps {
  onContinue?: () => void;
}

export function WarningMessage({ onContinue }: WarningMessageProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isPressed) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setIsDone(true);
          setTimeout(() => onContinue?.(), 500);
          return 100;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPressed, onContinue]);

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

        {/* Bola de Cristal Mejorada */}
        <div className="flex flex-col items-center gap-8">
          <p className="text-center text-sm text-muted-foreground/80 tracking-wider">
            Mantén presionada la esfera para conectar con el maestro
          </p>

          <div className="relative">
            {/* Partículas orbitales */}
            {isPressed && (
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-gold rounded-full opacity-60"
                    style={{
                      transform: `rotate(${i * 45}deg) translateX(140px)`,
                      boxShadow: '0 0 10px hsl(var(--gold))',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Anillo exterior brillante */}
            {isPressed && (
              <div 
                className="absolute inset-0 rounded-full animate-pulse-glow"
                style={{
                  width: '280px',
                  height: '280px',
                  border: '2px solid hsl(var(--gold) / 0.3)',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}

            {/* Bola de cristal principal */}
            <button
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              disabled={isDone}
              className="relative group"
            >
              <div 
                className={`relative w-64 h-64 rounded-full transition-all duration-300 ${
                  isPressed ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), rgba(200, 180, 255, 0.2) 30%, rgba(120, 80, 200, 0.3) 60%, rgba(60, 20, 100, 0.5))',
                  boxShadow: isPressed 
                    ? '0 0 80px rgba(212, 175, 55, 0.6), inset 0 0 60px rgba(255, 255, 255, 0.2), 0 20px 60px rgba(0, 0, 0, 0.4)'
                    : '0 0 40px rgba(212, 175, 55, 0.3), inset 0 0 40px rgba(255, 255, 255, 0.15), 0 15px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Reflejo superior */}
                <div 
                  className="absolute top-[15%] left-[20%] w-20 h-20 rounded-full opacity-60"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent 60%)',
                    filter: 'blur(10px)',
                  }}
                />

                {/* Reflejo inferior suave */}
                <div 
                  className="absolute bottom-[20%] right-[25%] w-16 h-16 rounded-full opacity-40"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                />

                {/* Nebulosa interior animada */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-0 opacity-50 ${isPressed ? 'animate-spin' : ''}`}
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.3), transparent 70%)',
                      animationDuration: '8s',
                    }}
                  />
                  <div 
                    className={`absolute inset-0 opacity-40 ${isPressed ? 'animate-spin' : ''}`}
                    style={{
                      background: 'radial-gradient(ellipse at 70% 50%, rgba(180, 140, 255, 0.3), transparent 60%)',
                      animationDuration: '6s',
                      animationDirection: 'reverse',
                    }}
                  />
                </div>

                {/* Partículas internas flotantes */}
                {isPressed && (
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-gold/60 rounded-full animate-float"
                        style={{
                          width: Math.random() * 4 + 2 + 'px',
                          height: Math.random() * 4 + 2 + 'px',
                          left: Math.random() * 100 + '%',
                          top: Math.random() * 100 + '%',
                          animationDelay: Math.random() * 2 + 's',
                          animationDuration: Math.random() * 3 + 2 + 's',
                          boxShadow: '0 0 8px hsl(var(--gold))',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Símbolo central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isDone ? (
                    <svg className="w-20 h-20 text-gold animate-in zoom-in duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className={`relative ${isPressed ? 'animate-pulse' : ''}`}>
                      {/* Ojo místico */}
                      <svg className="w-16 h-16 text-gold/80" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de progreso circular */}
                {isPressed && !isDone && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="hsl(var(--gold) / 0.3)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="hsl(var(--gold))"
                      strokeWidth="3"
                      strokeDasharray="565"
                      strokeDashoffset={565 - (565 * progress) / 100}
                      className="transition-all duration-100"
                      style={{
                        filter: 'drop-shadow(0 0 8px hsl(var(--gold)))',
                      }}
                    />
                  </svg>
                )}

                {/* Contador de progreso */}
                {isPressed && !isDone && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold text-sm font-medium tracking-wider">
                    {progress}%
                  </div>
                )}
              </div>

              {/* Sombra y base */}
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full opacity-60 blur-xl transition-all duration-300"
                style={{
                  background: 'radial-gradient(ellipse, rgba(212, 175, 55, 0.4), transparent 70%)',
                  transform: isPressed ? 'translateX(-50%) scale(1.1)' : 'translateX(-50%) scale(1)',
                }}
              />
            </button>
          </div>

          <p className="text-center text-xs text-gold/60 tracking-widest uppercase animate-pulse">
            {isDone ? 'Conexión establecida...' : 'Canalizando tu energía con el maestro espiritual'}
          </p>
        </div>
      </div>
    </div>
  );
}