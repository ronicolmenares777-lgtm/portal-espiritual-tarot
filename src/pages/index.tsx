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
import { useState } from "react";

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

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("form");
  const [formData, setFormData] = useState({
    nombre: "",
    countryCode: "+1",
    whatsapp: "",
    problema: "",
  });
  const [phoneError, setPhoneError] = useState<string>("");

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
    // Solo permitir números
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

  const handleCardSelected = () => {
    setCurrentScreen("suspense");
  };

  const handleReveal = () => {
    setCurrentScreen("reveal");
    setTimeout(() => setCurrentScreen("question1"), 3000);
  };

  const handleQuestion1Answer = () => {
    setCurrentScreen("question2");
  };

  const handleQuestion2Answer = () => {
    setCurrentScreen("warning");
  };

  const handleWarningContinue = () => {
    setCurrentScreen("transition");
    setTimeout(() => setCurrentScreen("chat"), 3000);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "form":
        return (
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
              <form 
                onSubmit={handleFormSubmit}
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
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    <select 
                      value={formData.countryCode}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="bg-muted border border-border rounded-lg px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
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
                        className={`w-full bg-muted border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                          phoneError 
                            ? "border-red-500 focus:ring-red-500/50" 
                            : "border-border focus:ring-gold/50"
                        }`}
                      />
                      {phoneError && (
                        <p className="text-xs text-red-400 mt-1">{phoneError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campo Problema */}
                <div className="space-y-2">
                  <label className="text-xs text-gold tracking-widest uppercase font-medium">
                    ¿Qué te aflige el alma?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.problema}
                    onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                    placeholder="Ej. El regreso de mi ser amado..."
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none"
                  />
                </div>

                {/* Botón Submit */}
                <button 
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary/80 text-gold border-2 border-gold rounded-lg py-4 font-semibold tracking-wider uppercase transition-all duration-300 hover:glow-gold hover:scale-[1.02] active:scale-[0.98]"
                >
                  Iniciar Ritual Espiritual
                </button>
              </form>

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
        );

      case "loading":
        return <LoadingScreen onComplete={() => setCurrentScreen("cards")} />;

      case "cards":
        return <CardSelection onCardSelected={handleCardSelected} />;

      case "suspense":
        return <SuspenseScreen onReveal={handleReveal} />;

      case "reveal":
        return <CardReveal onComplete={() => setCurrentScreen("question1")} />;

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
      
      {currentScreen !== "chat" && <CustomCursor />}
      {currentScreen !== "chat" && <FloatingParticles />}
      
      {renderScreen()}
    </>
  );
}