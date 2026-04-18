"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updatePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Cursor principal - punto dorado */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-screen"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="relative">
          {/* Punto central dorado */}
          <div className="w-2 h-2 bg-gold rounded-full" />
          
          {/* Resplandor exterior */}
          <div className="absolute inset-0 w-2 h-2 bg-gold rounded-full blur-sm opacity-60 animate-pulse-glow" />
          
          {/* Anillo de destello */}
          <div className="absolute -inset-2 w-6 h-6 border border-gold/30 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Trail suave */}
      <div
        className="fixed pointer-events-none z-[9998] mix-blend-screen transition-all duration-200 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="w-8 h-8 border border-gold/20 rounded-full" />
      </div>
    </>
  );
}