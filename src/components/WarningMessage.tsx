"use client";

interface WarningMessageProps {
  onContinue?: () => void;
}

export function WarningMessage({ onContinue }: WarningMessageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="max-w-3xl w-full space-y-12 relative z-10">
        {/* Frase destacada */}
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <p className="text-3xl md:text-4xl font-serif text-gold italic mb-8">
            "Lo que acabas de confirmar es clave..."
          </p>
        </div>

        {/* Mensaje principal */}
        <div className="text-center space-y-6 animate-in fade-in duration-1000 delay-300">
          <p className="text-lg text-foreground/90">
            Tu caso muestra una conexión real, pero hay algo bloqueando el resultado
            <br />
            que mereces.
          </p>
        </div>

        {/* Cuadro de advertencia */}
        <div 
          className="bg-gradient-to-br from-red-950/40 to-red-900/30 border-2 border-red-800/50 rounded-3xl p-8 md:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500"
          style={{
            boxShadow: "0 0 40px rgba(220, 38, 38, 0.2)",
          }}
        >
          <p className="text-xl md:text-2xl text-red-400 font-semibold text-center">
            Y esto no va a mejorar solo...
          </p>
          
          <div className="space-y-3 text-center">
            <p className="text-foreground/80 tracking-wide">
              DE HECHO, PUEDE EMPEORAR
            </p>
            <p className="text-foreground/70 text-sm">
              SI NO SE ACTÚA AHORA MISMO.
            </p>
          </div>
        </div>

        {/* Botón de continuar */}
        <div className="flex justify-center animate-in fade-in duration-1000 delay-1000">
          <button
            onClick={onContinue}
            className="group relative px-16 py-6 bg-gold hover:bg-gold/90 rounded-full transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]"
          >
            <span className="relative text-purple-deep text-lg md:text-xl font-bold tracking-widest uppercase">
              Consultar con el Maestro
            </span>

            {/* Destellos decorativos */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-foreground rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-foreground rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-150" />
          </button>
        </div>
      </div>
    </div>
  );
}