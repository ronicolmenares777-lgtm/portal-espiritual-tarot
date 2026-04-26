import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CardSelection } from "@/components/CardSelection";
import { SuspenseScreen } from "@/components/SuspenseScreen";
import { CardReveal } from "@/components/CardReveal";
import { QuestionScreen } from "@/components/QuestionScreen";
import { WarningMessage } from "@/components/WarningMessage";
import { ChatMaestro } from "@/components/ChatMaestro";
import { sanitizeText, validateName, validatePhone, validateProblem, rateLimiter, detectSuspiciousContent } from "@/lib/security";
import { LeadService } from "@/services/leadService";
import type { TarotCard } from "@/lib/tarotCards";
import { useState, useEffect } from "react";
import { Moon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

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
    countryCode: "+1",
    whatsapp: "",
    problem: "",
  });
  
  const [leadId, setLeadId] = useState<string | null>(null);
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
  const router = useRouter();

  useEffect(() => {
    console.log("🔄 Pantalla actual:", currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * nombreEjemplos.length);
      setNombrePlaceholder(nombreEjemplos[randomIndex]);
    }, 5000); // Cambiar cada 5 segundos en lugar de 3 (menos frecuente)
    
    return () => clearInterval(interval);
  }, []);

  // Timer para avanzar de suspense a reveal (SOLO UNA VEZ)
  useEffect(() => {
    if (currentScreen === "suspense") {
      console.log("⏳ En suspense, timer iniciado...");
      const timer = setTimeout(() => {
        console.log("✅ Timer completado, avanzando a revelación");
        setCurrentScreen("reveal");
      }, 3000); // 3 segundos

      return () => {
        console.log("🧹 Limpiando timer de suspense");
        clearTimeout(timer);
      };
    }
  }, [currentScreen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.problem) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("📝 Enviando formulario:", formData);

      const leadData = {
        name: formData.name,
        whatsapp: formData.whatsapp,
        country_code: formData.countryCode,
        problem: formData.problem,
        status: "nuevo" as const,
        ritual_state: "listo" as const,
        whatsapp_notified: false,
      };

      const result = await LeadService.create(leadData);
      
      if (result.error || !result.data) {
        throw new Error(result.error?.message || "No se pudo crear el lead");
      }

      console.log("✅ Lead creado con ID:", result.data.id);

      // Guardar en localStorage
      localStorage.setItem("currentLeadId", result.data.id);
      localStorage.setItem("userName", formData.name);
      
      setLeadId(result.data.id);
      setCurrentScreen("loading");
      
      // Simular análisis del alma
      setTimeout(() => {
        setCurrentScreen("cards");
      }, 3000);
    } catch (error: any) {
      console.error("❌ Error creando lead:", error);
      alert(`Error al enviar el formulario: ${error.message || 'Por favor intenta de nuevo'}`);
    } finally {
      setIsSubmitting(false);
    }
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
    
    // Preparar datos del lead para Supabase
    const leadData = {
      name: formData.name,
      whatsapp: formData.whatsapp,
      country_code: formData.countryCode,
      problem: formData.problem,
      status: "nuevo" as const,
      ritual_state: "listo" as const,
      selected_cards: selectedCards.map(c => c.name),
      precision_answers: answers,
      whatsapp_notified: false,
    };

    try {
      const result = await LeadService.create(leadData);
      
      if (result.error || !result.data) {
        throw new Error(result.error?.message || "Error al guardar los datos");
      }

      console.log("✅ Lead guardado con ID:", result.data.id);
      
      // Guardar ID en localStorage
      localStorage.setItem("currentLeadId", result.data.id);
      localStorage.setItem("userName", formData.name);
      
      setLeadId(result.data.id);
      setCurrentScreen("warning");
      
      // Después de 6 segundos, avanzar al chat
      setTimeout(() => {
        setCurrentScreen("chat");
      }, 6000);
    } catch (error: any) {
      console.error("❌ Error guardando lead:", error);
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    if (!loginData.name.trim() || !loginData.whatsapp.trim()) {
      setLoginError("Por favor, completa todos los campos");
      return;
    }

    try {
      setLoginError("");
      console.log("🔍 ===== INICIO DE BÚSQUEDA DE LEAD =====");
      console.log("📝 Datos ingresados por el usuario:");
      console.log("   - Nombre:", loginData.name.trim());
      console.log("   - WhatsApp:", loginData.whatsapp.trim());
      console.log("   - Código país:", loginData.countryCode);
      
      // Buscar solo leads ACTIVOS (no eliminados)
      const { data: leads, error } = await LeadService.getActive();
      
      if (error) {
        console.error("❌ Error en Supabase:", error);
        setLoginError("Error al buscar consulta en la base de datos");
        return;
      }
      
      console.log("📊 Leads obtenidos de Supabase:", leads?.length || 0);
      
      if (!leads || leads.length === 0) {
        console.log("❌ La base de datos está vacía");
        setLoginError("No se encontró ninguna consulta. ¿Ya completaste el formulario?");
        return;
      }

      // Mostrar todos los leads para debugging
      console.log("📋 Leads en la BD:");
      leads.forEach((lead: any, index: number) => {
        console.log(`   ${index + 1}. Nombre: "${lead.name}" | WhatsApp: "${lead.whatsapp}"`);
      });

      // Buscar lead que coincida
      console.log("🔎 Buscando coincidencia...");
      const user = leads.find((lead: any) => {
        const leadName = lead.name?.toLowerCase().trim() || "";
        const leadPhone = lead.whatsapp?.trim() || "";
        const inputName = loginData.name.toLowerCase().trim();
        const inputPhone = loginData.whatsapp.trim();
        
        const nameMatch = leadName === inputName;
        const phoneMatch = leadPhone === inputPhone;
        
        if (leadName.includes(inputName.substring(0, 5))) {
          console.log(`   🔍 Posible coincidencia: "${lead.name}" (${lead.whatsapp})`);
          console.log(`      - Nombre match: ${nameMatch} | Phone match: ${phoneMatch}`);
        }
        
        return nameMatch && phoneMatch;
      });

      if (user) {
        console.log("✅ ¡LEAD ENCONTRADO!");
        console.log("   - ID:", user.id);
        console.log("   - Nombre:", user.name);
        console.log("   - WhatsApp:", user.whatsapp);
        
        // Guardar en localStorage
        const authData = {
          id: user.id,
          name: user.name,
          whatsapp: user.whatsapp,
          countryCode: user.country_code || loginData.countryCode,
          problem: user.problem,
          selectedCard: user.selected_cards?.[0] || null
        };
        
        localStorage.setItem("userAuth", JSON.stringify(authData));
        localStorage.setItem("currentLeadId", user.id);
        
        console.log("💾 Datos guardados en localStorage");
        console.log("🔄 Redirigiendo a /chat-usuario");
        
        // Cerrar modal
        setShowLoginModal(false);
        
        // Redirigir
        router.push("/chat-usuario");
      } else {
        console.log("❌ NO SE ENCONTRÓ COINCIDENCIA");
        console.log("💡 Verifica que el nombre y WhatsApp sean EXACTAMENTE iguales a los del formulario");
        setLoginError("No se encontró ninguna consulta con estos datos. Verifica que sean exactos.");
      }
      
      console.log("===== FIN DE BÚSQUEDA =====");
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      setLoginError("Error al buscar consulta. Intenta de nuevo.");
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp || !formData.problem) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("📝 Enviando formulario:", formData);

      // Crear lead en Supabase
      const leadData = {
        name: formData.name,
        phone: formData.whatsapp,
        problem: formData.problem,
        status: "nuevo" as const,
        ritual_state: "listo" as const,
        whatsapp_notified: false,
      };

      const createdLead = await LeadService.create(leadData);
      
      if (!createdLead || !createdLead.id) {
        throw new Error("No se pudo crear el lead");
      }

      console.log("✅ Lead creado con ID:", createdLead.id);

      // Guardar en localStorage
      localStorage.setItem("currentLeadId", createdLead.id);
      localStorage.setItem("userName", formData.name);
      
      setLeadId(createdLead.id);
      setCurrentScreen("loading");
      
      // Simular análisis del alma
      setTimeout(() => {
        setCurrentScreen("cards");
      }, 3000);
    } catch (error: any) {
      console.error("❌ Error creando lead:", error);
      alert(`Error al enviar el formulario: ${error.message || 'Por favor intenta de nuevo'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Portal Espiritual - Tarot Premium"
        description="Descubre las respuestas que el universo tiene preparadas para ti. Experiencia de tarot premium con maestros espirituales."
        image="/og-image.png"
      />
      
      <CustomCursor />
      <FloatingParticles />

      {/* Botones superiores - Facebook e Ingresar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-4 right-4 z-50 flex gap-3"
      >
        {/* Botón Facebook */}
        <motion.a
          href="https://www.facebook.com/profile.php?id=61571396936969"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-600/90 hover:bg-blue-600 backdrop-blur-sm text-white rounded-lg font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/50 transition-all flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </motion.a>

        {/* Botón Ingresar */}
        <motion.button
          onClick={() => setShowLoginModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gold/90 hover:bg-gold backdrop-blur-sm text-background rounded-lg font-bold shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/50 transition-all flex items-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ingresar</span>
        </motion.button>
      </motion.div>

      {/* Contenido principal - SIN HEADER */}
      <div className="container mx-auto px-4 py-2 lg:py-4 relative z-10">
        {currentScreen === "form" && (
          <main className="min-h-screen flex items-center justify-center p-4 pt-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background" />
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: "4s" }} />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: "5s", animationDelay: "1s" }} />
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
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

              {/* Formulario de entrada - TAMAÑO AJUSTADO */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative max-w-2xl mx-auto"
              >
                {/* Resplandor de fondo */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-accent/20 to-gold/20 rounded-3xl blur-2xl opacity-60" />
                
                <div className="relative bg-card/80 backdrop-blur-xl border-2 border-gold/30 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-black/50">
                  {/* Título del formulario */}
                  <div className="text-center mb-6 lg:mb-8">
                    <div className="inline-flex items-center gap-3 mb-3">
                      <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
                      <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-serif font-bold text-foreground mb-2">
                      Canal de Conexión
                    </h2>
                    <p className="text-sm text-muted-foreground/80 max-w-md mx-auto">
                      Comparte tu información para que podamos guiarte en tu camino espiritual
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-gold">✦</span>
                        Tu Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-secondary/30 border-2 border-gold/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/60 focus:bg-secondary/40 transition-all text-base"
                        required
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-gold">✦</span>
                        WhatsApp
                      </label>
                      <div className="flex gap-3">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="w-28 bg-secondary/30 border-2 border-gold/30 rounded-xl px-3 py-3 text-foreground font-medium focus:outline-none focus:border-gold/60 focus:bg-secondary/40 transition-all appearance-none cursor-pointer text-base"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FAD636'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+54">🇦🇷 +54</option>
                          <option value="+57">🇨🇴 +57</option>
                          <option value="+51">🇵🇪 +51</option>
                          <option value="+56">🇨🇱 +56</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="Tu número de WhatsApp"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, "") })}
                          className="flex-1 bg-secondary/30 border-2 border-gold/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/60 focus:bg-secondary/40 transition-all text-base"
                          required
                        />
                      </div>
                    </div>

                    {/* Problema/Consulta */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground/90 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-gold">✦</span>
                        ¿Qué te preocupa?
                      </label>
                      <textarea
                        placeholder="Cuéntanos qué situación te trae aquí... El universo escucha"
                        value={formData.problem}
                        onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                        rows={4}
                        className="w-full bg-secondary/30 border-2 border-gold/30 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/60 focus:bg-secondary/40 transition-all resize-none text-base"
                        required
                      />
                    </div>

                    {/* Botón de envío */}
                    <motion.button
                      type="submit"
                      disabled={!formData.name || !formData.whatsapp || !formData.problem}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative group overflow-hidden rounded-xl py-3.5 font-bold text-lg tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/30 hover:shadow-2xl hover:shadow-gold/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gold via-accent to-gold transition-all group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative text-background flex items-center justify-center gap-3">
                        <span>Iniciar Mi Lectura</span>
                      </span>
                    </motion.button>
                  </form>

                  {/* Nota de privacidad */}
                  <p className="text-center text-xs text-muted-foreground/60 mt-5 lg:mt-6">
                    🔒 Tu información está protegida y solo será usada para tu lectura espiritual
                  </p>
                </div>
              </motion.div>

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
            onCardSelected={(card, cardIndex) => {
              console.log("🎴 Carta seleccionada:", card);
              setSelectedCard(card);
              setSelectedCardIndex(cardIndex);
              setSelectedCards([card]);
              console.log("➡️ Avanzando inmediatamente a suspense");
              setCurrentScreen("suspense");
            }}
          />
        )}

        {currentScreen === "suspense" && (
          <SuspenseScreen 
            onComplete={() => setCurrentScreen("cards")}
          />
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

        {currentScreen === "chat" && (
          <ChatMaestro
            userName={formData.name}
            userPhone={formData.whatsapp}
            userProblem={formData.problem}
            userCard={selectedCard?.name}
          />
        )}
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
                <div className="w-8 h-8 text-gold" />
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