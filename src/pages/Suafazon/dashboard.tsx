import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, LogOut, User, Trash2, Download, Bell, BellOff } from "lucide-react";
import { motion } from "framer-motion";
import { notificationService } from "@/services/notificationService";

export default function Dashboard() {
  const [leads, setLeads] = useState<Tables<"leads">[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<"leads" | "listo" | "papelera">("leads");
  const [ritualFilter, setRitualFilter] = useState<"all" | "nuevo" | "enChat" | "favorito">("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  // Auto-activar notificaciones si ya estaban habilitadas
  useEffect(() => {
    const checkNotifications = async () => {
      if (notificationService.isSupported()) {
        const activated = await notificationService.autoEnable({
          onLeadClick: (leadId) => {
            router.push(`/Suafazon/chat/${leadId}`);
          },
          onMessageClick: (leadId) => {
            router.push(`/Suafazon/chat/${leadId}`);
          },
        });

        setNotificationsEnabled(activated);
      }
    };

    checkNotifications();
  }, [router]);

  // Auto-refresh cada 10 segundos + Realtime subscriptions
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/Suafazon");
      return;
    }

    // Polling cada 10 segundos
    const interval = setInterval(() => {
      console.log("🔄 [POLLING] Actualizando leads...");
      loadLeads();
    }, 10000);

    // Realtime subscription para nuevos leads
    const subscription = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('🔔 [REALTIME] Cambio detectado en leads:', payload);
          loadLeads(); // Recargar leads al detectar cambios
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [router]);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando leads:", error);
        return;
      }

      if (data) {
        console.log(`✅ [LEADS] Cargados ${data.length} leads`);
        setLeads(data);
      }
    } catch (err) {
      console.error("Error en loadLeads:", err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeads();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Desactivar
      notificationService.disable();
      setNotificationsEnabled(false);
    } else {
      // Activar
      const success = await notificationService.enable({
        onLeadClick: (leadId) => {
          router.push(`/Suafazon/chat/${leadId}`);
        },
        onMessageClick: (leadId) => {
          router.push(`/Suafazon/chat/${leadId}`);
        },
      });

      setNotificationsEnabled(success);

      if (!success) {
        alert(
          "No se pudo activar las notificaciones. Por favor, permite las notificaciones en la configuración de tu navegador."
        );
      }
    }
  };

  const handleToggleFavorite = async (leadId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: !currentFavorite })
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, is_favorite: !currentFavorite } : lead
        )
      );
    }
  };

  const handleMoveToTrash = async (leadIds: string[]) => {
    const { error } = await supabase
      .from("leads")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", leadIds);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          leadIds.includes(lead.id) ? { ...lead, deleted_at: new Date().toISOString() } : lead
        )
      );
      setSelectedLeads([]);
    }
  };

  const handleRestoreFromTrash = async (leadId: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ deleted_at: null })
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, deleted_at: null } : lead
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-500/90 hover:bg-blue-500 text-white";
      case "enConversacion":
        return "bg-yellow-500/90 hover:bg-yellow-500 text-white";
      case "atendido":
        return "bg-green-500/90 hover:bg-green-500 text-white";
      default:
        return "bg-gray-500/90 hover:bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "nuevo":
        return "Nuevo";
      case "enConversacion":
        return "En Chat";
      case "atendido":
        return "Atendido";
      default:
        return status;
    }
  };

  const filteredLeads = leads.filter((lead) => {
    // Filtro de búsqueda
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.whatsapp.includes(searchQuery);

    // Filtro de vista (LEADS, LISTO, PAPELERA)
    let matchesView = true;
    if (currentView === "leads") {
      matchesView = lead.deleted_at === null && lead.status !== "atendido";
    } else if (currentView === "listo") {
      matchesView = lead.deleted_at === null && lead.status === "atendido";
    } else if (currentView === "papelera") {
      matchesView = lead.deleted_at !== null;
    }

    // Filtro de estado del ritual
    let matchesRitual = true;
    if (ritualFilter === "nuevo") {
      matchesRitual = lead.status === "nuevo";
    } else if (ritualFilter === "enChat") {
      matchesRitual = lead.status === "enConversacion";
    } else if (ritualFilter === "favorito") {
      matchesRitual = lead.is_favorite === true;
    }

    return matchesSearch && matchesView && matchesRitual;
  });

  const handleSelectAll = () => {
    setSelectedLeads(filteredLeads.map(l => l.id));
  };

  const handleDeselectAll = () => {
    setSelectedLeads([]);
  };

  const handleToggleSelect = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const activeLeads = leads.filter(l => l.deleted_at === null);
  const newLeads = activeLeads.filter(l => l.status === "nuevo");
  const inConversationLeads = activeLeads.filter(l => l.status === "enConversacion");
  const attendedLeads = activeLeads.filter(l => l.status === "atendido");
  const trashedLeads = leads.filter(l => l.deleted_at !== null);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <span className="text-gold text-xl">✦</span>
          </div>
          <h1 className="font-serif text-lg text-gold">Portal Maestro</h1>
        </div>

        {/* Filtros principales */}
        <div className="space-y-2">
          {notificationsEnabled && (
            <div className="mb-3 p-3 bg-gold/10 border border-gold/30 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-gold">
                <Bell className="w-4 h-4 animate-pulse" />
                <span className="font-medium">Notificaciones activas</span>
              </div>
              <p className="text-xs text-gold/70 mt-1">
                Recibirás alertas de nuevos leads y mensajes
              </p>
            </div>
          )}

          <Button
            variant={currentView === "leads" ? "default" : "ghost"}
            onClick={() => setCurrentView("leads")}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              📋 LEADS
            </span>
            <span className="text-xs">{activeLeads.length}</span>
          </Button>

          <Button
            variant={currentView === "listo" ? "default" : "ghost"}
            onClick={() => setCurrentView("listo")}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              ✅ LISTO
            </span>
            <span className="text-xs">{attendedLeads.length}</span>
          </Button>

          <Button
            variant={currentView === "papelera" ? "default" : "ghost"}
            onClick={() => setCurrentView("papelera")}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              🗑️ PAPELERA
            </span>
            <span className="text-xs">{trashedLeads.length}</span>
          </Button>

          <div className="h-px bg-border my-2" />

          <Button
            variant="outline"
            onClick={() => router.push("/Suafazon/monitoreo")}
            className="w-full justify-start"
          >
            <span className="flex items-center gap-2">
              📊 MONITOREO
            </span>
          </Button>
        </div>

        {/* Botones de selección */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="w-full text-xs"
          >
            ☑️ Seleccionar todo
          </Button>
          <Button
            variant="outline"
            onClick={handleDeselectAll}
            className="w-full text-xs"
          >
            ❌ Deseleccionar
          </Button>
        </div>

        {/* Estado del ritual */}
        <div className="space-y-3">
          <button className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span>📊</span>
            <span>ESTADO DEL RITUAL</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={ritualFilter === "all" ? "default" : "outline"}
              onClick={() => setRitualFilter("all")}
              className="text-xs h-9"
            >
              <span className="mr-1">📋</span>
              Todos
            </Button>
            <Button
              variant={ritualFilter === "nuevo" ? "default" : "outline"}
              onClick={() => setRitualFilter("nuevo")}
              className="text-xs h-9"
            >
              <span className="mr-1">🆕</span>
              Nuevo
            </Button>
            <Button
              variant={ritualFilter === "enChat" ? "default" : "outline"}
              onClick={() => setRitualFilter("enChat")}
              className="text-xs h-9"
            >
              <span className="mr-1">💬</span>
              En Chat
            </Button>
            <Button
              variant={ritualFilter === "favorito" ? "default" : "outline"}
              onClick={() => setRitualFilter("favorito")}
              className="text-xs h-9"
            >
              <span className="mr-1">⭐</span>
              Favoritos
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gold mb-1 sm:mb-2">Portal Maestro</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestión de almas y consultas espirituales</p>
            <div className="flex gap-3 sm:gap-6 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
              <span>📊 {leads.filter(l => l.deleted_at === null).length}</span>
              <span className="hidden sm:inline">✅ Filtrados: {filteredLeads.length}</span>
              <span className="hidden sm:inline">🗑️ Total: {leads.length} leads</span>
            </div>
          </div>
          
          <div className="flex gap-2 sm:gap-3 items-center">
            {/* Botón de notificaciones - SIEMPRE VISIBLE FORZADO */}
            <Button
              onClick={handleToggleNotifications}
              variant={notificationsEnabled ? "default" : "outline"}
              size="icon"
              className={`${
                notificationsEnabled
                  ? "bg-gold/90 hover:bg-gold text-background"
                  : ""
              }`}
              title={notificationsEnabled ? "Notificaciones activadas" : "Activar notificaciones"}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                size="icon"
                className="sm:w-auto sm:px-4"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Perfil</span>
              </Button>
              
              {/* Menú desplegable de perfil */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-lg shadow-xl z-50">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        router.push("/Suafazon/perfil");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent/10 rounded-md transition-colors text-left"
                    >
                      <User className="h-4 w-4" />
                      Editar Perfil
                    </button>
                    <button
                      onClick={() => {
                        router.push("/Suafazon/monitoreo");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent/10 rounded-md transition-colors text-left"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Monitoreo
                    </button>
                    <button
                      onClick={() => {
                        // Exportar leads a CSV
                        const csv = leads.map(l => `${l.name},${l.whatsapp},${l.status}`).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'leads.csv';
                        a.click();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent/10 rounded-md transition-colors text-left"
                    >
                      <Download className="h-4 w-4" />
                      Exportar Leads
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => {
                        localStorage.removeItem("adminSession");
                        router.push("/");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded-md transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem("adminSession");
                router.push("/");
              }}
              size="icon"
              className="sm:w-auto sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Salir</span>
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-500/20 border-2 border-blue-500/40 rounded-xl p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-blue-400">{activeLeads.length}</div>
            <div className="text-xs sm:text-sm text-blue-300 mt-1">📋 LEADS</div>
          </div>
          <div className="bg-green-500/20 border-2 border-green-500/40 rounded-xl p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-green-400">{attendedLeads.length}</div>
            <div className="text-xs sm:text-sm text-green-300 mt-1">✅ LISTO</div>
          </div>
          <div className="bg-red-500/20 border-2 border-red-500/40 rounded-xl p-2 sm:p-4 text-center">
            <div className="text-xl sm:text-3xl font-bold text-red-400">{trashedLeads.length}</div>
            <div className="text-xs sm:text-sm text-red-300 mt-1">🗑️ PAPELERA</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="flex-1 text-xs sm:text-sm px-2 sm:px-4"
          >
            ✅ Seleccionar
          </Button>
          <Button
            variant="outline"
            onClick={handleDeselectAll}
            className="flex-1 text-xs sm:text-sm px-2 sm:px-4"
          >
            ❌ Deseleccionar
          </Button>
          
          {/* Botón de papelera - solo visible cuando hay seleccionados */}
          {selectedLeads.length > 0 && (
            <Button
              variant="destructive"
              onClick={async () => {
                for (const leadId of selectedLeads) {
                  await supabase
                    .from("leads")
                    .update({ deleted_at: new Date().toISOString() })
                    .eq("id", leadId);
                }
                setSelectedLeads([]);
                loadLeads();
              }}
              className="flex-1 text-xs sm:text-sm px-2 sm:px-4"
            >
              🗑️ ({selectedLeads.length})
            </Button>
          )}
        </div>

        {/* Leads list */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay leads en esta categoría
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/60 border-2 border-gold/20 rounded-xl p-3 sm:p-6 hover:border-gold/40 transition-all"
              >
                <div className="flex items-start gap-2 sm:gap-4">
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleToggleSelect(lead.id)}
                    className="mt-1"
                  />

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-gold/30">
                    <AvatarFallback className="bg-gold/20 text-gold text-base sm:text-lg font-bold">
                      {lead.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-foreground truncate">
                        {lead.name}
                      </h3>
                      <button
                        onClick={() => handleToggleFavorite(lead.id, lead.is_favorite || false)}
                        className="flex-shrink-0"
                      >
                        <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${lead.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">
                      📱 {lead.country_code} {lead.whatsapp}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {new Date(lead.created_at).toLocaleDateString("es-MX", { 
                        day: "2-digit", 
                        month: "2-digit", 
                        year: "numeric" 
                      })} - {new Date(lead.created_at).toLocaleTimeString("es-MX", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">CONSULTA:</div>
                      <p className="text-xs sm:text-sm text-foreground/90 line-clamp-2">{lead.problem}</p>
                    </div>
                    
                    {currentView === "papelera" ? (
                      <Button
                        onClick={() => handleRestoreFromTrash(lead.id)}
                        className="w-full text-xs sm:text-sm bg-green-500/90 hover:bg-green-500"
                        size="sm"
                      >
                        ♻️ Restaurar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                        className="w-full text-xs sm:text-sm bg-gradient-to-r from-gold/80 to-accent/80 hover:from-gold hover:to-accent"
                        size="sm"
                      >
                        💬 Ver Chat
                      </Button>
                    )}
                  </div>

                  {/* Status */}
                  {lead.deleted_at === null && (
                    <Button
                      size="sm"
                      className={`${getStatusColor(lead.status)} text-xs hidden sm:flex`}
                    >
                      {getStatusText(lead.status)}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}