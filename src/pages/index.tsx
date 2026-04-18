import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CardSelection } from "@/components/CardSelection";
import { SuspenseScreen } from "@/components/SuspenseScreen";
import { CardReveal } from "@/components/CardReveal";
import { QuestionScreen } from "@/components/QuestionScreen";
import { WarningMessage } from "@/components/WarningMessage";
import { ChatMaestro } from "@/components/ChatMaestro";
import { SEO } from "@/components/SEO";
import { phoneValidation } from "@/lib/config";
import type { TarotCard } from "@/lib/tarotCards";
import { useState, useEffect } from "react";
import { Sparkles, Moon, Star } from "lucide-react";

type Screen =
  | "form"
  | "loading"
  | "cards"
  | "suspense"
  | "reveal"
  | "question1"
  | "question2"
  | "warning"
  | "transition"
  | "chat";

const nombreEjemplos = [
  "María González",
  "Ana Martínez", 
  "Sofia Rodríguez",
  "Laura Torres",
  "Carmen Silva",
  "Isabel Morales",
  "Valentina Cruz"
];

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("form");
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [formData, setFormData] = useState({
    nombre: "",
    countryCode: "+1",
    whatsapp: "",
    problema: "",
  });
  const [phoneError, setPhoneError] = useState<string>("");
  const [nombrePlaceholder, setNombrePlaceholder] = useState(nombreEjemplos[0]);
  const [answers, setAnswers] = useState({
    question1: "",
    question2: "",
  });

  // Cambiar placeholder de nombre cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * nombreEjemplos.length);
      setNombrePlaceholder(nombreEjemplos[randomIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const validatePhone = (phone: string, countryCode: string): boolean => {
    const validation = phoneValidation[countryCode];
    if (!validation) return true;
    
    const regex = new RegExp(validation.pattern);
    if (!regex.test(phone)) {
      setPhoneError(`Debe tener ${validation.digits} dígitos`);
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, whatsapp: cleaned });
    
    if (cleaned.length > 0) {
      validatePhone(cleaned, formData.countryCode);
    } else {
      setPhoneError("");
    }
  };

  const handleCountryChange = (code: string) => {
    setFormData({ ...formData, countryCode: code, whatsapp: "" });
    setPhoneError("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(formData.whatsapp, formData.countryCode)) {
      return;
    }
    
    setCurrentScreen("loading");
    setTimeout(() => setCurrentScreen("cards"), 3000);
  };

  const handleCardSelected = (card: TarotCard, cardIndex: number) => {
    setSelectedCard(card);
    setSelectedCardIndex(cardIndex);
    setCurrentScreen("suspense");
  };

  const handleReveal = () => {
    setCurrentScreen("reveal");
  };

  const handleRevealComplete = () => {
    setCurrentScreen("question1");
  };

  const handleQuestion1Answer = (answer: string) => {
    setAnswers({ ...answers, question1: answer });
    setCurrentScreen("question2");
  };

  const handleQuestion2Answer = (answer: string) => {
    setAnswers({ ...answers, question2: answer });
    setCurrentScreen("warning");
  };

  const handleWarningContinue = () => {
    setCurrentScreen("transition");
    setTimeout(() => setCurrentScreen("chat"), 2000);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "form":
        return (
          <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background místico mejorado */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/20 to-background" />
            
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Círculos místicos */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: "4s" }} />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: "5s", animationDelay: "1s" }} />
              
              {/* Constelación de fondo */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 1000">
                {/* Líneas de constelación */}
                <path d="M200,300 L300,250 L400,300 L350,400" stroke="hsl(var(--gold))" strokeWidth="0.5" fill="none" opacity="0.3" />
                <path d="M600,200 L700,250 L650,350" stroke="hsl(var(--gold))" strokeWidth="0.5" fill="none" opacity="0.3" />
                <path d="M150,600 L250,650 L200,750" stroke="hsl(var(--gold))" strokeWidth="0.5" fill="none" opacity="0.3" />
                <path d="M700,600 L800,550 L850,650" stroke="hsl(var(--gold))" strokeWidth="0.5" fill="none" opacity="0.3" />
                
                {/* Estrellas en las constelaciones */}
                {[
                  [200,300], [300,250], [400,300], [350,400],
                  [600,200], [700,250], [650,350],
                  [150,600], [250,650], [200,750],
                  [700,600], [800,550], [850,650]
                ].map(([cx, cy], i) => (
                  <g key={i}>
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r="2" 
                      fill="hsl(var(--gold))" 
                      className="animate-pulse-glow"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r="4" 
                      fill="none" 
                      stroke="hsl(var(--gold))" 
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </g>
                ))}
              </svg>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
              {/* Símbolo místico superior */}
              <div className="flex justify-center mb-4 animate-in fade-in duration-1000">
                <div className="relative">
                  <Star className="w-12 h-12 text-gold animate-pulse-glow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-gold/60 animate-spin" style={{ animationDuration: "8s" }} />
                  </div>
                </div>
              </div>

              {/* Título principal mejorado */}
              <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-serif font-bold text-gold tracking-[0.15em] leading-tight">
                    TU CAMINO
                    <br />
                    COMIENZA
                  </h1>
                  
                  {/* Línea decorativa */}
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
                    <Moon className="w-4 h-4 text-gold/70" />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
                  </div>
                </div>
                
                <p className="text-sm text-gold/70 tracking-[0.2em] uppercase font-light max-w-xs mx-auto leading-relaxed">
                  Los arcanos revelan el camino hacia el amor verdadero
                </p>
              </div>

              {/* Formulario mejorado */}
              <form 
                onSubmit={handleFormSubmit}
                className="relative backdrop-blur-md bg-card/40 border border-gold/20 rounded-2xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
                style={{
                  boxShadow: "0 0 60px hsl(var(--purple-border) / 0.2), inset 0 0 40px hsl(var(--card) / 0.5)",
                }}
              >
                {/* Brillo sutil en el borde */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 pointer-events-none" />
                
                {/* Campo Nombre */}
                <div className="space-y-2 relative">
                  <label className="text-xs text-gold tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Nombre Sagrado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder={nombrePlaceholder}
                    className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all backdrop-blur-sm"
                  />
                </div>

                {/* Campo WhatsApp */}
                <div className="space-y-2 relative">
                  <label className="text-xs text-gold tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                    <Moon className="w-3 h-3" />
                    Vínculo de Comunicación
                  </label>
                  <div className="flex gap-2">
                    <select 
                      value={formData.countryCode}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="bg-muted/50 border border-gold/20 rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 backdrop-blur-sm"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+58">🇻🇪 +58</option>
                    </select>
                    <div className="flex-1">
                      <input
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder={phoneValidation[formData.countryCode]?.placeholder || "1234567890"}
                        maxLength={phoneValidation[formData.countryCode]?.digits || 15}
                        className={`w-full bg-muted/50 border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all backdrop-blur-sm ${
                          phoneError 
                            ? "border-red-500 focus:ring-red-500/50" 
                            : "border-gold/20 focus:ring-gold/50 focus:border-gold/50"
                        }`}
                      />
                      {phoneError && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full" />
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campo Problema - AHORA OBLIGATORIO */}
                <div className="space-y-2 relative">
                  <label className="text-xs text-gold tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    ¿Qué te guía hasta aquí? <span className="text-accent">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.problema}
                    onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                    placeholder="Comparte tu intención con el cosmos..."
                    className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all resize-none backdrop-blur-sm"
                  />
                </div>

                {/* Botón Submit mejorado */}
                <button 
                  type="submit"
                  className="relative w-full bg-gradient-to-r from-secondary via-purple-900 to-secondary hover:from-secondary/90 hover:via-purple-900/90 hover:to-secondary/90 text-gold border-2 border-gold/50 rounded-lg py-4 font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:border-gold hover:shadow-[0_0_30px_hsl(var(--gold)/0.3)] active:scale-[0.98] overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse-glow" />
                    Iniciar Ritual Espiritual
                    <Sparkles className="w-4 h-4 group-hover:animate-pulse-glow" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
              </form>

              {/* Texto decorativo inferior */}
              <p className="text-center text-xs text-gold/40 italic animate-in fade-in duration-1000 delay-700 tracking-wide">
                El universo conspira a favor del amor verdadero
              </p>
            </div>
          </main>
        );

      case "loading":
        return <LoadingScreen onComplete={() => setCurrentScreen("cards")} />;

      case "cards":
        return (
          <CardSelection 
            onCardSelected={handleCardSelected}
          />
        );

      case "suspense":
        return <SuspenseScreen onReveal={handleReveal} />;

      case "reveal":
        return selectedCard ? (
          <CardReveal 
            card={selectedCard}
            cardIndex={selectedCardIndex}
            onComplete={handleRevealComplete}
          />
        ) : null;

      case "question1":
        return (
          <QuestionScreen
            question="¿Esa persona cambió contigo?"
            options={["Sí", "No", "Mucho"]}
            onAnswer={handleQuestion1Answer}
          />
        );

      case "question2":
        return (
          <QuestionScreen
            question="¿Qué quieres que pase?"
            options={[
              "Recuperarlo",
              "Que piense en mí",
              "Alejar a alguien",
              "Endulzarlo"
            ]}
            onAnswer={handleQuestion2Answer}
          />
        );

      case "warning":
        return <WarningMessage onContinue={handleWarningContinue} />;

      case "transition":
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
            <div className="max-w-md w-full space-y-12 relative z-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gold text-center tracking-[0.2em]">
                Voy a enviar tu caso directamente al maestro...
              </h2>
              
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 border-2 border-gold/30 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-8 border-2 border-gold/40 rounded-full animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
                <div className="absolute inset-16 border-2 border-gold/50 rounded-full animate-ping" style={{ animationDuration: "2s", animationDelay: "0.6s" }} />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-gold rounded-full opacity-60 animate-pulse-glow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-l-transparent border-gold rounded-full transform rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gold/80 tracking-[0.2em] uppercase text-center">
                Él va a revisar lo que está pasando contigo
              </p>
            </div>
          </div>
        );

      case "chat":
        return <ChatMaestro />;

      default:
        return null;
    }
  };

  return (
    <>
      <SEO 
        title="Portal Espiritual - Descubre Tu Destino"
        description="Experiencia mística de tarot premium. Conecta con el cosmos y revela tu destino a través de una lectura espiritual guiada."
      />
      
      <CustomCursor />
      <FloatingParticles />
      
      {renderScreen()}
    </>
  );
}