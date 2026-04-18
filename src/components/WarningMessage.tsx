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

        {/* Bola de Cristal Profesional */}
        <div className="flex flex-col items-center gap-8">
          <p className="text-center text-sm text-muted-foreground/80 tracking-wider">
            Mantén presionada la esfera para conectar con el maestro
          </p>

          <div className="relative">
            {/* Anillos de energía orbital */}
            {isPressed && (
              <>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-gold/20" />
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-gold/10" />
                </div>
              </>
            )}

            {/* Contenedor principal */}
            <button
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              disabled={isDone}
              className="relative group focus:outline-none"
            >
              {/* Base de madera oscura */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 rounded-[50%] bg-gradient-to-b from-amber-900/80 to-amber-950 border-t-2 border-amber-700/50"
                   style={{
                     boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 215, 0, 0.1)',
                   }}>
                {/* Textura de madera */}
                <div className="absolute inset-0 rounded-[50%] opacity-30"
                     style={{
                       background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 69, 19, 0.3) 2px, rgba(139, 69, 19, 0.3) 4px)',
                     }} />
              </div>

              {/* Bola de cristal */}
              <div 
                className={`relative w-64 h-64 rounded-full transition-all duration-500 ${
                  isPressed ? 'scale-[1.05]' : 'scale-100 hover:scale-[1.02]'
                }`}
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9), rgba(230, 230, 255, 0.6) 25%, rgba(200, 180, 255, 0.4) 50%, rgba(150, 120, 220, 0.5) 70%, rgba(100, 70, 180, 0.6) 85%, rgba(60, 30, 120, 0.7))',
                  boxShadow: isPressed 
                    ? '0 0 100px rgba(212, 175, 55, 0.7), inset 0 0 80px rgba(255, 255, 255, 0.3), inset -20px -20px 60px rgba(100, 70, 180, 0.4), 0 30px 80px rgba(0, 0, 0, 0.5)'
                    : '0 0 50px rgba(212, 175, 55, 0.4), inset 0 0 60px rgba(255, 255, 255, 0.2), inset -15px -15px 40px rgba(100, 70, 180, 0.3), 0 20px 50px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Reflejo superior principal - más grande y brillante */}
                <div 
                  className="absolute top-[12%] left-[18%] w-28 h-28 rounded-full opacity-90 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.6) 40%, transparent 70%)',
                    filter: 'blur(12px)',
                  }}
                />

                {/* Reflejo secundario */}
                <div 
                  className="absolute top-[25%] left-[35%] w-16 h-16 rounded-full opacity-60 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent 60%)',
                    filter: 'blur(8px)',
                  }}
                />

                {/* Reflejo inferior derecho */}
                <div 
                  className="absolute bottom-[18%] right-[22%] w-20 h-20 rounded-full opacity-40 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.7), transparent 65%)',
                    filter: 'blur(10px)',
                  }}
                />

                {/* Nebulosa interior - energía mística */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  {/* Capa 1 - Dorada */}
                  <div 
                    className={`absolute inset-0 opacity-40 ${isPressed ? 'animate-spin' : ''}`}
                    style={{
                      background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(212, 175, 55, 0.5), transparent 70%)',
                      animationDuration: '12s',
                    }}
                  />
                  {/* Capa 2 - Púrpura */}
                  <div 
                    className={`absolute inset-0 opacity-35 ${isPressed ? 'animate-spin' : ''}`}
                    style={{
                      background: 'radial-gradient(ellipse 50% 60% at 60% 50%, rgba(180, 140, 255, 0.4), transparent 65%)',
                      animationDuration: '9s',
                      animationDirection: 'reverse',
                    }}
                  />
                  {/* Capa 3 - Azul místico */}
                  <div 
                    className={`absolute inset-0 opacity-30 ${isPressed ? 'animate-spin' : ''}`}
                    style={{
                      background: 'radial-gradient(ellipse 55% 50% at 40% 55%, rgba(120, 180, 255, 0.3), transparent 70%)',
                      animationDuration: '15s',
                    }}
                  />
                </div>

                {/* Partículas flotantes internas - más sutiles */}
                {isPressed && (
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: Math.random() * 3 + 1 + 'px',
                          height: Math.random() * 3 + 1 + 'px',
                          left: Math.random() * 100 + '%',
                          top: Math.random() * 100 + '%',
                          background: i % 3 === 0 ? 'rgba(212, 175, 55, 0.8)' : i % 3 === 1 ? 'rgba(180, 140, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                          boxShadow: `0 0 ${Math.random() * 4 + 2}px currentColor`,
                          animation: 'float 3s ease-in-out infinite',
                          animationDelay: Math.random() * 3 + 's',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Símbolo central */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {isDone ? (
                    <div className="animate-in zoom-in duration-500">
                      <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center backdrop-blur-sm border-2 border-gold">
                        <svg className="w-12 h-12 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className={`relative transition-all duration-500 ${isPressed ? 'scale-110' : 'scale-100'}`}>
                      {/* Ojo místico con diseño refinado */}
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center border border-gold/30">
                        <svg className="w-12 h-12 text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        {/* Pupila central animada */}
                        <div className={`absolute w-4 h-4 rounded-full bg-gold ${isPressed ? 'animate-pulse' : ''}`}
                             style={{
                               boxShadow: '0 0 12px hsl(var(--gold)), 0 0 24px hsl(var(--gold) / 0.5)',
                             }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de progreso circular exterior */}
                {isPressed && !isDone && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" style={{ filter: 'drop-shadow(0 0 12px hsl(var(--gold)))' }}>
                    <circle
                      cx="50%"
                      cy="50%"
                      r="48%"
                      fill="none"
                      stroke="hsl(var(--gold) / 0.2)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="48%"
                      fill="none"
                      stroke="hsl(var(--gold))"
                      strokeWidth="2"
                      strokeDasharray="603"
                      strokeDashoffset={603 - (603 * progress) / 100}
                      className="transition-all duration-100"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Contador de progreso */}
                {isPressed && !isDone && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold text-xs font-semibold tracking-[0.2em] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] pointer-events-none">
                    {progress}%
                  </div>
                )}

                {/* Brillo de borde - efecto cristal */}
                <div className="absolute inset-0 rounded-full pointer-events-none"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)',
                       mixBlendMode: 'overlay',
                     }} />
              </div>

              {/* Sombra proyectada */}
              <div 
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-56 h-12 rounded-[50%] opacity-60 blur-2xl transition-all duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.6), transparent 70%)',
                  transform: isPressed 
                    ? 'translateX(-50%) translateY(4px) scale(1.1)' 
                    : 'translateX(-50%) scale(1)',
                }}
              />
            </button>
          </div>

          <p className={`text-center text-xs tracking-widest uppercase transition-all duration-500 ${
            isDone ? 'text-gold' : 'text-gold/60'
          }`}>
            {isDone ? (
              <span className="animate-pulse">✨ Conexión establecida ✨</span>
            ) : (
              'Canalizando energía espiritual'
            )}
          </p>
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