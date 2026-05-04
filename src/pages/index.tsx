import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CardSelection } from "@/components/CardSelection";
import { CardReveal } from "@/components/CardReveal";
import { QuestionScreen } from "@/components/QuestionScreen";
import { WarningMessage } from "@/components/WarningMessage";
import { ChatMaestro } from "@/components/ChatMaestro";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { SEO } from "@/components/SEO";
import { analyticsService } from "@/services/analyticsService";
import { motion, AnimatePresence } from "framer-motion";

type ScreenType = "form" | "loading" | "cards" | "suspense" | "reveal" | "question" | "warning" | "chat";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("form");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    problem: "",
  });
  const [countryCode, setCountryCode] = useState("+1");
  const [loginData, setLoginData] = useState({ 
    name: "", 
    whatsapp: "" 
  });
  const [loginCountryCode, setLoginCountryCode] = useState("+1");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    analyticsService.trackPageView();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Formulario enviado:", formData);

    analyticsService.trackFormStart();

    const whatsappWithPrefix = `${countryCode}${formData.whatsapp}`;

    try {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          name: formData.name,
          whatsapp: whatsappWithPrefix,
          problem: formData.problem,
          status: "nuevo",
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error guardando lead:", error);
        return;
      }

      console.log("✅ Lead guardado:", data);
      setCurrentLeadId(data.id);

      analyticsService.trackFormComplete(data.id);

      setCurrentScreen("loading");
    } catch (error) {
      console.error("❌ Error en handleFormSubmit:", error);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      if (!loginData.name || !loginData.whatsapp) {
        setLoginError("Por favor completa todos los campos");
        setIsLoggingIn(false);
        return;
      }

      if (!/^\d{10}$/.test(loginData.whatsapp)) {
        setLoginError("El número de WhatsApp debe tener exactamente 10 dígitos");
        setIsLoggingIn(false);
        return;
      }

      const whatsappWithPrefix = `${loginCountryCode}${loginData.whatsapp}`;

      const { data: existingLead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("name", loginData.name.trim())
        .eq("whatsapp", whatsappWithPrefix)
        .single();

      if (error || !existingLead) {
        setLoginError("Datos incorrectos. Verifica tu nombre, país y número de WhatsApp exactos.");
        setIsLoggingIn(false);
        return;
      }

      console.log("✅ Login exitoso:", existingLead);
      setCurrentLeadId(existingLead.id);
      setShowLoginModal(false);
      setCurrentScreen("chat");

      setLoginData({ name: "", whatsapp: "" });
      setLoginCountryCode("+1");
    } catch (error) {
      console.error("Error en login:", error);
      setLoginError("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCardSelection = (cards: string[]) => {
    setSelectedCards(cards);
    analyticsService.trackCardSelect(cards[0]);
    setCurrentScreen("suspense");
  };

  const handleOpenChat = () => {
    if (currentLeadId) {
      analyticsService.trackChatStart(currentLeadId);
    }
    setCurrentScreen("chat");
  };

  return (
    <>
      <SEO 
        title="Portal Espiritual - Lectura de Tarot Mística"
        description="Descubre tu destino a través de una experiencia de tarot premium. Guía espiritual personalizada para revelar tu camino."
      />
      <CustomCursor />
      <FloatingParticles />

      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center p-4"
            >
              <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h1 className="text-4xl md:text-5xl font-serif text-gold mb-2 italic">
                      Portal Espiritual
                    </h1>
                    <p className="text-foreground/60">
                      Revela tu destino místico
                    </p>
                  </motion.div>
                </div>

                <motion.form
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onSubmit={handleFormSubmit}
                  className="space-y-6 bg-gradient-to-br from-muted/50 to-background border border-gold/20 rounded-2xl p-8 shadow-2xl"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nombre completo"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      WhatsApp
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gold/20 bg-background text-foreground focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+504">🇭🇳 +504</option>
                        <option value="+502">🇬🇹 +502</option>
                      </select>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) {
                            setFormData({ ...formData, whatsapp: value });
                          }
                        }}
                        placeholder="3312345678"
                        required
                        maxLength={10}
                        className="flex-1 px-4 py-2 rounded-lg border border-gold/20 bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                      />
                    </div>
                    <p className="text-xs text-foreground/50">Selecciona tu país e ingresa tu número de 10 dígitos</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      ¿Qué te trae aquí?
                    </label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={(e) =>
                        setFormData({ ...formData, problem: e.target.value })
                      }
                      placeholder="Describe tu situación o pregunta..."
                      required
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-gold to-accent text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-gold/30 transition-all duration-300 transform hover:scale-105"
                  >
                    Comenzar Lectura
                  </button>

                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(true)}
                      className="text-gold hover:text-gold/80 text-sm underline"
                    >
                      ¿Ya iniciaste una lectura? Ingresa aquí
                    </button>
                  </div>
                </motion.form>
              </div>
            </motion.div>
          )}

          {currentScreen === "loading" && (
            <LoadingScreen
              onComplete={() => setCurrentScreen("cards")}
              userName={formData.name}
            />
          )}

          {currentScreen === "cards" && (
            <CardSelection onCardsSelected={handleCardSelection} />
          )}

          {currentScreen === "suspense" && (
            <motion.div
              key="suspense"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-center space-y-8"
                >
                  <div className="text-6xl animate-pulse-glow">🔮</div>
                  <h2 className="text-3xl font-serif text-gold italic">
                    Las cartas revelan tu verdad...
                  </h2>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto border-4 border-gold/30 border-t-gold rounded-full"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentScreen === "reveal" && (
            <CardReveal
              selectedCards={selectedCards}
              onComplete={() => setCurrentScreen("question")}
            />
          )}

          {currentScreen === "question" && (
            <QuestionScreen
              onComplete={() => setCurrentScreen("warning")}
              leadId={currentLeadId}
            />
          )}

          {currentScreen === "warning" && (
            <WarningMessage onOpenChat={handleOpenChat} />
          )}

          {currentScreen === "chat" && currentLeadId && (
            <ChatMaestro leadId={currentLeadId} />
          )}
        </AnimatePresence>

        {/* Modal de Login */}
        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowLoginModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full bg-gradient-to-br from-muted/90 to-background border border-gold/30 rounded-2xl p-8 shadow-2xl"
              >
                <h2 className="text-2xl font-serif text-gold mb-6 text-center">
                  Ingresar a tu Lectura
                </h2>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      Tu Nombre
                    </label>
                    <input
                      type="text"
                      value={loginData.name}
                      onChange={(e) =>
                        setLoginData({ ...loginData, name: e.target.value })
                      }
                      placeholder="Nombre completo"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gold/20 bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      Tu WhatsApp
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={loginCountryCode}
                        onChange={(e) => setLoginCountryCode(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gold/20 bg-background text-foreground focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+504">🇭🇳 +504</option>
                        <option value="+502">🇬🇹 +502</option>
                      </select>
                      <input
                        type="tel"
                        value={loginData.whatsapp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) {
                            setLoginData({ ...loginData, whatsapp: value });
                          }
                        }}
                        placeholder="3312345678"
                        required
                        maxLength={10}
                        className="flex-1 px-4 py-2 rounded-lg border border-gold/20 bg-background text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-gold/50 focus:border-gold/50 outline-none"
                      />
                    </div>
                    <p className="text-xs text-foreground/50">Selecciona el mismo país y número que usaste al registrarte</p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {loginError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="flex-1 px-6 py-3 border border-gold/30 text-foreground rounded-lg hover:bg-gold/10 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-gold to-accent text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-gold/30 transition-all disabled:opacity-50"
                    >
                      {isLoggingIn ? "Ingresando..." : "Ingresar"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            filter: brightness(1);
          }
          50% {
            opacity: 0.8;
            filter: brightness(1.2);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}