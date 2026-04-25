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
import Link from "next/link";

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
      const { data: allLeads } = await LeadService.getActive();
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
      const { data: allLeads } = await LeadService.getActive();
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

  // Logout handler
  const handleLogout = async () => {
    await AuthService.signOut();
    router.replace("/Suafazon");
  };

  // Profile functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData({ ...profileData, avatar: url });
    }
  };

  const handleSaveProfile = () => {
    setShowProfile(false);
  };

  // Proteger ruta - redirige a login si no está autenticado
  // useRequireAuth("/Suafazon");
  
  // Filtrar leads según tab activo y filtro de estado
  const filteredLeads = leads.filter((lead) => {
    // Filtrar por tab activo
    let tabMatch = false;
    
    switch (activeTab) {
      case "chats":
        tabMatch = ["enConversacion", "caliente", "clienteCaliente"].includes(lead.status || "");
        break;
      case "leads":
        tabMatch = lead.status === "nuevo";
        break;
      case "listo":
        tabMatch = lead.status === "listo";
        break;
      case "papelera":
        // La papelera usa deletedLeads, no este filtro
        tabMatch = false;
        break;
      default:
        tabMatch = true;
    }

    // Filtrar por estado seleccionado
    if (selectedStatus !== "todos") {
      const statusMatch = selectedStatus === "caliente" 
        ? ["caliente", "clienteCaliente"].includes(lead.status || "")
        : lead.status === selectedStatus;
      return tabMatch && statusMatch;
    }

    return tabMatch;
  });

  // Logs para debugging
  useEffect(() => {
    console.log("📊 Dashboard Estado:");
    console.log("  - Active Tab:", activeTab);
    console.log("  - Total Leads:", leads.length);
    console.log("  - Filtered Leads:", filteredLeads.length);
    console.log("  - Deleted Leads:", deletedLeads.length);
    console.log("  - Selected Status:", selectedStatus);
  }, [activeTab, leads.length, filteredLeads.length, deletedLeads.length, selectedStatus]);

  // Contadores para tabs
  const statusCounts = {
    nuevo: leads.filter(l => l.status === "nuevo").length,
    enConversacion: leads.filter(l => l.status === "enConversacion").length,
    clienteCaliente: leads.filter(l => ["caliente", "clienteCaliente"].includes(l.status || "")).length,
    listo: leads.filter(l => l.status === "listo").length,
  };

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

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Obtener solo leads activos (no eliminados)
        const { data: allLeads, error: leadsError } = await LeadService.getActive();
        
        if (leadsError) {
          console.error("Error cargando leads:", leadsError);
          throw leadsError;
        }

        console.log("✅ Leads activos cargados:", allLeads?.length || 0);

        if (allLeads) {
          setLeads(allLeads);
        }

        // Obtener leads eliminados para papelera
        const { data: trashedLeads } = await LeadService.getDeleted();
        if (trashedLeads) {
          setDeletedLeads(trashedLeads);
          console.log("✅ Leads en papelera:", trashedLeads.length);
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
        <div className="flex h-screen overflow-hidden">
          {/* Overlay móvil */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar mejorado - Responsive */}
          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:relative
            z-50
            w-80 
            bg-gradient-to-b from-background via-secondary/10 to-background 
            border-r border-gold/10 
            flex flex-col 
            shadow-2xl 
            overflow-y-auto
            transition-transform duration-300
            h-full
          `}>
            {/* Botón cerrar móvil */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary"
            >
              ✕
            </button>

            {/* Header del sidebar */}
            <div className="p-6 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent">
              <Link href="/Suafazon/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/40 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
                <span className="font-serif text-xl font-bold bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent">
                  Portal Maestro
                </span>
              </Link>
            </div>

            {/* Navigation Tabs mejorados */}
            <div className="p-4 lg:p-6 space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab("chats");
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl font-semibold transition-all text-left flex items-center justify-between group ${
                    activeTab === "chats"
                      ? "bg-gradient-to-r from-gold/20 to-gold/10 text-gold border-2 border-gold/40 shadow-lg shadow-gold/20"
                      : "bg-card/40 text-muted-foreground hover:bg-card/60 border border-border hover:border-gold/30"
                  }`}
                >
                  <span className="text-sm tracking-wider uppercase">Chats</span>
                  <span className={`px-2.5 lg:px-3 py-1 rounded-lg text-xs font-bold ${
                    activeTab === "chats" 
                      ? "bg-gold/30 text-gold border border-gold/40" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  }`}>
                    {leads.filter(l => ["enConversacion", "caliente", "clienteCaliente"].includes(l.status || "")).length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("leads");
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl font-semibold transition-all text-left flex items-center justify-between group ${
                    activeTab === "leads"
                      ? "bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-400 border-2 border-blue-500/40 shadow-lg shadow-blue-500/20"
                      : "bg-card/40 text-muted-foreground hover:bg-card/60 border border-border hover:border-blue-500/30"
                  }`}
                >
                  <span className="text-sm tracking-wider uppercase">Leads</span>
                  <span className={`px-2.5 lg:px-3 py-1 rounded-lg text-xs font-bold ${
                    activeTab === "leads" 
                      ? "bg-blue-500/30 text-blue-400 border border-blue-500/40" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  }`}>
                    {leads.filter(l => l.status === "nuevo").length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("listo");
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl font-semibold transition-all text-left flex items-center justify-between group ${
                    activeTab === "listo"
                      ? "bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20"
                      : "bg-card/40 text-muted-foreground hover:bg-card/60 border border-border hover:border-emerald-500/30"
                  }`}
                >
                  <span className="text-sm tracking-wider uppercase">Listo</span>
                  <span className={`px-2.5 lg:px-3 py-1 rounded-lg text-xs font-bold ${
                    activeTab === "listo" 
                      ? "bg-emerald-500/30 text-emerald-400 border border-emerald-500/40" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  }`}>
                    {leads.filter(l => l.status === "listo").length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("papelera");
                    setSelectedStatus("todos");
                    deselectAll();
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl font-semibold transition-all text-left flex items-center justify-between group ${
                    activeTab === "papelera"
                      ? "bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-400 border-2 border-red-500/40 shadow-lg shadow-red-500/20"
                      : "bg-card/40 text-muted-foreground hover:bg-card/60 border border-border hover:border-red-500/30"
                  }`}
                >
                  <span className="text-sm tracking-wider uppercase flex items-center gap-2">
                    <span>🗑️</span>
                    <span>Papelera</span>
                  </span>
                  <span className={`px-2.5 lg:px-3 py-1 rounded-lg text-xs font-bold ${
                    activeTab === "papelera" 
                      ? "bg-red-500/30 text-red-400 border border-red-500/40" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  }`}>
                    {deletedLeads.length}
                  </span>
                </button>
              </div>

              {/* Botones de acción mejorados */}
              {activeTab !== "papelera" && (
                <div className="pt-3 lg:pt-4 border-t border-gold/10 space-y-2 lg:space-y-3">
                  <button
                    onClick={selectAll}
                    className="w-full px-4 lg:px-5 py-2.5 lg:py-3 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 text-primary rounded-xl transition-all hover:scale-[1.02] text-sm font-bold border border-primary/30 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    <span>Seleccionar todo</span>
                  </button>
                  
                  <button
                    onClick={deselectAll}
                    className="w-full px-4 lg:px-5 py-2.5 lg:py-3 bg-card/60 hover:bg-card/80 text-foreground rounded-xl transition-all hover:scale-[1.02] text-sm font-bold border border-border shadow-md flex items-center justify-center gap-2"
                  >
                    <span>❌</span>
                    <span>Deseleccionar</span>
                  </button>

                  {selectedLeads.size > 0 && (
                    <div className="space-y-2 lg:space-y-3 pt-2 lg:pt-3 border-t border-border">
                      <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/40 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-center">
                        <span className="text-sm text-foreground font-bold">
                          {selectedLeads.size} seleccionado(s)
                        </span>
                      </div>
                      <button
                        onClick={moveSelectedToTrash}
                        className="w-full px-4 lg:px-5 py-2.5 lg:py-3 bg-gradient-to-r from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20 text-red-400 rounded-xl transition-all hover:scale-[1.02] text-sm font-bold border-2 border-red-500/40 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                      >
                        <span>🗑️</span>
                        <span>Mover a papelera</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Filtros mejorados */}
              <div className="p-4 lg:p-6 border-t border-gold/10 bg-gradient-to-r from-background to-secondary/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase text-gold/80 mb-3">
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                  </div>

                  <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
                    {[
                      { id: "todos", label: "Todos", count: leads.length },
                      { id: "nuevo", label: "Nuevo", count: leads.filter(l => l.status === "nuevo").length },
                      { id: "enConversacion", label: "En Chat", count: leads.filter(l => l.status === "enConversacion").length },
                      { id: "caliente", label: "Caliente", count: leads.filter(l => l.status === "caliente" || l.status === "clienteCaliente").length },
                      { id: "cerrado", label: "Cerrado", count: leads.filter(l => l.status === "cerrado").length },
                      { id: "perdido", label: "Perdido", count: leads.filter(l => l.status === "perdido").length },
                    ].map(status => (
                      <button
                        key={status.id}
                        onClick={() => {
                          setSelectedStatus(status.id);
                          setSidebarOpen(false);
                        }}
                        className={`px-3 lg:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          selectedStatus === status.id
                            ? "bg-gold/20 text-gold border-2 border-gold/40 shadow-lg shadow-gold/20"
                            : "bg-card/40 text-muted-foreground hover:bg-card/60 border border-border hover:border-gold/30"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs">{status.label}</span>
                          <span className="text-xs opacity-70">({status.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header mejorado */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Área principal mejorada */}
              <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden relative">
                {/* Debug info - TEMPORAL */}
                <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
                  <p className="font-bold mb-2">🔍 DEBUG INFO:</p>
                  <p>Tab activo: <span className="text-gold">{activeTab}</span></p>
                  <p>Total leads: <span className="text-gold">{leads.length}</span></p>
                  <p>Filtered: <span className="text-gold">{filteredLeads.length}</span></p>
                  <p>Papelera: <span className="text-gold">{deletedLeads.length}</span></p>
                  <p>Loading: <span className="text-gold">{loading ? "Sí" : "No"}</span></p>
                </div>

                {/* Botón hamburguesa móvil */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-gold to-amber-500 shadow-[0_0_20px_rgba(250,214,54,0.4)] flex items-center justify-center text-background z-30 hover:scale-110 transition-transform border border-amber-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Header mejorado */}
                <div className="bg-gradient-to-r from-background via-secondary/20 to-background border border-gold/20 rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6 shadow-lg shadow-black/50 shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-serif font-bold bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent tracking-wider mb-1 sm:mb-2">
                        Portal Maestro
                      </h1>
                      <p className="text-muted-foreground/80 text-xs sm:text-sm">
                        Gestión de almas y conexiones espirituales
                      </p>
                    </div>

                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                      <Link
                        href="/Suafazon/perfil"
                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-secondary/50 hover:bg-secondary/70 text-foreground rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 border border-border shadow-md"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-medium">Perfil</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 border border-red-500/30 shadow-md"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-medium">Salir</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Área de contenido principal */}
                <div className="flex-1 overflow-hidden flex flex-col bg-background">
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
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30"
                    style={{
                      boxShadow: "0 0 30px hsl(var(--gold) / 0.4)",
                    }}
                  >
                    <img
                      src={profileData.avatar}
                      alt="Maestro"
                      className="w-full h-full object-cover rounded-full"
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