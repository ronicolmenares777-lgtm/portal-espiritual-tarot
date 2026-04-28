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

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type Lead = LeadRow;

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

  const [activeTab, setActiveTab] = useState<"leads" | "listo" | "papelera">("leads");
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
  
  // Filtrar leads según tab activo y filtro de estado
  const filteredLeads = leads.filter((lead) => {
    // Filtrar por tab activo
    let tabMatch = false;
    
    switch (activeTab) {
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

    // Filtrar por estado del ritual seleccionado
    if (selectedStatus !== "todos") {
      const statusMatch = lead.status === selectedStatus;
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

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        console.log("🔄 Cargando leads desde Supabase...");

        // Obtener solo leads activos (no eliminados)
        const { data: allLeads, error: leadsError } = await LeadService.getActive();
        
        if (leadsError) {
          console.error("❌ Error cargando leads:", leadsError);
          throw leadsError;
        }

        console.log("✅ Leads activos obtenidos:", allLeads?.length || 0);
        if (allLeads && allLeads.length > 0) {
          console.log("📋 Primeros 3 leads:", allLeads.slice(0, 3).map(l => ({
            id: l.id,
            name: l.name,
            status: l.status,
            created: new Date(l.created_at).toLocaleString()
          })));
        }

        if (allLeads) {
          setLeads(allLeads);
        }

        // Obtener leads eliminados para papelera
        const { data: trashedLeads } = await LeadService.getDeleted();
        if (trashedLeads) {
          setDeletedLeads(trashedLeads);
          console.log("🗑️ Leads en papelera:", trashedLeads.length);
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fatal en loadData:", err);
        setLoading(false);
      }
    };

    loadData();

    // Suscribirse a cambios en leads
    console.log("🔌 Configurando suscripción en tiempo real...");
    const leadsSubscription = supabase
      .channel("leads-dashboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("🔔 Cambio detectado en leads:", payload.eventType);
          console.log("📦 Payload:", payload.new || payload.old);
          loadData();
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado de suscripción realtime:", status);
      });

    return () => {
      console.log("🔌 Cerrando suscripción realtime...");
      leadsSubscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <SEO 
        title="Dashboard - Portal Espiritual Admin"
        description="Panel de administración para gestionar leads y consultas espirituales"
      />
      
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
                    setActiveTab("leads");
                    setSidebarOpen(false);
                  }}
                  className={`w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl font-semibold transition-all text-left flex items-center justify-between group ${
                    activeTab === "leads"
                      ? "bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-400 border-2 border-blue-500/40 shadow-lg shadow-blue-500/20"
                      : "bg-card/40 text-muted-foreground hover:bg-card/60 border border-border hover:border-blue-500/30"
                  }`}
                >
                  <span className="text-sm tracking-wider uppercase">📋 Leads</span>
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
                  <span className="text-sm tracking-wider uppercase">✅ Listo</span>
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
                    <span>Estado del Ritual</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "todos", label: "Todos", count: leads.length, icon: "📊" },
                      { id: "nuevo", label: "Nuevo", count: leads.filter(l => l.status === "nuevo").length, icon: "🆕" },
                      { id: "enConversacion", label: "En Chat", count: leads.filter(l => l.status === "enConversacion").length, icon: "💬" },
                      { id: "clienteCaliente", label: "Caliente", count: leads.filter(l => l.status === "clienteCaliente").length, icon: "🔥" },
                      { id: "listo", label: "Listo", count: leads.filter(l => l.status === "listo").length, icon: "✅" },
                      { id: "cerrado", label: "Cerrado", count: leads.filter(l => l.status === "cerrado").length, icon: "🔒" },
                      { id: "perdido", label: "Perdido", count: leads.filter(l => l.status === "perdido").length, icon: "❌" },
                    ].map(status => (
                      <button
                        key={status.id}
                        onClick={() => {
                          setSelectedStatus(status.id);
                          setSidebarOpen(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          selectedStatus === status.id
                            ? "bg-gold/20 text-gold border-2 border-gold/40 shadow-lg shadow-gold/20"
                            : "bg-card/40 text-muted-foreground hover:bg-card/60 border border-border hover:border-gold/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">{status.icon}</span>
                          <div className="flex flex-col items-end">
                            <span className="text-xs">{status.label}</span>
                            <span className="text-xs opacity-70">({status.count})</span>
                          </div>
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
            {/* Área principal mejorada */}
            <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden relative">
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
                    <div className="mt-2 text-xs text-primary/70 font-mono">
                      📊 {leads.length} leads cargados | Filtrados: {filteredLeads.length} | Tab: {activeTab}
                    </div>
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

              {/* Tabs de navegación en área principal */}
              <div className="bg-card/40 border border-gold/10 rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6 shadow-lg shadow-black/30 shrink-0">
                <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <button
                    onClick={() => {
                      setActiveTab("leads");
                      setSelectedStatus("todos");
                      deselectAll();
                    }}
                    className={`w-full px-2 lg:px-6 py-3 rounded-xl font-medium transition-all text-xs lg:text-sm ${
                      activeTab === "leads"
                        ? "bg-blue-500/20 text-blue-400 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20 scale-105 z-10"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent hover:border-blue-500/20"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold tracking-wider">📋 LEADS</span>
                      <span className="opacity-70">
                        ({leads.filter(l => l.status === "nuevo").length})
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("listo");
                      setSelectedStatus("todos");
                      deselectAll();
                    }}
                    className={`w-full px-2 lg:px-6 py-3 rounded-xl font-medium transition-all text-xs lg:text-sm ${
                      activeTab === "listo"
                        ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 scale-105 z-10"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent hover:border-emerald-500/20"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold tracking-wider">✅ LISTO</span>
                      <span className="opacity-70">
                        ({leads.filter(l => l.status === "listo").length})
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("papelera");
                      setSelectedStatus("todos");
                      deselectAll();
                    }}
                    className={`w-full px-2 lg:px-6 py-3 rounded-xl font-medium transition-all text-xs lg:text-sm ${
                      activeTab === "papelera"
                        ? "bg-red-500/20 text-red-400 border-2 border-red-500/50 shadow-lg shadow-red-500/20 scale-105 z-10"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent hover:border-red-500/20"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold tracking-wider">🗑️ PAPELERA</span>
                      <span className="opacity-70">
                        ({deletedLeads.length})
                      </span>
                    </div>
                  </button>
                </div>

                {/* Barra de acciones */}
                {activeTab !== "papelera" && (
                  <div className="border-t border-gold/10 pt-4 lg:pt-6">
                    <div className="flex gap-2 lg:gap-3 items-center flex-wrap justify-between">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={selectAll}
                          className="flex-1 sm:flex-none px-3 lg:px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all hover:scale-105 text-xs lg:text-sm font-semibold border border-primary/30 shadow-md whitespace-nowrap"
                        >
                          ✅ Seleccionar todo
                        </button>
                        <button
                          onClick={deselectAll}
                          className="flex-1 sm:flex-none px-3 lg:px-5 py-2.5 bg-secondary/30 hover:bg-secondary/50 text-foreground rounded-xl transition-all hover:scale-105 text-xs lg:text-sm font-semibold border border-border shadow-md whitespace-nowrap"
                        >
                          ❌ Deseleccionar
                        </button>
                      </div>

                      {selectedLeads.size > 0 && (
                        <div className="flex gap-2 lg:gap-3 items-center w-full sm:w-auto mt-2 sm:mt-0">
                          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/40 rounded-xl px-3 py-2 shadow-md">
                            <span className="text-xs lg:text-sm text-foreground font-bold whitespace-nowrap">
                              {selectedLeads.size} seleccionado(s)
                            </span>
                          </div>
                          <button
                            onClick={moveSelectedToTrash}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all hover:scale-105 text-xs lg:text-sm font-bold flex items-center justify-center gap-2 border-2 border-red-500/40 shadow-lg shadow-red-500/20 whitespace-nowrap"
                          >
                            <span>🗑️</span>
                            <span>Mover a papelera</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de leads */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 lg:space-y-4 pb-20">
                {loading ? (
                  <div className="text-center py-16 bg-card/30 border border-border rounded-2xl">
                    <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-3 border-primary"></div>
                    <p className="mt-6 text-muted-foreground font-medium">Cargando leads...</p>
                  </div>
                ) : activeTab === "papelera" ? (
                  deletedLeads.length === 0 ? (
                    <div className="text-center py-16 bg-card/30 border border-red-500/20 rounded-2xl">
                      <div className="text-6xl mb-4">🗑️</div>
                      <p className="text-muted-foreground font-medium">No hay leads en la papelera</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">Los leads eliminados aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="space-y-3 lg:space-y-4">
                      {deletedLeads.map((lead) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-card/50 border-2 border-red-500/30 rounded-2xl p-4 lg:p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all hover:border-red-500/50"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-lg border-2 border-red-500/30">
                                  {lead.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-base lg:text-lg text-foreground truncate">{lead.name}</h3>
                                  <p className="text-xs lg:text-sm text-muted-foreground truncate">
                                    {lead.country_code} {lead.whatsapp}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs lg:text-sm text-muted-foreground/80 line-clamp-2 bg-secondary/20 rounded-lg p-3 border border-border">
                                {lead.problem}
                              </p>
                              <div className="mt-3 flex items-center gap-2 text-[10px] lg:text-xs text-red-400 bg-red-500/10 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 border border-red-500/30 w-fit">
                                <span>🗑️</span>
                                <span className="truncate">Eliminado: {new Date(lead.deleted_at!).toLocaleDateString("es-MX")}</span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <button
                                onClick={() => restoreFromTrash(lead.id)}
                                className="flex-1 sm:flex-none px-4 lg:px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all hover:scale-105 text-xs lg:text-sm font-semibold border border-primary/30 shadow-md flex items-center justify-center gap-2"
                              >
                                <span>↩️</span>
                                <span>Restaurar</span>
                              </button>
                              <button
                                onClick={() => deletePermanently(lead.id)}
                                className="flex-1 sm:flex-none px-4 lg:px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all hover:scale-105 text-xs lg:text-sm font-semibold border border-red-500/30 shadow-md flex items-center justify-center gap-2"
                              >
                                <span>🗑️</span>
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-16 bg-card/30 border border-border rounded-2xl">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-muted-foreground font-medium text-lg mb-2">
                      {activeTab === "leads" && "No hay leads nuevos"}
                      {activeTab === "listo" && "No hay leads listos"}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Los nuevos leads aparecerán automáticamente aquí
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:space-y-4">
                    {filteredLeads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-card/50 border-2 rounded-2xl p-4 lg:p-6 hover:shadow-xl transition-all ${
                          selectedLeads.has(lead.id) 
                            ? "border-primary shadow-xl shadow-primary/30" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3 lg:gap-4">
                          <div className="pt-1 shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedLeads.has(lead.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectLead(lead.id);
                              }}
                              className="w-5 h-5 lg:w-6 lg:h-6 rounded-lg border-2 border-primary/50 bg-transparent checked:bg-primary checked:border-primary cursor-pointer transition-all"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div 
                              className="flex items-start gap-3 mb-4 cursor-pointer"
                              onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                            >
                              <div className="w-14 h-14 lg:w-16 lg:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-xl lg:text-2xl border-2 border-primary/40 shadow-lg">
                                {lead.name.charAt(0).toUpperCase()}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg lg:text-xl text-foreground mb-1">
                                  {lead.name}
                                </h3>
                                <div className="flex flex-col gap-1">
                                  <p className="text-sm lg:text-base text-muted-foreground flex items-center gap-2">
                                    <span className="text-primary">📱</span>
                                    <span className="font-mono">{lead.country_code} {lead.whatsapp}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground/70">
                                    Registrado: {new Date(lead.created_at).toLocaleDateString("es-MX", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Badge de estado */}
                              <span
                                className={`shrink-0 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-bold border-2 whitespace-nowrap ${
                                  lead.status === "nuevo"
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                    : lead.status === "enConversacion"
                                    ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                                    : lead.status === "clienteCaliente"
                                    ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                                    : lead.status === "listo"
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                    : lead.status === "cerrado"
                                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                                    : lead.status === "perdido"
                                    ? "bg-gray-500/20 text-gray-400 border-gray-500/50"
                                    : "bg-muted/20 text-muted-foreground border-muted/50"
                                }`}
                              >
                                {lead.status === "nuevo" ? "Nuevo"
                                  : lead.status === "enConversacion" ? "En Chat"
                                  : lead.status === "clienteCaliente" ? "Caliente"
                                  : lead.status === "listo" ? "Listo"
                                  : lead.status === "cerrado" ? "Cerrado"
                                  : lead.status === "perdido" ? "Perdido"
                                  : "Sin Estado"}
                              </span>
                            </div>

                            <div className="bg-secondary/20 rounded-xl p-4 border border-border mb-3">
                              <p className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-2 font-semibold">
                                Consulta:
                              </p>
                              <p className="text-sm lg:text-base text-foreground leading-relaxed">
                                {lead.problem}
                              </p>
                            </div>

                            {Array.isArray(lead.cards_selected) && lead.cards_selected.length > 0 && (
                              <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 mb-3">
                                <p className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-2 font-semibold">
                                  Cartas:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {lead.cards_selected.map((card, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs lg:text-sm bg-primary/20 text-primary px-3 py-1.5 rounded-lg font-bold border border-primary/40"
                                    >
                                      🎴 {String(card)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                              className="w-full px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 text-primary rounded-xl transition-all hover:scale-[1.02] text-sm font-bold border border-primary/40 shadow-md flex items-center justify-center gap-2"
                            >
                              <span>💬</span>
                              <span>Ver Chat Completo</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}