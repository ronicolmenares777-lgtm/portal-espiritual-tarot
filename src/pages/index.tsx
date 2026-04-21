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
import { sanitizeText, validateName, validatePhone, validateProblem, rateLimiter, detectSuspiciousContent } from "@/lib/security";
import { LeadService } from "@/services/leadService";
import type { TarotCard } from "@/lib/tarotCards";
import type { Lead } from "@/types/admin";
import { useState, useEffect } from "react";
import { Sparkles, Moon, Star, Facebook } from "lucide-react";
import { motion } from "framer-motion";

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
    name: "",
    countryCode: "+1",
    whatsapp: "",
    problem: "",
  });
  const [phoneError, setPhoneError] = useState<string>("");
  const [nombrePlaceholder, setNombrePlaceholder] = useState(nombreEjemplos[0]);
  const [answers, setAnswers] = useState({
    question1: "",
    question2: "",
  });
  const [currentStep, setCurrentStep] = useState<"initial" | "loading" | "cards" | "suspense" | "reveal" | "questions" | "warning" | "chat">("initial");
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [revealedCard, setRevealedCard] = useState<TarotCard | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({
    name: "",
    whatsapp: "",
    countryCode: "+52"
  });
  const [loginError, setLoginError] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    whatsapp: "",
    problem: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cambiar placeholder de nombre cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * nombreEjemplos.length);
      setNombrePlaceholder(nombreEjemplos[randomIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("🔄 Estado actual:", currentStep);
  }, [currentStep]);

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

  const handleStart = () => {
    setCurrentStep("loading");
  };

  const handleLogin = () => {
    // Validar campos
    if (!loginData.name.trim() || !loginData.whatsapp.trim()) {
      setLoginError("Por favor, completa todos los campos");
      return;
    }

    // Buscar usuario en localStorage
    const storedLeads = localStorage.getItem("leads");
    if (storedLeads) {
      const leads = JSON.parse(storedLeads);
      const fullPhone = loginData.countryCode + loginData.whatsapp;
      const user = leads.find((lead: Lead) => 
        lead.name.toLowerCase() === loginData.name.toLowerCase() && 
        lead.whatsapp === fullPhone
      );

      if (user) {
        // Usuario encontrado - guardar sesión y redirigir
        localStorage.setItem("userAuth", JSON.stringify(user));
        window.location.href = "/chat-usuario";
        return;
      }
    }

    setLoginError("No se encontró ninguna consulta con estos datos");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!validateName(formData.name)) {
      alert("⚠️ Por favor ingresa un nombre válido");
      return;
    }

    if (!validatePhone(formData.whatsapp, formData.countryCode)) {
      alert("⚠️ Por favor ingresa un número de teléfono válido");
      return;
    }

    if (!validateProblem(formData.problem)) {
      alert("⚠️ Por favor describe tu situación (mínimo 10 caracteres)");
      return;
    }

    // Rate limiting
    if (!rateLimiter.isAllowed()) {
      alert("⚠️ Por favor espera unos segundos antes de intentar nuevamente");
      return;
    }

    // Detección de contenido sospechoso
    const isSuspicious = detectSuspiciousContent(formData.problem);
    if (isSuspicious) {
      alert("⚠️ Por favor describe tu situación de forma más específica");
      return;
    }

    console.log("✅ Validaciones pasadas, avanzando a siguiente paso");
    
    // Avanzar a loading screen
    setCurrentScreen("loading");
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

  const handleFinalSubmit = async () => {
    console.log("📝 Guardando lead en Supabase...");
    setCurrentStep("chat");
    
    // Preparar datos del lead para Supabase
    const leadData = {
      name: formData.name,
      whatsapp: formData.whatsapp,
      country_code: formData.countryCode,
      problem: formData.problem,
      status: "nuevo" as const,
      tarot_card_id: selectedCards[0]?.id || null,
      tarot_cards_selected: selectedCards.map(c => c.id),
      precision_answers: answers
    };

    try {
      // Guardar en Supabase (en background, no bloquea el flujo)
      const { data: newLead, error } = await LeadService.create(leadData);
      
      if (error) {
        console.error("⚠️ Error guardando lead (no crítico):", error);
        // No mostramos alerta al usuario, solo log
      } else {
        console.log("✅ Lead guardado exitosamente:", newLead?.id);
        
        // Guardar ID en localStorage para referencia
        if (newLead) {
          localStorage.setItem("currentLeadId", newLead.id);
        }
      }
    } catch (error) {
      console.error("⚠️ Error inesperado guardando lead:", error);
      // No bloqueamos el flujo por error en BD
    }
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
                onSubmit={handleSubmit}
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
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors({ ...formErrors, name: "" });
                    }}
                    placeholder={nombrePlaceholder}
                    className={`w-full bg-muted/50 border ${formErrors.name ? 'border-red-500' : 'border-gold/20'} rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all backdrop-blur-sm`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Campo WhatsApp */}
                <div className="space-y-2">
                  <label className="text-xs text-gold tracking-[0.2em] uppercase font-medium flex items-center gap-2">
                    <Moon className="w-3 h-3" />
                    Canal de Conexión (WhatsApp)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => {
                        setFormData({ ...formData, countryCode: e.target.value });
                        setFormErrors({ ...formErrors, whatsapp: "" });
                      }}
                      className="px-3 bg-muted/50 border border-gold/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all backdrop-blur-sm"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+58">🇻🇪 +58</option>
                    </select>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => {
                        setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "") });
                        setFormErrors({ ...formErrors, whatsapp: "" });
                      }}
                      placeholder="1234567890"
                      className={`flex-1 bg-muted/50 border ${formErrors.whatsapp ? 'border-red-500' : 'border-gold/20'} rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all backdrop-blur-sm`}
                    />
                  </div>
                  {formErrors.whatsapp && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.whatsapp}</p>
                  )}
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
                    value={formData.problem}
                    onChange={(e) => {
                      setFormData({ ...formData, problem: e.target.value });
                      setFormErrors({ ...formErrors, problem: "" });
                    }}
                    placeholder="Comparte tu intención con el cosmos..."
                    className={`w-full bg-muted/50 border ${formErrors.problem ? 'border-red-500' : 'border-gold/20'} rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all resize-none backdrop-blur-sm`}
                  />
                  {formErrors.problem && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.problem}</p>
                  )}
                </div>

                {/* Botón Submit mejorado */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`w-full bg-gradient-to-r from-gold to-accent text-background py-4 rounded-lg font-medium tracking-wider hover:shadow-xl hover:shadow-gold/50 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'VALIDANDO...' : 'COMENZAR LECTURA'}
                </motion.button>
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
        return (
          <ChatMaestro
            userName={formData.name}
            userPhone={formData.countryCode + formData.whatsapp}
            userProblem={formData.problem}
            userCard={revealedCard?.name || ""}
            onBack={() => setCurrentStep("warning")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SEO 
        title="Portal Espiritual - Tarot Místico"
        description="Descubre tu destino a través del tarot. Una experiencia mística única que revelará tu camino espiritual."
      />
      
      <CustomCursor />
      <FloatingParticles />

      {/* Header Superior con Botones */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo / Título */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-serif text-gold text-sm md:text-base tracking-wider hidden sm:block">
              Portal Espiritual
            </span>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Botón Facebook */}
            <a
              href="https://www.facebook.com/centronlin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/50 group text-xs md:text-sm"
            >
              <Facebook className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium hidden sm:inline">Facebook</span>
            </a>

            {/* Botón Ingresar */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-gold/20 to-accent/20 border border-gold/50 text-gold hover:bg-gold/30 transition-all hover:shadow-lg hover:shadow-gold/50 group text-xs md:text-sm font-medium"
            >
              <Star className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden md:inline">Ingresar</span>
              <span className="md:hidden">Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full">
          {renderScreen()}
        </div>
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border-2 border-gold/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-gold/20"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 border-2 border-gold/30">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl font-serif text-gold tracking-wider mb-2">
                ACCEDE A TU CONSULTA
              </h2>
              <p className="text-sm text-muted-foreground">
                Ingresa los datos que usaste en tu primera consulta
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold/80 mb-2">
                  Tu Nombre
                </label>
                <input
                  type="text"
                  value={loginData.name}
                  onChange={(e) => {
                    setLoginData({ ...loginData, name: e.target.value });
                    setLoginError("");
                  }}
                  placeholder="Escribe tu nombre"
                  className="w-full px-4 py-3 bg-muted/30 border border-gold/20 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gold/80 mb-2">
                  Tu WhatsApp
                </label>
                <div className="flex gap-2">
                  <select
                    value={loginData.countryCode}
                    onChange={(e) => setLoginData({ ...loginData, countryCode: e.target.value })}
                    className="px-3 py-3 bg-muted/30 border border-gold/20 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+54">🇦🇷 +54</option>
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+58">🇻🇪 +58</option>
                  </select>
                  <input
                    type="tel"
                    value={loginData.whatsapp}
                    onChange={(e) => {
                      setLoginData({ ...loginData, whatsapp: e.target.value.replace(/\D/g, "") });
                      setLoginError("");
                    }}
                    placeholder="1234567890"
                    className="flex-1 px-4 py-3 bg-muted/30 border border-gold/20 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
              </div>

              {/* Error */}
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError("");
                    setLoginData({ name: "", whatsapp: "", countryCode: "+52" });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gold/30 text-muted-foreground hover:text-foreground hover:border-gold/50 transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all"
                >
                  Ingresar
                </button>
              </div>

              {/* Ayuda */}
              <div className="text-center mt-4 pt-4 border-t border-gold/10">
                <p className="text-xs text-muted-foreground">
                  ¿Primera vez aquí?{" "}
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="text-gold hover:underline"
                  >
                    Inicia tu consulta
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}