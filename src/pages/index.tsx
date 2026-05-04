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
import { analyticsService } from "@/services/analyticsService";
import type { TarotCard } from "@/lib/tarotCards";
import { useState, useEffect } from "react";
import { Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

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
    countryCode: "+1",
    problem: "",
  });
  
  const [leadId, setLeadId] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [currentCardReveal, setCurrentCardReveal] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [nombrePlaceholder, setNombrePlaceholder] = useState(nombreEjemplos[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ 
    name: "", 
    whatsapp: "",
    countryCode: "+1"
  });
  const [loginError, setLoginError] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    whatsapp: "",
    problem: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const router = useRouter();

  // Validación de longitud de número según código de país
  const getPhoneLength = (countryCode: string) => {
    const lengths: { [key: string]: { min: number; max: number } } = {
      "+1": { min: 10, max: 10 },    // USA/Canadá
      "+52": { min: 10, max: 10 },   // México
      "+34": { min: 9, max: 9 },     // España
      "+54": { min: 10, max: 10 },   // Argentina
      "+56": { min: 9, max: 9 },     // Chile
      "+57": { min: 10, max: 10 },   // Colombia
      "+58": { min: 10, max: 10 },   // Venezuela
      "+51": { min: 9, max: 9 },     // Perú
      "+593": { min: 9, max: 9 },    // Ecuador
      "+507": { min: 8, max: 8 },    // Panamá
      "+506": { min: 8, max: 8 },    // Costa Rica
      "+503": { min: 8, max: 8 },    // El Salvador
      "+502": { min: 8, max: 8 },    // Guatemala
      "+504": { min: 8, max: 8 },    // Honduras
      "+505": { min: 8, max: 8 },    // Nicaragua
      "+591": { min: 8, max: 8 },    // Bolivia
      "+598": { min: 8, max: 8 },    // Uruguay
      "+595": { min: 9, max: 9 },    // Paraguay
    };
    return lengths[countryCode] || { min: 8, max: 15 };
  };

  const validateWhatsApp = (phone: string, countryCode: string) => {
    const { min, max } = getPhoneLength(countryCode);
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (cleanPhone.length < min) {
      return `El número debe tener ${min} dígitos`;
    }
    if (cleanPhone.length > max) {
      return `El número debe tener ${max} dígitos`;
    }
    return "";
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    const { max } = getPhoneLength(formData.countryCode);
    
    if (value.length <= max) {
      setFormData({ ...formData, whatsapp: value });
      setFormErrors({ ...formErrors, whatsapp: "" });
    }
  };

  useEffect(() => {
    console.log("🔄 Pantalla actual:", currentScreen);
  }, [currentScreen]);

  // Tracking de página vista
  useEffect(() => {
    analyticsService.trackPageView();
  }, []);

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

  // Verificar sesión activa en Supabase al cargar
  useEffect(() => {
    const checkSession = async () => {
      // TODO: Implementar verificación de sesión con Supabase Auth
      // Por ahora, el usuario debe iniciar sesión cada vez
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const errors = {
      name: formData.name.trim() === "" ? "El nombre es requerido" : "",
      whatsapp: validateWhatsApp(formData.whatsapp, formData.countryCode),
      problem: formData.problem.trim() === "" ? "Describe tu problema" : "",
    };

    setFormErrors(errors);

    if (errors.name || errors.whatsapp || errors.problem) {
      console.log("❌ Errores de validación:", errors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("📝 Datos del formulario:", {
        name: formData.name,
        whatsapp: formData.whatsapp,
        country_code: formData.countryCode,
        problem: formData.problem
      });

      // Crear el lead en Supabase
      const result = await LeadService.create({
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.trim(),
        country_code: formData.countryCode,
        problem: formData.problem.trim(),
        status: "nuevo"
      });

      console.log("📊 Resultado de create():", result);

      if (result.error) {
        console.error("❌ Error creando lead:", result.error);
        
        // Detectar error de WhatsApp duplicado
        if (result.error.code === "DUPLICATE_WHATSAPP") {
          setFormErrors({ 
            ...formErrors, 
            whatsapp: result.error.message
          });
        } else {
          setFormErrors({ 
            ...formErrors, 
            problem: "Error al guardar. Por favor intenta de nuevo." 
          });
        }
        
        setIsSubmitting(false);
        return;
      }

      if (result.data) {
        console.log("✅ Lead creado con ID:", result.data.id);
        setLeadId(result.data.id);
        localStorage.setItem("currentLeadId", result.data.id);
        
        // Track formulario completado
        analyticsService.trackFormComplete(result.data.id);
        
        setCurrentScreen("loading");
      } else {
        console.error("❌ No se recibió data del lead");
        setFormErrors({ 
          ...formErrors, 
          problem: "Error inesperado. Intenta de nuevo." 
        });
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("❌ Error en handleSubmit:", error);
      setFormErrors({ 
        ...formErrors, 
        problem: `Error: ${error.message || 'Intenta de nuevo'}` 
      });
      setIsSubmitting(false);
    }
  };

  const handleCardSelected = (card: TarotCard, cardIndex: number) => {
    console.log("🎴 Carta seleccionada:", card);
    setSelectedCard(card);
    setSelectedCardIndex(cardIndex);
    setSelectedCards([card]);
    
    // Track selección de carta
    analyticsService.trackCardSelect(card.name);
    
    setCurrentScreen("suspense");
  };

  const handleFinalSubmit = async () => {
    console.log("📝 Finalizando lectura...");
    
    if (!leadId) {
      console.error("❌ Error: No hay leadId");
      setCurrentScreen("warning");
      return;
    }

    try {
      // Actualizar el lead con las cartas seleccionadas y respuestas
      console.log("📝 Actualizando lead con cartas y respuestas...");
      const result = await LeadService.update(leadId, {
        cards_selected: selectedCards.map(c => c.name),
        user_answers: answers.length > 0 ? { answers } : undefined,
        status: "enConversacion"
      });

      if (result.error) {
        console.error("❌ Error actualizando lead:", result.error);
      } else {
        console.log("✅ Lead actualizado exitosamente");
      }
    } catch (error: any) {
      console.error("❌ Error en handleFinalSubmit:", error);
    }
    
    console.log("📝 Cartas seleccionadas:", selectedCards.map(c => c.name));
    console.log("📝 Respuestas:", answers);
    console.log("✅ Continuando al siguiente paso");
    
    setCurrentScreen("warning");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginData.name || !loginData.whatsapp) {
      setLoginError("Por favor completa todos los campos");
      return;
    }

    // Validar formato de WhatsApp (solo números)
    if (!/^\d+$/.test(loginData.whatsapp)) {
      setLoginError("El número de WhatsApp solo debe contener dígitos");
      return;
    }

    try {
      console.log("🔍 Buscando lead en Supabase con TODOS los datos:", { 
        name: loginData.name.trim(), 
        countryCode: loginData.countryCode,
        whatsapp: loginData.whatsapp.trim() 
      });
      
      // Buscar lead con EXACTAMENTE estos tres datos: nombre, código de país y número
      const { data: leads, error } = await supabase
        .from("leads")
        .select("*")
        .eq("name", loginData.name.trim())
        .eq("country_code", loginData.countryCode)
        .eq("whatsapp", loginData.whatsapp.trim());
      
      if (error) {
        console.error("❌ Error en Supabase:", error);
        setLoginError("Error de conexión con Supabase. Verifica tu internet.");
        return;
      }
      
      console.log("📊 Resultados de búsqueda:", leads);
      
      if (!leads || leads.length === 0) {
        setLoginError("Datos incorrectos. Verifica tu nombre, código de país y número de WhatsApp exactos.");
        return;
      }

      // Si hay múltiples leads, usar el más reciente
      const lead = leads.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      console.log("✅ Lead encontrado en Supabase:", lead.id);
      
      // Redirigir al chat-usuario con el leadId correcto
      window.location.href = `/chat-usuario?leadId=${lead.id}`;
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      setLoginError(`Error: ${error.message || 'Intenta de nuevo'}`);
    }
  };

  const handleOpenChat = () => {
    console.log("💬 [CHAT] Abriendo chat con el maestro");
    console.log("  - Lead ID:", leadId);
    
    if (!leadId) {
      console.error("❌ [CHAT] No hay leadId disponible");
      return;
    }

    // Track inicio de chat
    analyticsService.trackChatStart(leadId);

    // Guardar leadId en localStorage para persistencia
    localStorage.setItem("currentLeadId", leadId);
    
    // Redirigir al chat de usuario
    router.push(`/chat-usuario?leadId=${leadId}`);
  };

  const handleCardRevealComplete = () => {
    console.log("📖 [CARD] Revelación completada");
    console.log("  - Carta actual:", currentCardReveal);
    console.log("  - Total de cartas:", selectedCards.length);
    
    if (currentCardReveal < selectedCards.length - 1) {
      // Hay más cartas que revelar
      setCurrentCardReveal(currentCardReveal + 1);
    } else {
      // Todas las cartas reveladas, pasar a preguntas
      setCurrentScreen("questions");
    }
  };

  // Función para obtener longitud máxima según país
  const getMaxLengthForCountry = (countryCode: string): number => {
    const lengths: { [key: string]: number } = {
      "+1": 10,   // USA/Canadá: 10 dígitos
      "+52": 10,  // México: 10 dígitos
      "+34": 9,   // España: 9 dígitos
      "+54": 10,  // Argentina: 10 dígitos
      "+56": 9,   // Chile: 9 dígitos
      "+57": 10,  // Colombia: 10 dígitos
      "+51": 9,   // Perú: 9 dígitos
      "+58": 10,  // Venezuela: 10 dígitos
    };
    return lengths[countryCode] || 10;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Formulario enviado:", formData);
    console.log("🌍 Código de país seleccionado:", formData.countryCode);

    analyticsService.trackFormStart();

    // Concatenar prefijo + número
    const whatsappWithPrefix = `${formData.countryCode}${formData.whatsapp}`;
    console.log("📱 WhatsApp completo a guardar:", whatsappWithPrefix);

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

      console.log("✅ Lead guardado con WhatsApp:", data.whatsapp);
      setLeadId(data.id);

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

      const whatsappWithPrefix = `${loginData.countryCode}${loginData.whatsapp}`;
      console.log("🔍 Buscando lead con WhatsApp:", whatsappWithPrefix);

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

      setLoginData({ name: "", whatsapp: "", countryCode: "+1" });
    } catch (error) {
      console.error("Error en login:", error);
      setLoginError("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsLoggingIn(false);
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

      {/* Botones superiores - Facebook, WhatsApp e Ingresar */}
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

        {/* Botón WhatsApp */}
        <motion.a
          href="https://api.whatsapp.com/message/XH42ORU47RJCF1"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-green-500/90 hover:bg-green-500 backdrop-blur-sm text-white rounded-lg font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/50 transition-all flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span>WhatsApp</span>
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
                
                <div className="relative bg-card/80 backdrop-blur-xl border-2 border-gold/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-2xl shadow-black/50">
                  {/* Título del formulario */}
                  <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                    <div className="inline-flex items-center gap-3 mb-2 sm:mb-3">
                      <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-gold/50" />
                      <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-gold/50" />
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-foreground mb-2">
                      Canal de Conexión
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-md mx-auto px-2">
                      Comparte tu información para que podamos guiarte en tu camino espiritual
                    </p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
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
                        onChange={(e) => {
                          if (!formStarted) {
                            analyticsService.trackFormStart();
                            setFormStarted(true);
                          }
                          setFormData({ ...formData, name: e.target.value });
                        }}
                        className="w-full bg-secondary/30 border-2 border-gold/30 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/60 focus:bg-secondary/40 transition-all"
                        required
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground/80">
                        WhatsApp
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 bg-muted border border-gold/20 rounded-lg text-foreground/60 text-sm">
                          +52
                        </span>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // Solo números
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
                      <p className="text-xs text-foreground/50">Ingresa tu número de 10 dígitos (sin prefijo)</p>
                      {formData.whatsapp && !formErrors.whatsapp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.whatsapp.length} / {getPhoneLength(formData.countryCode).max} dígitos
                        </p>
                      )}
                      {formErrors.whatsapp && (
                        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-red-400">{formErrors.whatsapp}</p>
                        </div>
                      )}
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
                        className="w-full bg-secondary/30 border-2 border-gold/30 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/60 focus:bg-secondary/40 transition-all resize-none"
                        required
                      />
                    </div>

                    {/* Botón de envío */}
                    <motion.button
                      type="submit"
                      disabled={!formData.name || !formData.whatsapp || !formData.problem || isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative group overflow-hidden rounded-xl py-3 sm:py-3.5 font-bold text-base sm:text-lg tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/30 hover:shadow-2xl hover:shadow-gold/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gold via-accent to-gold transition-all group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative text-background flex items-center justify-center gap-3">
                        <span>{isSubmitting ? "Guardando..." : "Iniciar Mi Lectura"}</span>
                      </span>
                    </motion.button>
                  </form>

                  {/* Nota de privacidad */}
                  <p className="text-center text-xs text-muted-foreground/60 mt-4 sm:mt-5 lg:mt-6 px-2">
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

        {currentScreen === "reveal" && selectedCards.length > 0 && (
          <CardReveal
            card={selectedCards[currentCardReveal]}
            onContinue={handleCardRevealComplete}
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
          <WarningMessage onOpenChat={handleOpenChat} />
        )}

        {currentScreen === "chat" && (
          <ChatMaestro 
            leadId={leadId!} 
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
                  <p className="text-xs mt-2 text-red-400/70">
                    💡 Debes usar exactamente el mismo nombre, código de país y número con los que te registraste
                  </p>
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