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
  ImageIcon,
  Filter,
  Menu,
  Phone
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

type Tab = "chats" | "leads";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chats" | "leads" | "listo">("chats");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [stats, setStats] = useState(mockStats);
  const [showProfile, setShowProfile] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Maestro Espiritual",
    headerText: "CANAL SAGRADO",
    email: "admin@tarot.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces"
  });

  // Filtrar leads según tab activo y filtros
  const filteredLeads = leads.filter((lead) => {
    // Primero: filtro por búsqueda (si existe)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(search);
      const matchPhone = lead.whatsapp.includes(search);
      const matchProblem = lead.problem.toLowerCase().includes(search);
      if (!matchName && !matchPhone && !matchProblem) return false;
    }

    // Segundo: filtro por estado seleccionado (si no es "todos")
    if (selectedStatus !== "todos") {
      if (lead.status !== selectedStatus) return false;
    }

    // Tercero: filtro por tab activo
    if (activeTab === "listo") {
      // Tab LISTO: solo mostrar leads con status "listo"
      return lead.status === "listo";
    } else if (activeTab === "chats") {
      // Tab CHATS: mostrar leads con mensajes
      return lead.messages && lead.messages.length > 0;
    } else {
      // Tab LEADS: mostrar todos menos los de status "listo"
      return lead.status !== "listo";
    }
  });

  // Contar leads por estado
  const statusCounts = {
    todos: leads.filter(l => activeTab === "chats" ? l.status !== "listo" : activeTab === "listo" ? l.status === "listo" : true).length,
    nuevo: leads.filter(l => l.status === "nuevo").length,
    enConversacion: leads.filter(l => l.status === "enConversacion").length,
    clienteCaliente: leads.filter(l => l.status === "clienteCaliente").length,
    cerrado: leads.filter(l => l.status === "cerrado").length,
    perdido: leads.filter(l => l.status === "perdido").length,
    listo: leads.filter(l => l.status === "listo").length,
  };

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

  useEffect(() => {
    const storedLeads = localStorage.getItem("leads");
    if (storedLeads) {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        console.log("📊 Leads cargados desde localStorage:", parsedLeads);
        console.log("📊 Total de leads:", parsedLeads.length);
        setLeads(parsedLeads);
      } catch (error) {
        console.error("Error al cargar leads:", error);
        setLeads([]);
      }
    } else {
      console.log("⚠️ No hay leads en localStorage");
      setLeads([]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/Suafazon");
  };

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
        {/* Layout principal */}
        <div className="flex h-[calc(100vh-57px)] md:h-[calc(100vh-65px)] overflow-hidden">
          {/* Overlay para móvil */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar izquierdo */}
          <div className={`
            fixed lg:relative inset-y-0 left-0 z-50
            w-72 md:w-80 lg:w-96
            bg-[hsl(260,35%,10%)] border-r border-gold/10
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
          `}>
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
            <div className="flex gap-2 mb-4 px-4">
              <button
                onClick={() => setActiveTab("chats")}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === "chats"
                    ? "bg-gold/20 text-gold border border-gold/50"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="text-xs uppercase tracking-wider">Chats</span>
                <span className="ml-2 text-xs opacity-60">
                  ({leads.filter(l => l.messages && l.messages.length > 0).length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === "leads"
                    ? "bg-gold/20 text-gold border border-gold/50"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="text-xs uppercase tracking-wider">Leads</span>
                <span className="ml-2 text-xs opacity-60">
                  ({leads.filter(l => l.status !== "listo").length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("listo")}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === "listo"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="text-xs uppercase tracking-wider">Listo</span>
                <span className="ml-2 text-xs opacity-60">
                  ({leads.filter(l => l.status === "listo").length})
                </span>
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

            {/* Filtros por estado */}
            <div className="px-4 mb-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus("todos")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "todos"
                      ? "bg-gold text-background"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Todos ({statusCounts.todos})
                </button>
                <button
                  onClick={() => setSelectedStatus("nuevo")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "nuevo"
                      ? "bg-blue-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Nuevo ({statusCounts.nuevo})
                </button>
                <button
                  onClick={() => setSelectedStatus("enConversacion")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "enConversacion"
                      ? "bg-purple-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  En Chat ({statusCounts.enConversacion})
                </button>
                <button
                  onClick={() => setSelectedStatus("clienteCaliente")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "clienteCaliente"
                      ? "bg-orange-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Caliente ({statusCounts.clienteCaliente})
                </button>
                <button
                  onClick={() => setSelectedStatus("cerrado")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "cerrado"
                      ? "bg-green-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Cerrado ({statusCounts.cerrado})
                </button>
                <button
                  onClick={() => setSelectedStatus("perdido")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "perdido"
                      ? "bg-red-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Perdido ({statusCounts.perdido})
                </button>
                {activeTab === "listo" && (
                  <button
                    onClick={() => setSelectedStatus("listo")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedStatus === "listo"
                        ? "bg-emerald-500 text-white"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    Listo ({statusCounts.listo})
                  </button>
                )}
              </div>
            </div>

            {/* Lista de leads */}
            <div className="flex-1 overflow-y-auto px-4 space-y-1">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    No se encontraron resultados
                  </p>
                  <p className="text-xs text-muted-foreground/60 mb-4">
                    Total de leads: {leads.length} | 
                    Tab actual: {activeTab} | 
                    Filtro: {selectedStatus}
                  </p>
                  {(searchTerm || selectedStatus !== "todos") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedStatus("todos");
                      }}
                      className="mt-3 text-xs text-gold hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      router.push(`/Suafazon/chat/${lead.id}`);
                      setSidebarOpen(false);
                    }}
                    className="w-full text-left p-4 rounded-xl hover:bg-muted/40 transition-all group border border-gold/5 hover:border-gold/20 bg-card/20 hover:bg-card/40"
                  >
                    {/* Header del chat */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar con inicial */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-accent/20 flex items-center justify-center border border-gold/30 flex-shrink-0">
                          <span className="text-sm font-semibold text-gold">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Nombre y tiempo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-gold transition-colors">
                              {lead.name}
                            </h4>
                            {lead.isFavorite && (
                              <Star className="w-3 h-3 fill-gold text-gold flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {getTimeAgo(lead.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Badge de estado */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          lead.status === "nuevo"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : lead.status === "clienteCaliente"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : lead.status === "cerrado"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : lead.status === "perdido"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : lead.status === "listo"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {lead.status === "nuevo"
                          ? "Nuevo"
                          : lead.status === "clienteCaliente"
                          ? "Caliente"
                          : lead.status === "cerrado"
                          ? "Cerrado"
                          : lead.status === "perdido"
                          ? "Perdido"
                          : lead.status === "listo"
                          ? "Listo"
                          : "En Chat"}
                      </span>
                    </div>

                    {/* Información del problema */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {lead.problem}
                      </p>
                      
                      {/* Footer con metadata */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-gold/5">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.whatsapp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{lead.card}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-black border-b border-gold/20 px-4 md:px-6 py-3">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  {/* Logo y botón hamburguesa */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden p-2 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Menu className="w-5 h-5 text-gold" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold" />
                      <h1 className="text-gold font-serif text-base md:text-lg tracking-wider hidden sm:block">
                        Portal Maestro
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center justify-center flex-1 px-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-lg">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                      <span className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] text-gold font-medium">
                        {profileData.headerText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      onClick={handleResetMetrics}
                      className="p-2 hover:bg-muted/50 rounded-lg transition-colors group hidden sm:block"
                      title="Reiniciar métricas"
                    >
                      <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:rotate-180 transition-all duration-300" />
                    </button>

                    <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors hidden sm:block">
                      <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-gold transition-colors" />
                    </button>

                    <button
                      onClick={() => setShowProfile(true)}
                      className="flex items-center gap-2 md:gap-3 hover:bg-muted/50 px-2 md:px-3 py-2 rounded-lg transition-colors"
                    >
                      <span className="text-xs md:text-sm font-medium hidden md:block">{profileData.name}</span>
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border-2 border-gold/30">
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
            </div>

            {/* Área de contenido principal */}
            <div className="flex-1 overflow-hidden flex flex-col bg-background">
              {/* Título y métricas */}
              <div className="p-4 md:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                  {/* Título */}
                  <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif text-gold tracking-[0.2em] md:tracking-[0.3em] mb-2">
                      VISIÓN DEL DESTINO
                    </h1>
                    <p className="text-xs md:text-sm text-gold/60 tracking-[0.2em] md:tracking-[0.3em]">
                      RESUMEN ESTADÍSTICO DE ALMAS Y CONEXIONES
                    </p>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
                    {/* Total Almas */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card/50 rounded-xl p-4 md:p-6 border border-gold/10 text-center"
                      style={{
                        boxShadow: "0 0 20px hsl(220 90% 56% / 0.1)",
                      }}
                    >
                      <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2 md:mb-3" />
                      <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">
                        {stats.totalAlmas}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                        Total Almas
                      </p>
                    </motion.div>

                    {/* Click WA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-card/50 rounded-xl p-4 md:p-6 border border-gold/10 text-center"
                      style={{
                        boxShadow: "0 0 20px hsl(142 76% 36% / 0.1)",
                      }}
                    >
                      <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-green-400 mx-auto mb-2 md:mb-3" />
                      <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">
                        {stats.clickWA}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                        Click WA
                      </p>
                    </motion.div>

                    {/* Atendidos */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-card/50 rounded-xl p-4 md:p-6 border border-gold/10 text-center"
                      style={{
                        boxShadow: "0 0 20px hsl(var(--gold) / 0.1)",
                      }}
                    >
                      <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-gold mx-auto mb-2 md:mb-3" />
                      <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">
                        {stats.atendidos}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                        Atendidos
                      </p>
                    </motion.div>

                    {/* Sin Responder */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-card/50 rounded-xl p-4 md:p-6 border border-gold/10 text-center"
                      style={{
                        boxShadow: "0 0 20px hsl(0 84% 60% / 0.1)",
                      }}
                    >
                      <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-400 mx-auto mb-2 md:mb-3" />
                      <p className="text-2xl md:text-4xl font-bold text-foreground mb-1">
                        {stats.sinResponder}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                        Sin Responder
                      </p>
                    </motion.div>
                  </div>

                  {/* Pipeline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-card/30 rounded-xl p-4 md:p-8 border border-gold/20"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                        <h2 className="text-base md:text-lg font-medium text-gold tracking-wider uppercase">
                          Estado del Pipeline
                        </h2>
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        24 horas
                      </span>
                    </div>

                    <div className="space-y-3 md:space-y-4">
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

                    {/* Nuevo */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          Nuevo
                        </span>
                        <span className="text-base md:text-xl font-bold text-foreground">
                          {stats.pipeline.nuevo}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.pipeline.nuevo / stats.totalAlmas) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          style={{
                            boxShadow: "0 0 10px hsl(220 90% 56% / 0.5)",
                          }}
                        />
                      </div>
                    </div>

                    {/* En Conversación */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          En Conversación
                        </span>
                        <span className="text-base md:text-xl font-bold text-foreground">
                          {stats.pipeline.enConversacion}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.pipeline.enConversacion / stats.totalAlmas) * 100}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                          style={{
                            boxShadow: "0 0 10px hsl(270 91% 65% / 0.5)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Cliente Caliente */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-400" />
                          Cliente Caliente
                        </span>
                        <span className="text-base md:text-xl font-bold text-foreground">
                          {stats.pipeline.clienteCaliente}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.pipeline.clienteCaliente / stats.totalAlmas) * 100}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                          style={{
                            boxShadow: "0 0 10px hsl(25 95% 53% / 0.5)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Cerrado */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          Cerrado
                        </span>
                        <span className="text-base md:text-xl font-bold text-foreground">
                          {stats.pipeline.cerrado}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.pipeline.cerrado / stats.totalAlmas) * 100}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                          style={{
                            boxShadow: "0 0 10px hsl(142 76% 36% / 0.5)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Perdido */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          Perdido
                        </span>
                        <span className="text-base md:text-xl font-bold text-foreground">
                          {stats.pipeline.perdido}
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.pipeline.perdido / stats.totalAlmas) * 100}%` }}
                          transition={{ duration: 1, delay: 0.9 }}
                          className="h-full bg-gradient-to-r from-gray-500 to-gray-400 rounded-full"
                          style={{
                            boxShadow: "0 0 10px hsl(0 0% 50% / 0.5)",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
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