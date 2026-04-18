import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { mockLeads, mockStats } from "@/lib/mockData";
import type { Lead } from "@/types/admin";
import {
  Users,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Search,
  LogOut,
  Sparkles,
  BarChart3,
  TrendingUp,
  Circle,
  HelpCircle,
  RefreshCw,
  Star,
  User,
  Mail,
  Save,
  X,
  Image as ImageIcon
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

type Tab = "chats" | "leads";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chats" | "leads">("chats");
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [stats, setStats] = useState(mockStats);
  const [showProfile, setShowProfile] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "Maestro Espiritual",
    headerText: "CANAL SAGRADO",
    email: "admin@tarot.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces"
  });

  // Cargar perfil y monitorear nuevos leads
  useEffect(() => {
    const savedProfile = localStorage.getItem("maestroProfile");
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
    
    // Cargar stats desde localStorage
    const savedStats = localStorage.getItem("adminStats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Monitorear nuevos leads cada 5 segundos
    const checkNewLeads = () => {
      const lastLeadCount = parseInt(localStorage.getItem("lastLeadCount") || "0");
      const currentLeadCount = leads.filter(l => l.status === "nuevo").length;
      
      if (currentLeadCount > lastLeadCount) {
        const newCount = currentLeadCount - lastLeadCount;
        setNewLeadsCount(newCount);
        
        // Mostrar notificación del navegador si está permitido
        if (Notification.permission === "granted") {
          new Notification("Portal Maestro", {
            body: `${newCount} nuevo${newCount > 1 ? 's' : ''} lead${newCount > 1 ? 's' : ''}`,
            icon: "/favicon.ico"
          });
        }
      }
      
      localStorage.setItem("lastLeadCount", currentLeadCount.toString());
    };

    const interval = setInterval(checkNewLeads, 5000);
    
    // Solicitar permiso para notificaciones
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [leads]);

  // Limpiar notificaciones al ver los leads
  useEffect(() => {
    if (activeTab === "chats") {
      setNewLeadsCount(0);
    }
  }, [activeTab]);

  // Guardar perfil en localStorage
  const handleSaveProfile = () => {
    localStorage.setItem("maestroProfile", JSON.stringify(profileData));
    setShowProfile(false);
  };

  // Subir imagen del maestro
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen debe ser menor a 2MB");
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten imágenes");
        return;
      }
      
      // Convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Reiniciar solo las métricas numéricas (no eliminar chats)
  const handleResetMetrics = () => {
    if (confirm("¿Reiniciar contadores de métricas a cero? (Los chats se mantienen)")) {
      const resetStats = {
        totalAlmas: 0,
        clickWA: 0,
        atendidos: 0,
        sinResponder: 0,
        pipeline: {
          nuevo: 0,
          enConversacion: 0,
          clienteCaliente: 0,
          cerrado: 0,
          perdido: 0
        }
      };
      setStats(resetStats);
      localStorage.setItem("adminStats", JSON.stringify(resetStats));
    }
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuth");
    if (!isAuthenticated) {
      router.push("/Suafazon");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/Suafazon");
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-500";
      case "enConversacion":
        return "bg-yellow-500";
      case "clienteCaliente":
        return "bg-orange-500";
      case "cerrado":
        return "bg-green-500";
      case "perdido":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "nuevo":
        return "NUEVO";
      case "enConversacion":
        return "CLIENTE";
      case "clienteCaliente":
        return "CLIENTE";
      case "cerrado":
        return "CERRADO";
      case "perdido":
        return "PERDIDO";
      default:
        return status;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const hours = parseInt(timestamp.replace(/\D/g, "")) || 1;
    return `alrededor de ${hours} hora${hours > 1 ? "s" : ""}`;
  };

  const pipelineData = [
    { label: "NUEVO", count: stats.pipeline.nuevo, color: "bg-blue-500", max: 35 },
    { label: "EN CONVERSACIÓN", count: stats.pipeline.enConversacion, color: "bg-yellow-500", max: 35 },
    { label: "CLIENTE CALIENTE", count: stats.pipeline.clienteCaliente, color: "bg-orange-500", max: 35 },
    { label: "CERRADO", count: stats.pipeline.cerrado, color: "bg-green-500", max: 35 },
    { label: "PERDIDO", count: stats.pipeline.perdido, color: "bg-red-500", max: 35 },
  ];

  return (
    <>
      <SEO 
        title="Portal Maestro - Dashboard"
        description="Panel de administración del Portal Espiritual"
      />
      <CustomCursor />
      <FloatingParticles />
      
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-[#0a0a0f] to-[#13131a] border-r border-gold/20 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gold/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gold" />
              <span className="text-lg font-serif text-gold tracking-wider">Portal Maestro</span>
            </div>
          </div>

          {/* Resumen Estadístico Button */}
          <div className="p-4">
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-gold/20 to-accent/20 border border-gold/30 hover:border-gold/50 transition-all group"
            >
              <BarChart3 className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
              <span className="text-sm tracking-wider text-gold">RESUMEN ESTADÍSTICO</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 flex gap-2 border-b border-gold/10 pb-3">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "chats"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              CHATS
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "leads"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              LEADS
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar almas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/30 border border-gold/20 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
              />
            </div>
          </div>

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2">
            {filteredLeads.map((lead) => (
              <motion.button
                key={lead.id}
                onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                className="w-full p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-gold/30 transition-all text-left group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-gold transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeAgo(lead.timestamp)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-black border-b border-gold/20 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-xs tracking-[0.3em] text-gold font-medium">
                    {profileData.headerText}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetMetrics}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                  title="Reiniciar métricas"
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:rotate-180 transition-all duration-300" />
                </button>

                <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-gold transition-colors" />
                </button>

                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-3 hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium">{profileData.name}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold/30">
                    <img
                      src={profileData.avatar}
                      alt="Maestro"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Title */}
              <div className="text-center space-y-3">
                <h1 className="text-5xl font-serif text-gold tracking-wider">
                  VISIÓN DEL DESTINO
                </h1>
                <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
                  Resumen Estadístico de Almas y Conexiones
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                <motion.div 
                  className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-6 text-center hover:border-blue-500/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)" }}
                >
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-blue-500 mb-1">{stats.totalAlmas}</div>
                  <div className="text-xs tracking-wider text-blue-400 uppercase">Total Almas</div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-6 text-center hover:border-green-500/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(34, 197, 94, 0.3)" }}
                >
                  <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-green-500 mb-1">{stats.clickWA}</div>
                  <div className="text-xs tracking-wider text-green-400 uppercase">Click WA</div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-6 text-center hover:border-gold/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px hsl(var(--gold) / 0.3)" }}
                >
                  <CheckCircle className="w-8 h-8 text-gold mx-auto mb-3" />
                  <div className="text-4xl font-bold text-gold mb-1">{stats.atendidos}</div>
                  <div className="text-xs tracking-wider text-gold uppercase">Atendidos</div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-6 text-center hover:border-red-500/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(239, 68, 68, 0.3)" }}
                >
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-red-500 mb-1">{stats.sinResponder}</div>
                  <div className="text-xs tracking-wider text-red-400 uppercase">Sin Responder</div>
                </motion.div>
              </div>

              {/* Pipeline */}
              <div className="bg-card border border-gold/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-background" />
                  </div>
                  <h2 className="text-xl font-serif text-gold tracking-wider">ESTADO DEL PIPELINE</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gold/50 to-transparent" />
                  <span className="text-sm text-muted-foreground">24 horas</span>
                </div>

                <div className="space-y-6">
                  {pipelineData.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Circle className={`w-3 h-3 ${item.color.replace("bg-", "text-")}`} fill="currentColor" />
                          <span className="text-muted-foreground tracking-wider">{item.label}</span>
                        </div>
                        <span className="font-medium text-foreground">{item.count}</span>
                      </div>
                      <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / item.max) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                          className={`h-full ${item.color} rounded-full relative`}
                          style={{
                            boxShadow: `0 0 20px ${item.color.includes("blue") ? "rgba(59, 130, 246, 0.5)" : 
                                                     item.color.includes("yellow") ? "rgba(234, 179, 8, 0.5)" :
                                                     item.color.includes("orange") ? "rgba(249, 115, 22, 0.5)" :
                                                     item.color.includes("green") ? "rgba(34, 197, 94, 0.5)" :
                                                     "rgba(239, 68, 68, 0.5)"}`
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Perfil del Maestro */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-card rounded-2xl p-8 border border-gold/30 relative"
              style={{
                boxShadow: "0 0 50px hsl(var(--gold) / 0.3)",
              }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Título */}
              <h2 className="text-2xl font-serif text-gold text-center mb-8 tracking-wider">
                PERFIL SAGRADO
              </h2>

              {/* Avatar */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full overflow-hidden border-2 border-gold/50"
                    style={{
                      boxShadow: "0 0 30px hsl(var(--gold) / 0.4)",
                    }}
                  >
                    <img
                      src={profileData.avatar}
                      alt="Maestro"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-background" />
                  </div>
                </div>
              </div>

              {/* Formulario editable */}
              <div className="space-y-6">
                {/* Upload de Foto */}
                <div className="space-y-2">
                  <label className="text-xs text-gold tracking-wider uppercase flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" />
                    Foto del Maestro
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground hover:bg-muted/70 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Seleccionar imagen
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tamaño máximo: 2MB
                  </p>
                </div>

                {/* Nombre del Maestro */}
                <div className="space-y-2">
                  <label className="text-xs text-gold tracking-wider uppercase flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Nombre del Maestro
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                </div>

                {/* Texto del Header */}
                <div className="space-y-2">
                  <label className="text-xs text-gold tracking-wider uppercase flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Estado / Texto del Header
                  </label>
                  <input
                    type="text"
                    value={profileData.headerText}
                    onChange={(e) => setProfileData({ ...profileData, headerText: e.target.value })}
                    placeholder="Ej: CANAL SAGRADO, VISIÓN ESPIRITUAL, etc."
                    className="w-full bg-muted/50 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowProfile(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-gold/30 text-muted-foreground hover:text-foreground hover:border-gold/50 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    GUARDAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}