import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { SEO } from "@/components/SEO";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <SEO 
        title="Portal Espiritual - Descubre Tu Destino"
        description="Experiencia mística de tarot premium. Conecta con el cosmos y revela tu destino a través de una lectura espiritual guiada."
      />
      
      <CustomCursor />
      <FloatingParticles />
      
      <main className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Título principal */}
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gold tracking-wider">
              TU CAMINO
              <br />
              COMIENZA...
            </h1>
            <p className="text-sm text-muted-foreground tracking-widest uppercase">
              Explícanos brevemente qué revelación buscas hoy
            </p>
          </div>

          {/* Formulario */}
          <div 
            className="bg-card border border-purple-border rounded-2xl p-8 space-y-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
            style={{
              boxShadow: "0 0 40px hsl(var(--purple-border) / 0.3)",
            }}
          >
            {/* Campo Nombre */}
            <div className="space-y-2">
              <label className="text-xs text-gold tracking-widest uppercase font-medium">
                Nombre Sagrado
              </label>
              <input
                type="text"
                placeholder="Ej. María Sánchez"
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
              />
            </div>

            {/* Campo WhatsApp */}
            <div className="space-y-2">
              <label className="text-xs text-gold tracking-widest uppercase font-medium">
                Vínculo de Comunicación (WhatsApp)
              </label>
              <div className="flex gap-2">
                <select className="bg-muted border border-border rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50">
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+54">🇦🇷 +54</option>
                </select>
                <input
                  type="tel"
                  placeholder="+1"
                  className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
              </div>
            </div>

            {/* Campo Problema */}
            <div className="space-y-2">
              <label className="text-xs text-gold tracking-widest uppercase font-medium">
                ¿Qué te aflige el alma?
              </label>
              <textarea
                rows={4}
                placeholder="Ej. El regreso de mi ser amado..."
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none"
              />
            </div>

            {/* Botón Submit */}
            <button className="w-full bg-secondary hover:bg-secondary/80 text-gold border-2 border-gold rounded-lg py-4 font-semibold tracking-wider uppercase transition-all duration-300 hover:glow-gold hover:scale-[1.02] active:scale-[0.98]">
              Iniciar Ritual Espiritual
            </button>
          </div>

          {/* Texto decorativo inferior */}
          <p className="text-center text-xs text-muted-foreground/60 italic animate-in fade-in duration-1000 delay-700">
            El cosmos aguarda tu intención sagrada
          </p>
        </div>

        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </main>
    </>
  );
}