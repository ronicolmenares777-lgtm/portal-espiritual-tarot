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
import { sanitizeText, validateName, validatePhone, validateProblem, rateLimiter, detectSuspiciousContent } from "@/lib/security";
import { LeadService } from "@/services/leadService";
import type { TarotCard } from "@/lib/tarotCards";
import { useState, useEffect } from "react";
import { Sparkles, Moon, Star, Facebook } from "lucide-react";
import { motion } from "framer-motion";

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
  const [currentScreen, setCurrentScreen] = useState<
    "form" | "loading" | "cards" | "suspense" | "reveal" | "questions" | "warning" | "chat"
  >("form");
  
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    countryCode: "+52",
    problem: "",
  });
  
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [nombrePlaceholder, setNombrePlaceholder] = useState(nombreEjemplos[0]);
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

  useEffect(() => {
    console.log("🔄 Pantalla actual:", currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * nombreEjemplos.length);
      setNombrePlaceholder(nombreEjemplos[randomIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateName(formData.name)) {
      alert("⚠️ Por favor ingresa un nombre válido");
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(formData.whatsapp, formData.countryCode)) {
      alert("⚠️ Por favor ingresa un número de teléfono válido");
      setIsSubmitting(false);
      return;
    }

    if (!validateProblem(formData.problem)) {
      alert("⚠️ Por favor describe tu situación (mínimo 10 caracteres)");
      setIsSubmitting(false);
      return;
    }

    const clientKey = `form_${formData.whatsapp}`;
    if (!rateLimiter.isAllowed(clientKey, 3, 60000)) {
      const remainingTime = rateLimiter.getRemainingTime(clientKey, 3, 60000);
      alert(`⚠️ Por favor espera ${remainingTime} segundos antes de intentar nuevamente`);
      setIsSubmitting(false);
      return;
    }

    const isSuspicious = detectSuspiciousContent(formData.problem);
    if (isSuspicious) {
      alert("⚠️ Por favor describe tu situación de forma más específica");
      setIsSubmitting(false);
      return;
    }

    console.log("✅ Validaciones pasadas, avanzando a loading screen");
    setIsSubmitting(false);
    setCurrentScreen("loading");
  };

  const handleCardSelected = (card: TarotCard, cardIndex: number) => {
    console.log("🎴 Carta seleccionada:", card);
    setSelectedCard(card);
    setSelectedCardIndex(cardIndex);
    setSelectedCards([card]);
    setCurrentScreen("suspense");
  };

  const handleFinalSubmit = async () => {
    console.log("📝 Guardando lead en Supabase...");
    setCurrentScreen("chat");
    
    // Preparar datos del lead para Supabase
    const leadData = {
      name: formData.name,
      whatsapp: formData.whatsapp,
      country_code: formData.countryCode,
      problem: formData.problem,
      status: "nuevo" as const,
      selected_cards: selectedCards.map(c => c.name),
      precision_answers: answers
    };

    try {
      // Guardar en Supabase (en background, no bloquea el flujo)
      const { data: newLead, error } = await LeadService.create(leadData);
      
      if (error) {
        console.error("⚠️ Error guardando lead:", error);
      } else {
        console.log("✅ Lead guardado exitosamente:", newLead?.id);
        
        // Guardar ID en localStorage para referencia
        if (newLead) {
          localStorage.setItem("currentLeadId", newLead.id);
        }
      }
    } catch (error) {
      console.error("⚠️ Error inesperado guardando lead:", error);
    }
  };

  const handleLogin = () => {
    if (!loginData.name.trim() || !loginData.whatsapp.trim()) {
      setLoginError("Por favor, completa todos los campos");
      return;
    }

    const storedLeads = localStorage.getItem("leads");
    if (storedLeads) {
      const leads = JSON.parse(storedLeads);
      const fullPhone = loginData.countryCode + loginData.whatsapp;
      const user = leads.find((lead: any) => 
        lead.name.toLowerCase() === loginData.name.toLowerCase() && 
        lead.whatsapp === fullPhone
      );

      if (user) {
        localStorage.setItem("userAuth", JSON.stringify(user));
        window.location.href = "/chat-usuario";
        return;
      }
    }

    setLoginError("No se encontró ninguna consulta con estos datos");
  };

  return (
    <>
      <SEO 
        title="Portal Espiritual - Tarot Místico"
        description="Descubre tu destino a través del tarot. Una experiencia mística única que revelará tu camino espiritual."
      />
      
      <CustomCursor />
      <FloatingParticles />

      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-serif text-gold text-sm md:text-base tracking-wider hidden sm:block">
              Portal Espiritual
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="https://www.facebook.com/centronlin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/50 group text-xs md:text-sm"
            >
              <Facebook className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium hidden sm:inline">Facebook</span>
            </a>

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

      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full">
          {currentScreen === "form" && (
            <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/20 to-background" />
              
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: "4s" }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: "5s", animationDelay: "1s" }} />
              </div>

              <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="flex justify-center mb-4 animate-in fade-in duration-1000">
                  <div className="relative">
                    <Star className="w-12 h-12 text-gold animate-pulse-glow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-gold/60 animate-spin" style={{ animationDuration: "8s" }} />
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="space-y-2">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-gold tracking-[0.15em] leading-tight">
                      TU CAMINO
                      <br />
                      COMIENZA
                    </h1>
                    
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

                <form 
                  onSubmit={handleSubmit}
                  className="relative backdrop-blur-md bg-card/40 border border-gold/20 rounded-2xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
                  style={{
                    boxShadow: "0 0 60px hsl(var(--purple-border) / 0.2), inset 0 0 40px hsl(var(--card) / 0.5)",
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 pointer-events-none" />
                  
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

                <p className="text-center text-xs text-gold/40 italic animate-in fade-in duration-1000 delay-700 tracking-wide">
                  El universo conspira a favor del amor verdadero
                </p>
              </div>
            </main>
          )}

          {currentScreen === "loading" && (
            <LoadingScreen 
              onComplete={() => {
                console.log("✅ LoadingScreen completado, avanzando a cards");
                setCurrentScreen("cards");
              }}
            />
          )}

          {currentScreen === "cards" && (
            <CardSelection 
              onCardSelected={handleCardSelected}
            />
          )}

          {currentScreen === "suspense" && (
            <SuspenseScreen onReveal={() => setCurrentScreen("reveal")} />
          )}

          {currentScreen === "reveal" && selectedCard && (
            <CardReveal 
              card={selectedCard}
              cardIndex={selectedCardIndex}
              onComplete={() => setCurrentScreen("questions")}
            />
          )}

          {currentScreen === "questions" && selectedCard && (
            <QuestionScreen
              card={selectedCard}
              onAnswersComplete={(userAnswers) => {
                console.log("📝 Respuestas completadas:", userAnswers);
                setAnswers(userAnswers);
                setCurrentScreen("warning");
              }}
            />
          )}

          {currentScreen === "warning" && (
            <WarningMessage onContinue={handleFinalSubmit} />
          )}

          {currentScreen === "chat" && selectedCard && (
            <ChatMaestro
              userName={formData.name}
              userPhone={formData.countryCode + formData.whatsapp}
              userProblem={formData.problem}
              userCard={selectedCard.name}
              onBack={() => setCurrentScreen("warning")}
            />
          )}
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border-2 border-gold/30 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-gold/20"
          >
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

            <div className="space-y-4">
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

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {loginError}
                </div>
              )}

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