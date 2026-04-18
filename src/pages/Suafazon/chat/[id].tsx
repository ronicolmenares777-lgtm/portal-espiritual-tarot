import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { mockLeads, mockQuickResponses } from "@/lib/mockData";
import type { Lead, QuickResponse } from "@/types/admin";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Send, Mic, Paperclip, Star, MessageCircle, 
  X, Settings, User, Sparkles, Circle
} from "lucide-react";
import Link from "next/link";

export default function ChatView() {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState<Lead | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [maestroName, setMaestroName] = useState("Maestro Espiritual");
  const [maestroEmail, setMaestroEmail] = useState("admin@tarot.com");

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_authenticated");
    if (!isAuth) {
      router.push("/Suafazon");
      return;
    }

    if (id) {
      const foundLead = mockLeads.find(l => l.id === id);
      if (foundLead) {
        setLead(foundLead);
      }
    }
  }, [id, router]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !lead) return;
    
    // Mock: agregar mensaje (en producción se guardará en Supabase)
    const newMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isFromMaestro: true,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    
    setLead({
      ...lead,
      messages: [...lead.messages, newMessage]
    });
    
    setMessageInput("");
  };

  const handleQuickResponse = (message: string) => {
    handleSendMessage(message);
    setShowQuickResponses(false);
  };

  const handleStatusChange = (newStatus: Lead["status"]) => {
    if (!lead) return;
    setLead({ ...lead, status: newStatus });
  };

  const handleSaveProfile = () => {
    // Mock: guardar perfil (en producción se guardará en Supabase)
    setShowProfile(false);
  };

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold text-4xl mb-4">✨</div>
          <p className="text-muted-foreground">Cargando alma...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`Chat con ${lead.name} - Portal Maestro`}
        description="Gestión de conversación espiritual"
      />

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-black/95 border-b border-gold/20 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/Suafazon/dashboard">
                <button className="p-2 hover:bg-card/50 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gold" />
                </button>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-purple-500/30 flex items-center justify-center">
                  <span className="text-sm font-serif text-gold">
                    {lead.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-lg font-serif text-gold">Chat con {lead.name}</h1>
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <Circle className="w-2 h-2 fill-current" />
                    <span>En línea</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowProfile(true)}
                className="px-4 py-2 bg-card/50 hover:bg-card rounded-lg text-sm text-gold border border-gold/20 transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-black/30 to-transparent">
              <div className="space-y-4 max-w-3xl mx-auto">
                {/* Mensajes mock */}
                {lead.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💫</div>
                    <p className="text-muted-foreground text-sm">
                      Inicia la conversación sagrada
                    </p>
                  </div>
                ) : (
                  lead.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromMaestro ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl px-4 py-3 ${
                          msg.isFromMaestro
                            ? 'bg-gold/20 border border-gold/30 text-foreground'
                            : 'bg-card/50 border border-gold/10 text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/95 border-t border-gold/20">
              <div className="max-w-3xl mx-auto">
                {/* Quick Responses Toggle */}
                <div className="mb-3 flex justify-between items-center">
                  <button
                    onClick={() => setShowQuickResponses(!showQuickResponses)}
                    className="text-xs text-gold/60 hover:text-gold transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Respuestas rápidas
                  </button>
                </div>

                {/* Quick Responses */}
                <AnimatePresence>
                  {showQuickResponses && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2">
                        {mockQuickResponses.slice(0, 6).map((qr) => (
                          <button
                            key={qr.id}
                            onClick={() => handleQuickResponse(qr.message)}
                            className="px-3 py-1.5 bg-card/50 hover:bg-gold/20 border border-gold/20 rounded-full text-xs text-foreground transition-all"
                          >
                            {qr.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input */}
                <div className="flex items-center gap-3">
                  <button className="p-3 hover:bg-card/50 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-gold/60" />
                  </button>
                  
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(messageInput)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-card/50 border border-gold/20 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                  
                  <button 
                    onClick={() => handleSendMessage(messageInput)}
                    className="p-3 bg-gradient-to-r from-gold via-amber-400 to-gold hover:shadow-[0_0_20px_hsl(var(--gold))] rounded-lg transition-all"
                  >
                    <Send className="w-5 h-5 text-black" />
                  </button>
                  
                  <button className="p-3 hover:bg-card/50 rounded-lg transition-colors">
                    <Mic className="w-5 h-5 text-gold/60" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Atributos del Alma */}
          <div className="w-96 bg-black/95 border-l border-gold/20 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Avatar y Estrella */}
              <div className="text-center space-y-4">
                <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                  Atributos del Alma
                </p>
                
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-purple-500/30 flex items-center justify-center">
                      <span className="text-3xl font-serif text-gold">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <button className="absolute -top-2 -right-2 w-10 h-10 bg-black border-2 border-gold/50 rounded-full flex items-center justify-center hover:bg-gold/20 transition-all">
                      <Star className="w-5 h-5 text-gold" />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-serif text-gold">{lead.name}</h2>
                <p className="text-xs text-muted-foreground">
                  Desde hace {lead.createdAt}
                </p>
              </div>

              {/* Motivo de Consulta */}
              <div className="space-y-2">
                <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                  Motivo de Consulta
                </p>
                <p className="text-sm text-foreground/80 bg-card/30 rounded-lg p-3 border border-gold/10">
                  "{lead.problem}"
                </p>
              </div>

              {/* Estado del Ritual */}
              <div className="space-y-3">
                <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                  Estado del Ritual
                </p>
                
                <div className="space-y-2">
                  {[
                    { value: "nuevo", label: "Nuevo", color: "blue" },
                    { value: "en_conversacion", label: "En Conversación", color: "yellow" },
                    { value: "cliente_caliente", label: "Cliente Caliente", color: "orange" },
                    { value: "cerrado", label: "Cerrado", color: "green" },
                    { value: "perdido", label: "Perdido", color: "gray" }
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value as Lead["status"])}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                        lead.status === status.value
                          ? `bg-${status.color}-500/20 border-2 border-${status.color}-500 text-${status.color}-400`
                          : 'bg-card/30 border border-gold/10 text-muted-foreground hover:bg-card/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Circle className={`w-2 h-2 fill-current ${
                          lead.status === status.value ? `text-${status.color}-400` : 'text-muted-foreground'
                        }`} />
                        <span className="text-sm">{status.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">WhatsApp</p>
                <div className="flex items-center justify-between bg-card/30 rounded-lg p-3 border border-gold/10">
                  <span className="text-sm text-foreground">{lead.whatsapp}</span>
                  <button className="text-xs text-green-400 hover:text-green-300 transition-colors uppercase tracking-wider">
                    Contactar
                  </button>
                </div>
              </div>

              {/* Notas Internas */}
              <div className="space-y-2">
                <p className="text-xs text-gold/60 tracking-[0.2em] uppercase">
                  Notas Internas
                </p>
                <textarea
                  rows={4}
                  value={lead.notes || ""}
                  onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                  placeholder="Añade anotaciones..."
                  className="w-full bg-card/30 border border-gold/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all resize-none"
                />
              </div>

              {/* Finalizar Contacto */}
              <button className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg py-3 text-sm font-medium uppercase tracking-wider transition-all">
                Finalizar Contacto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Perfil del Maestro */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black border-2 border-gold/30 rounded-3xl p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 p-2 hover:bg-card/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gold" />
              </button>

              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-purple-500/30 flex items-center justify-center">
                    <User className="w-12 h-12 text-gold" />
                  </div>
                </div>

                <h2 className="text-2xl font-serif text-gold tracking-wider">
                  PERFIL SAGRADO
                </h2>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="text-xs text-gold/60 tracking-[0.2em] uppercase block mb-2">
                      Nombre del Maestro
                    </label>
                    <input
                      type="text"
                      value={maestroName}
                      onChange={(e) => setMaestroName(e.target.value)}
                      className="w-full bg-card/50 border border-gold/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gold/60 tracking-[0.2em] uppercase block mb-2">
                      E-mail de Acceso
                    </label>
                    <input
                      type="email"
                      value={maestroEmail}
                      onChange={(e) => setMaestroEmail(e.target.value)}
                      className="w-full bg-card/50 border border-gold/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-gradient-to-r from-gold via-amber-400 to-gold text-black font-semibold py-4 rounded-xl tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--gold))]"
                >
                  Guardar Cambios
                </button>

                <button
                  onClick={() => setShowProfile(false)}
                  className="text-muted-foreground/60 text-sm hover:text-gold transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}