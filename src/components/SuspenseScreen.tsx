"use client";

interface SuspenseScreenProps {
  onReveal?: () => void;
}

export function SuspenseScreen({ onReveal }: SuspenseScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full space-y-16 relative z-10">
        {/* Título dramático */}
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-6xl md:text-7xl font-serif font-bold text-gold tracking-wider animate-pulse-glow">
            Y LO SABES...
          </h2>
        </div>

        {/* Botón de revelación */}
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <button
            onClick={onReveal}
            className="group relative px-12 py-6 bg-transparent border-3 border-gold rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]"
          >
            {/* Fondo animado en hover */}
            <div className="absolute inset-0 bg-gold/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            
            {/* Texto del botón */}
            <span className="relative text-gold text-lg md:text-xl font-semibold tracking-widest uppercase">
              Revelar Mi Destino
            </span>

            {/* Destellos decorativos */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gold rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-150" />
          </button>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold/40 rounded-full animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gold/40 rounded-full animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-gold/40 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        </div>
      </div>
    </div>
  );
}