import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Users, MessageSquare, Archive, Star, Trash2, Menu, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/notificationService";

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  country_code: string;
  problem: string;
  selected_card_id: string;
  status: string;
  created_at: string;
  is_favorite: boolean;
  last_message_at?: string;
};

type FilterType = "all" | "ready" | "archive";

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/Suafazon");
      return;
    }

    loadLeads();

    const interval = setInterval(() => {
      console.log("🔄 [POLLING] Actualizando leads...");
      loadLeads();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

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

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminProfile");
    router.push("/Suafazon");
  };

  const handleEnableNotifications = async () => {
    const success = await notificationService.enable({
      onLeadClick: (leadId) => {
        router.push(`/Suafazon/chat/${leadId}`);
      },
      onMessageClick: (leadId) => {
        router.push(`/Suafazon/chat/${leadId}`);
      },
    });

    if (success) {
      setNotificationsEnabled(true);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const selectAll = () => {
    const visibleLeadIds = getFilteredLeads().map((lead) => lead.id);
    setSelectedLeads(visibleLeadIds);
  };

  const deselectAll = () => {
    setSelectedLeads([]);
  };

  const updateLeadStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .in("id", selectedLeads);

      if (error) {
        console.error("Error actualizando estado:", error);
        return;
      }

      loadLeads();
      deselectAll();
    } catch (err) {
      console.error("Error en updateLeadStatus:", err);
    }
  };

  const toggleFavorite = async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ is_favorite: !lead.is_favorite })
        .eq("id", leadId);

      if (error) {
        console.error("Error actualizando favorito:", error);
        return;
      }

      loadLeads();
    } catch (err) {
      console.error("Error en toggleFavorite:", err);
    }
  };

  const getFilteredLeads = () => {
    return leads.filter((lead) => {
      if (filter === "ready") return lead.status === "ready";
      if (filter === "archive") return lead.status === "archived";
      return lead.status !== "archived";
    });
  };

  const stats = {
    total: leads.filter((l) => l.status !== "archived").length,
    ready: leads.filter((l) => l.status === "ready").length,
    archived: leads.filter((l) => l.status === "archived").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">Nuevo</Badge>;
      case "ready":
        return <Badge className="bg-green-500">Listo</Badge>;
      case "archived":
        return <Badge className="bg-gray-500">Archivado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-card border-r border-border transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🔮</span>
            <h2 className="text-lg font-serif text-gold">Portal Maestro</h2>
          </div>

          {/* Filtros */}
          <div className="space-y-2 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                filter === "all" ? "bg-gold text-background" : "hover:bg-muted"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>LEADS</span>
              <Badge className="ml-auto">{stats.total}</Badge>
            </button>

            <button
              onClick={() => setFilter("ready")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                filter === "ready" ? "bg-green-500 text-white" : "hover:bg-muted"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>LISTO</span>
              <Badge className="ml-auto">{stats.ready}</Badge>
            </button>

            <button
              onClick={() => setFilter("archive")}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                filter === "archive" ? "bg-red-500 text-white" : "hover:bg-muted"
              }`}
            >
              <Archive className="h-4 w-4" />
              <span>PAPELERA</span>
              <Badge className="ml-auto">{stats.archived}</Badge>
            </button>
          </div>

          {/* Acciones rápidas */}
          {selectedLeads.length > 0 && (
            <div className="space-y-2 mb-4">
              <button
                onClick={selectAll}
                className="w-full px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80"
              >
                ✅ Seleccionar todo
              </button>
              <button
                onClick={deselectAll}
                className="w-full px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80"
              >
                ❌ Deseleccionar
              </button>
            </div>
          )}

          {/* Estado del ritual */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium mb-3">ESTADO DEL RITUAL</h3>
            <div className="flex gap-2 mb-4">
              <Badge className="bg-gold">Hoy</Badge>
              <Badge variant="outline">Nuevo</Badge>
            </div>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 flex items-center gap-2">
                💬 En Chat
              </button>
              <button className="w-full px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Favoritos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-serif text-gold">Portal Maestro</h1>
                <p className="text-sm text-muted-foreground">
                  Gestión de almas y consultas espirituales
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={loadLeads} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>

              {notificationService.isSupported() && !notificationsEnabled && (
                <Button onClick={handleEnableNotifications} variant="outline" size="sm">
                  🔔 Activar Notificaciones
                </Button>
              )}

              <Button onClick={() => router.push("/Suafazon/perfil")} variant="outline" size="sm">
                👤 Perfil
              </Button>

              <Button onClick={handleLogout} variant="destructive" size="sm">
                🚪 Salir
              </Button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-6 bg-muted/30">
          <div className="flex gap-4 mb-4">
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads Cargados</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Filtrados</p>
                    <p className="text-2xl font-bold text-green-500">{getFilteredLeads().length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-gold">{leads.length}</p>
                  </div>
                  <Archive className="h-8 w-8 text-gold" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones masivas */}
          {selectedLeads.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Button onClick={() => updateLeadStatus("ready")} variant="outline" size="sm">
                ✅ Marcar como Listo ({selectedLeads.length})
              </Button>
              <Button onClick={() => updateLeadStatus("archived")} variant="outline" size="sm">
                🗑️ Archivar ({selectedLeads.length})
              </Button>
            </div>
          )}
        </div>

        {/* Lista de leads */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {getFilteredLeads().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay leads con los filtros aplicados</p>
            </div>
          ) : (
            getFilteredLeads().map((lead) => (
              <Card
                key={lead.id}
                className={`${
                  selectedLeads.includes(lead.id) ? "ring-2 ring-gold" : ""
                } hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {lead.name}
                              <button onClick={() => toggleFavorite(lead.id)}>
                                <Star
                                  className={`h-4 w-4 ${
                                    lead.is_favorite ? "fill-gold text-gold" : "text-muted-foreground"
                                  }`}
                                />
                              </button>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              📱 {lead.country_code} {lead.whatsapp}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(lead.status)}
                          <Badge variant="outline">{lead.selected_card_id}</Badge>
                        </div>
                      </div>

                      <p className="text-sm mb-3 text-muted-foreground">
                        Registrado: {new Date(lead.created_at).toLocaleString("es-ES")}
                      </p>

                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium mb-1">CONSULTA:</p>
                        <p className="text-sm">{lead.problem}</p>
                      </div>

                      <Button
                        onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                        className="w-full bg-gold hover:bg-gold/90 text-background"
                      >
                        💬 Ver Chat Completo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}