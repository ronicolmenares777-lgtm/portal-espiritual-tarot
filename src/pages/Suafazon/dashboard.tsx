import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { LeadService } from "@/services/leadService";
import { MessageService } from "@/services/messageService";
import { AuthService } from "@/services/authService";
import { ProfileService } from "@/services/profileService";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
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

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export default function Dashboard() {
  const router = useRouter();
  
  // Agregar atributo al body para cursor normal
  useEffect(() => {
    document.body.setAttribute("data-admin-page", "true");
    return () => {
      document.body.removeAttribute("data-admin-page");
    };
  }, []);

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        console.log("⚠️ No hay sesión Supabase válida");
        router.replace("/Suafazon");
      }
    };
    checkAuth();
  }, [router]);

  const [activeTab, setActiveTab] = useState<"chats" | "leads" | "listo" | "papelera">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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
  });
  const [showProfile, setShowProfile] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Maestro Espiritual",
    email: "admin@tarot.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces",
    headerText: "CANAL SAGRADO"
  });
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [deletedLeads, setDeletedLeads] = useState<any[]>([]);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Funciones de selección
  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const selectAll = () => {
    const allIds = filteredLeads.map(l => l.id);
    setSelectedLeads(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedLeads(new Set());
  };

  // Mover a papelera
  const moveSelectedToTrash = async () => {
    if (selectedLeads.size === 0) {
      alert("No hay leads seleccionados");
      return;
    }

    if (!confirm(`¿Mover ${selectedLeads.size} lead(s) a la papelera?`)) {
      return;
    }

    try {
      const ids = Array.from(selectedLeads);
      const { error } = await LeadService.moveMultipleToTrash(ids);

      if (error) throw error;

      // Recargar datos
      const { data: allLeads } = await LeadService.getAll();
      const { data: trashedLeads } = await LeadService.getDeleted();
      
      if (allLeads) setLeads(allLeads);
      if (trashedLeads) setDeletedLeads(trashedLeads);
      
      setSelectedLeads(new Set());
      alert(`${ids.length} lead(s) movido(s) a papelera`);
    } catch (error) {
      console.error("Error moviendo a papelera:", error);
      alert("Error al mover a papelera");
    }
  };

  // Restaurar de papelera
  const restoreFromTrash = async (leadId: string) => {
    try {
      const { error } = await LeadService.restoreFromTrash(leadId);
      if (error) throw error;

      // Recargar datos
      const { data: allLeads } = await LeadService.getAll();
      const { data: trashedLeads } = await LeadService.getDeleted();
      
      if (allLeads) setLeads(allLeads);
      if (trashedLeads) setDeletedLeads(trashedLeads);

      alert("Lead restaurado");
    } catch (error) {
      console.error("Error restaurando:", error);
      alert("Error al restaurar");
    }
  };

  // Eliminar permanentemente
  const deletePermanently = async (leadId: string) => {
    if (!confirm("⚠️ ¿Eliminar PERMANENTEMENTE? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const { error } = await LeadService.deletePermanently(leadId);
      if (error) throw error;

      // Recargar datos
      const { data: trashedLeads } = await LeadService.getDeleted();
      if (trashedLeads) setDeletedLeads(trashedLeads);

      alert("Lead eliminado permanentemente");
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar");
    }
  };

  // Proteger ruta - redirige a login si no está autenticado
  // useRequireAuth("/Suafazon");
  
  // Filtrar leads según tab activo, búsqueda y estado seleccionado
  const filteredLeads = leads.filter((lead) => {
    // Filtro por tab
    if (activeTab === "leads" && lead.status !== "nuevo") return false;
    if (activeTab === "chats") {
      const isInChat = ["enConversacion", "caliente", "clienteCaliente"].includes(lead.status || "");
      if (!isInChat) return false;
    }
    if (activeTab === "listo" && lead.status !== "listo") return false;

    // Filtro por estado seleccionado
    if (selectedStatus !== "todos") {
      if (selectedStatus === "clienteCaliente" && lead.status === "caliente") {
        // Tratar "caliente" y "clienteCaliente" como el mismo estado
        return true;
      }
      if (lead.status !== selectedStatus) return false;
    }

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(query) ||
        lead.whatsapp?.includes(query) ||
        lead.problem?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Contar leads por estado - CORREGIDO
  const statusCounts = {
    todos: leads.length,
    nuevo: leads.filter(l => l.status === "nuevo").length,
    enConversacion: leads.filter(l => l.status === "enConversacion").length,
    clienteCaliente: leads.filter(l => l.status === "caliente" || l.status === "clienteCaliente").length,
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

  // Sincronización en tiempo real - escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "leads" && e.newValue) {
        console.log("🔄 Leads actualizados desde otra página");
        try {
          const updatedLeads = JSON.parse(e.newValue);
          setLeads(updatedLeads);
        } catch (error) {
          console.error("Error al sincronizar leads:", error);
        }
      }
    };

    // Escuchar cambios en localStorage desde otras pestañas/ventanas
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Recargar leads al volver a la página (cuando el componente se vuelve visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Página visible de nuevo - recargando leads");
        const storedLeads = localStorage.getItem("leads");
        if (storedLeads) {
          try {
            const parsedLeads = JSON.parse(storedLeads);
            setLeads(parsedLeads);
          } catch (error) {
            console.error("Error al recargar leads:", error);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Obtener todos los leads activos
        const { data: allLeads, error: leadsError } = await LeadService.getAll();
        
        if (leadsError) {
          console.error("Error cargando leads:", leadsError);
          throw leadsError;
        }

        console.log("✅ Leads cargados:", allLeads?.length || 0);

        if (allLeads) {
          setLeads(allLeads);
        }

        // Obtener leads eliminados para papelera
        const { data: trashedLeads } = await LeadService.getDeleted();
        if (trashedLeads) {
          setDeletedLeads(trashedLeads);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error en loadData:", err);
        setLoading(false);
      }
    };

    loadData();

    // Suscribirse a cambios en leads
    const leadsSubscription = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        () => {
          console.log("🔄 Cambio detectado en leads, recargando...");
          loadData();
        }
      )
      .subscribe();

    return () => {
      leadsSubscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <SEO 
        title="Dashboard - Portal Espiritual Admin"
        description="Panel de administración para gestionar leads y consultas espirituales"
      />
      
      {/* Cursor personalizado DESHABILITADO en admin */}
      {/* <CustomCursor /> */}
      <FloatingParticles />

      <div className="min-h-screen bg-background text-foreground">
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
                  ({leads.filter(l => ["enConversacion", "caliente"].includes(l.status || "")).length})
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
                  ({leads.filter(l => l.status === "nuevo").length})
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/30 border border-gold/20 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
              
              {/* Mensaje si no hay leads */}
              {filteredLeads.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔮</div>
                  <p className="text-muted-foreground mb-2">
                    {searchQuery ? "No se encontraron almas con ese criterio" : "Aún no hay almas en esta sección"}
                  </p>
                  {activeTab === "leads" && !searchQuery && (
                    <p className="text-sm text-muted-foreground">
                      Los nuevos leads aparecerán aquí automáticamente
                    </p>
                  )}
                </div>
              )}

              {/* Indicador de carga */}
              {loading && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gold mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Cargando almas...</p>
                </div>
              )}
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
                  Todos ({filteredLeads.length})
                </button>
                <button
                  onClick={() => setSelectedStatus("nuevo")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "nuevo"
                      ? "bg-blue-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Nuevo ({leads.filter(l => l.status === "nuevo").length})
                </button>
                <button
                  onClick={() => setSelectedStatus("enConversacion")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "enConversacion"
                      ? "bg-purple-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  En Chat ({leads.filter(l => l.status === "enConversacion").length})
                </button>
                <button
                  onClick={() => setSelectedStatus("caliente")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "caliente"
                      ? "bg-orange-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Caliente ({leads.filter(l => l.status === "caliente").length})
                </button>
                <button
                  onClick={() => setSelectedStatus("cerrado")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "cerrado"
                      ? "bg-green-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Cerrado ({leads.filter(l => l.status === "cerrado").length})
                </button>
                <button
                  onClick={() => setSelectedStatus("perdido")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStatus === "perdido"
                      ? "bg-red-500 text-white"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  Perdido ({leads.filter(l => l.status === "perdido").length})
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
                    Listo ({leads.filter(l => l.status === "listo").length})
                  </button>
                )}
              </div>
            </div>

            {/* Lista de leads */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Cargando...</p>
                </div>
              ) : activeTab === "papelera" ? (
                /* Mostrar papelera */
                deletedLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No hay leads en la papelera</p>
                  </div>
                ) : (
                  deletedLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card/50 border border-border rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">{lead.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lead.country_code} {lead.whatsapp}
                          </p>
                          <p className="text-sm text-muted-foreground/80 mt-2 line-clamp-2">
                            {lead.problem}
                          </p>
                          <p className="text-xs text-red-400 mt-2">
                            Eliminado: {new Date(lead.deleted_at!).toLocaleDateString("es-MX")}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => restoreFromTrash(lead.id)}
                            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm font-medium"
                          >
                            ↩️ Restaurar
                          </button>
                          <button
                            onClick={() => deletePermanently(lead.id)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay leads disponibles</p>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-card/50 border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer ${
                      selectedLeads.has(lead.id) ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox de selección */}
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectLead(lead.id);
                        }}
                        className="mt-1 w-5 h-5 rounded border-2 border-primary/50 bg-transparent checked:bg-primary checked:border-primary cursor-pointer"
                      />

                      {/* Contenido del lead */}
                      <div
                        className="flex-1"
                        onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{lead.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {lead.country_code} {lead.whatsapp}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                lead.status === "nuevo"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : lead.status === "enConversacion"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : lead.status === "caliente" || lead.status === "clienteCaliente"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : lead.status === "listo"
                                  ? "bg-green-500/20 text-green-400"
                                  : lead.status === "cerrado"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {lead.status === "enConversacion"
                                ? "En Conversación"
                                : lead.status === "clienteCaliente"
                                ? "Cliente Caliente"
                                : lead.status || "Sin estado"}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {new Date(lead.created_at).toLocaleDateString("es-MX")}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground/80 mt-3 line-clamp-2">
                          {lead.problem}
                        </p>

                        {lead.selected_cards && lead.selected_cards.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {lead.selected_cards.map((card, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                              >
                                {card}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gold/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-serif text-gold mb-1 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Portal Maestro
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Gestión de almas y conexiones espirituales
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Botón Perfil */}
                  <button
                    onClick={() => router.push("/Suafazon/perfil")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">Perfil</span>
                  </button>

                  {/* Botón Cerrar Sesión */}
                  <button
                    onClick={async () => {
                      if (confirm("¿Cerrar sesión?")) {
                        await AuthService.signOut();
                        router.push("/Suafazon");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Salir</span>
                  </button>
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