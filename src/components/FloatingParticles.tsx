"use client";

export function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => ( // Reducido de 20 a 15 partículas
        <div
          key={i}
          className="absolute w-1 h-1 bg-gold rounded-full opacity-30 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 15}s`, // Más lento: 15-30s en lugar de 10-20s
          }}
        />
      ))}
    </div>
  );
}